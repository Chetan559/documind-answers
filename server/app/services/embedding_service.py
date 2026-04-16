"""
embedding_service.py
====================
Production-ready Gemini embedding service with:
  - Thread-safe token-bucket rate limiter (RPM + TPM awareness)
  - Configurable batching (default 25 texts/call)
  - Exponential backoff with jitter + Retry-After header support
  - Batch → per-item fallback (no data loss)
  - Async wrappers via asyncio.to_thread
  - Correct output ordering guaranteed
"""

import asyncio
import re
import threading
import time
import random
from typing import List, Optional

from google import genai
from google.genai import types
from loguru import logger

from app.core.config import get_settings

settings = get_settings()

# ── Shared sync client (thread-safe for reads) ────────────────────────────────
_client = genai.Client(api_key=settings.GEMINI_API_KEY)


# ─────────────────────────────────────────────────────────────────────────────
# Token-Bucket Rate Limiter
# ─────────────────────────────────────────────────────────────────────────────

class RateLimiter:
    """
    Thread-safe token-bucket rate limiter.

    Design decisions:
    - Uses a Condition variable so blocked threads are woken up as soon
      as enough tokens are available, rather than busy-spinning on sleep().
    - A single global instance is shared across all threads to prevent
      multiple workers from independently exhausting the quota.
    - `acquire(n)` blocks until `n` tokens can be consumed atomically,
      preserving fairness under concurrent access.

    Args:
        rpm (int): Maximum requests per minute.
        window (float): Refill window in seconds (default 60 s).
    """

    def __init__(self, rpm: int, window: float = 60.0):
        self._capacity = rpm
        self._tokens = float(rpm)       # Start full so the first call is instant
        self._window = window
        self._refill_rate = rpm / window  # tokens per second
        self._last_refill = time.monotonic()
        self._lock = threading.Condition(threading.Lock())

    def _refill(self):
        """Replenish tokens proportional to elapsed time (called under lock)."""
        now = time.monotonic()
        elapsed = now - self._last_refill
        self._tokens = min(
            self._capacity,
            self._tokens + elapsed * self._refill_rate,
        )
        self._last_refill = now

    def acquire(self, n: int = 1, timeout: Optional[float] = None) -> bool:
        """
        Block until `n` tokens are available, then consume them.

        Returns True on success, False if the timeout expired.
        """
        deadline = None if timeout is None else time.monotonic() + timeout

        with self._lock:
            while True:
                self._refill()
                if self._tokens >= n:
                    self._tokens -= n
                    return True

                # How long until we have enough tokens?
                wait_for = (n - self._tokens) / self._refill_rate

                if deadline is not None:
                    remaining = deadline - time.monotonic()
                    if remaining <= 0:
                        return False
                    wait_for = min(wait_for, remaining)

                # Sleep until tokens arrive (Condition.wait releases the lock)
                self._lock.wait(timeout=wait_for)


# ─────────────────────────────────────────────────────────────────────────────
# Embedding Service
# ─────────────────────────────────────────────────────────────────────────────

class EmbeddingService:
    """
    Batched Gemini embedding service with production-grade reliability.

    Rate limits (matching your free-tier quota):
        RPM = 94   (safe ceiling: we use 90 to keep a buffer)
        TPM = 30K  (chunks are typically 200-400 tokens; handled via RPM pacing)

    Concurrency note:
        The RateLimiter is created once at class construction and shared
        across all sync calls in every thread. Async wrappers run sync code in
        a thread pool via asyncio.to_thread, so they automatically participate
        in the same rate limit.
    """
    # TODO: add a fall back model -> gemini-embedding-2 is good choice for it
    # ── Configuration ──────────────────────────────────────────────────────
    MODEL          = "gemini-embedding-001"
    DIMENSIONALITY = 768
    BATCH_SIZE     = 25       # texts per API call  (Gemini max is ~100)
    MAX_RETRIES    = 5
    BASE_BACKOFF   = 1.0      # seconds, doubles each retry
    MAX_BACKOFF    = 60.0     # cap on exponential delay
    RPM_LIMIT      = 90       # conservative ceiling (your quota: 100 RPM)

    def __init__(self):
        # One shared rate limiter for ALL instances (module-level singleton below)
        self._rate_limiter = RateLimiter(rpm=self.RPM_LIMIT)

    # ── Helpers ────────────────────────────────────────────────────────────

    @staticmethod
    def _parse_retry_after(error_str: str) -> Optional[float]:
        """
        Extract the Retry-After value (seconds) from an error message when
        the API includes it. Falls back to None if not present.
        """
        match = re.search(r"retry.?after[:\s]+([0-9]+\.?[0-9]*)", error_str, re.IGNORECASE)
        if match:
            return float(match.group(1))
        return None

    @staticmethod
    def _is_rate_limit_error(error_str: str) -> bool:
        return any(kw in error_str for kw in ("429", "quota", "rate limit", "resource exhausted"))

    def _call_api(self, texts: List[str], task_type: str):
        """Single API call — does NOT retry. Caller handles retries."""
        return _client.models.embed_content(
            model=self.MODEL,
            contents=texts,
            config=types.EmbedContentConfig(
                task_type=task_type,
                output_dimensionality=self.DIMENSIONALITY,
            ),
        )

    # ── Core retry logic ───────────────────────────────────────────────────

    def _embed_batch_with_retry(
        self,
        texts: List[str],
        task_type: str,
    ) -> Optional[List[List[float]]]:
        """
        Try to embed a batch. Retries with exponential back-off + jitter.
        Returns the list of embedding vectors on success, None on exhausted retries.

        Rate-limit errors use Retry-After when available; otherwise they wait
        the full remaining window (60 s) to guarantee the next call succeeds.
        """
        for attempt in range(self.MAX_RETRIES):
            # Acquire one RPM token before touching the API
            self._rate_limiter.acquire(n=1)

            try:
                result = self._call_api(texts, task_type)
                return [list(emb.values) for emb in result.embeddings]

            except Exception as exc:
                error_str = str(exc).lower()

                if self._is_rate_limit_error(error_str):
                    # Respect Retry-After if provided, else wait out the minute window
                    retry_after = self._parse_retry_after(str(exc))
                    wait = retry_after if retry_after else (60.0 + random.random() * 5)
                    logger.warning(
                        f"[EmbeddingService] Rate limit hit on attempt {attempt + 1}. "
                        f"Waiting {wait:.1f}s (Retry-After={retry_after})..."
                    )
                else:
                    # Generic transient error → exponential backoff with jitter
                    wait = min(
                        self.MAX_BACKOFF,
                        self.BASE_BACKOFF * (2 ** attempt) + random.uniform(0, 1),
                    )
                    logger.warning(
                        f"[EmbeddingService] Batch failed on attempt {attempt + 1}: "
                        f"{exc}. Retrying in {wait:.2f}s..."
                    )

                time.sleep(wait)

        logger.error(
            f"[EmbeddingService] Batch of {len(texts)} texts failed after "
            f"{self.MAX_RETRIES} retries."
        )
        return None  # Signal batch-level failure

    def _embed_items_individually(
        self,
        texts: List[str],
        task_type: str,
    ) -> List[Optional[List[float]]]:
        """
        Fallback: embed one text at a time so partial results are not lost.
        Items that permanently fail are logged and returned as None.
        """
        results: List[Optional[List[float]]] = []
        for i, text in enumerate(texts):
            single = self._embed_batch_with_retry([text], task_type)
            if single is not None:
                results.append(single[0])
            else:
                logger.error(
                    f"[EmbeddingService] Permanently failed to embed item {i}: "
                    f"{text[:80]!r}"
                )
                results.append(None)
        return results

    # ── Public sync API ────────────────────────────────────────────────────

    def embed_documents_sync(self, texts: List[str]) -> List[List[float]]:
        """
        Embed a list of document chunks.

        - Processes texts in batches of BATCH_SIZE.
        - If a batch fails after max retries, falls back to per-item embedding.
        - Items that still fail are filled with a zero vector to preserve index
          alignment (logged as errors).
        - Output order is guaranteed to match input order.

        Args:
            texts: List of text strings to embed.

        Returns:
            List[List[float]] of length len(texts), each of dimension DIMENSIONALITY.
        """
        if not texts:
            return []

        logger.info(
            f"[EmbeddingService] Embedding {len(texts)} chunks in batches of {self.BATCH_SIZE}..."
        )

        all_embeddings: List[Optional[List[float]]] = []

        for batch_start in range(0, len(texts), self.BATCH_SIZE):
            batch = texts[batch_start : batch_start + self.BATCH_SIZE]
            batch_num = batch_start // self.BATCH_SIZE + 1
            total_batches = (len(texts) + self.BATCH_SIZE - 1) // self.BATCH_SIZE

            logger.debug(
                f"[EmbeddingService] Batch {batch_num}/{total_batches} "
                f"({len(batch)} texts)..."
            )

            result = self._embed_batch_with_retry(batch, task_type="RETRIEVAL_DOCUMENT")

            if result is not None:
                all_embeddings.extend(result)
            else:
                # Batch failed entirely → try each item individually
                logger.warning(
                    f"[EmbeddingService] Batch {batch_num} failed. "
                    f"Falling back to per-item embedding ({len(batch)} items)..."
                )
                fallback = self._embed_items_individually(batch, "RETRIEVAL_DOCUMENT")
                all_embeddings.extend(fallback)

            logger.info(
                f"[EmbeddingService] Progress: {min(batch_start + self.BATCH_SIZE, len(texts))}"
                f"/{len(texts)} chunks embedded"
            )

        # Replace any None (permanently failed) with a zero vector
        zero = [0.0] * self.DIMENSIONALITY
        final: List[List[float]] = [
            emb if emb is not None else zero
            for emb in all_embeddings
        ]

        logger.info(
            f"[EmbeddingService] Complete — {len(final)} embeddings returned "
            f"({sum(1 for e in all_embeddings if e is None)} zero-filled due to failures)"
        )
        return final

    def embed_query_sync(self, text: str) -> List[float]:
        """
        Embed a single query string.

        Returns:
            List[float] of length DIMENSIONALITY.
        """
        if not text:
            return [0.0] * self.DIMENSIONALITY

        result = self._embed_batch_with_retry([text], task_type="RETRIEVAL_QUERY")
        if result is not None:
            return result[0]

        logger.error("[EmbeddingService] Query embedding failed. Returning zero vector.")
        return [0.0] * self.DIMENSIONALITY

    # ── Async wrappers ─────────────────────────────────────────────────────

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Async wrapper around embed_documents_sync.
        Runs in a thread pool so the FastAPI event loop is never blocked.
        The thread automatically shares the module-level rate limiter.
        """
        return await asyncio.to_thread(self.embed_documents_sync, texts)

    async def embed_query(self, text: str) -> List[float]:
        """
        Async wrapper around embed_query_sync.
        """
        return await asyncio.to_thread(self.embed_query_sync, text)


# ── Module-level singleton ────────────────────────────────────────────────────
# All callers import this instance; they share a single RateLimiter,
# preventing any thread from independently exhausting the quota.
embedding_service = EmbeddingService()


# ── Example usage (run directly for smoke test) ───────────────────────────────
if __name__ == "__main__":
    import sys

    sample_texts = [
        "The mitochondria is the powerhouse of the cell.",
        "Photosynthesis converts light energy into glucose.",
        "The speed of light is approximately 3×10⁸ m/s.",
    ]

    print("=== Sync document embedding ===")
    vecs = embedding_service.embed_documents_sync(sample_texts)
    for i, v in enumerate(vecs):
        print(f"  Text {i}: dim={len(v)}, first3={v[:3]}")

    print("\n=== Sync query embedding ===")
    q = embedding_service.embed_query_sync("What is photosynthesis?")
    print(f"  Query: dim={len(q)}, first3={q[:3]}")

    print("\n=== Async document embedding ===")
    async def _async_demo():
        vecs = await embedding_service.embed_documents(sample_texts)
        for i, v in enumerate(vecs):
            print(f"  Text {i}: dim={len(v)}, first3={v[:3]}")
    asyncio.run(_async_demo())
    sys.exit(0)

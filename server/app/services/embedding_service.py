import asyncio
import time
import random
from typing import List

from google import genai
from google.genai import types
from loguru import logger

from app.core.config import get_settings

settings = get_settings()

# Sync client
_client = genai.Client(api_key=settings.GEMINI_API_KEY)


class EmbeddingService:
    def __init__(self):
        self.BATCH_SIZE = 25          # tune: 20–50 ideal
        self.RATE_DELAY = 0.7         # ~85 RPM safe margin
        self.MAX_RETRIES = 5

    # ──────────────────────────────────────────────────────────────
    # Internal retry wrapper
    # ──────────────────────────────────────────────────────────────
    def _embed_with_retry(self, batch: List[str], task_type: str):
        for attempt in range(self.MAX_RETRIES):
            try:
                return _client.models.embed_content(
                    model="gemini-embedding-001",
                    contents=batch,
                    config=types.EmbedContentConfig(
                        task_type=task_type,
                        output_dimensionality=768,
                    ),
                )
            except Exception as e:
                wait = (2 ** attempt) + random.random()
                logger.warning(
                    f"Embedding failed (attempt {attempt + 1}), retrying in {wait:.2f}s..."
                )
                time.sleep(wait)

        raise Exception("Embedding failed after max retries")

    # ──────────────────────────────────────────────────────────────
    # Sync document embedding (batched)
    # ──────────────────────────────────────────────────────────────
    def embed_documents_sync(self, texts: List[str]) -> List[List[float]]:
        logger.info(f"Embedding {len(texts)} chunks via Gemini (batched)...")

        all_embeddings = []

        for i in range(0, len(texts), self.BATCH_SIZE):
            batch = texts[i : i + self.BATCH_SIZE]

            result = self._embed_with_retry(
                batch=batch,
                task_type="RETRIEVAL_DOCUMENT",
            )

            for emb in result.embeddings:
                all_embeddings.append(list(emb.values))

            logger.info(
                f"  embedded {len(all_embeddings)}/{len(texts)} chunks"
            )

            # Rate limiting (RPM safety)
            time.sleep(self.RATE_DELAY)

        logger.info(f"Embedding complete: {len(all_embeddings)} chunks")
        return all_embeddings

    # ──────────────────────────────────────────────────────────────
    # Sync query embedding (single)
    # ──────────────────────────────────────────────────────────────
    def embed_query_sync(self, text: str) -> List[float]:
        result = self._embed_with_retry(
            batch=[text],
            task_type="RETRIEVAL_QUERY",
        )
        return list(result.embeddings[0].values)

    # ──────────────────────────────────────────────────────────────
    # Async wrappers
    # ──────────────────────────────────────────────────────────────
    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return await asyncio.to_thread(self.embed_documents_sync, texts)

    async def embed_query(self, text: str) -> List[float]:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.embed_query_sync, text)


embedding_service = EmbeddingService()


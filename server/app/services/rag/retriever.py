import asyncio
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from app.repos.document.vector_repo import vector_repo
from app.core.config import get_settings

settings = get_settings()

MIN_SCORE = 0.3   # below this score, results are likely noise


class Retriever:

    async def retrieve(
        self,
        db: AsyncSession,
        pdf_id: str,
        query: str,
        top_k: int | None = None,
    ) -> list[dict]:
        """Single-PDF retrieval (backward compat)."""
        return await self.retrieve_multi(db, [pdf_id], query, top_k)

    async def retrieve_multi(
        self,
        db: AsyncSession,
        pdf_ids: list[str],
        query: str,
        top_k: int | None = None,
    ) -> list[dict]:
        """
        Multi-PDF hybrid retrieval:
        1. Query all Qdrant collections in parallel
        2. Merge and re-rank by score
        3. If confidence is low → supplement with Postgres keyword search across all PDFs
        4. Each result tagged with its source pdf_id
        """
        k = top_k or settings.TOP_K_RETRIEVAL

        # Query all PDFs concurrently
        tasks = [vector_repo.query(pdf_id, query, top_k=k) for pdf_id in pdf_ids]
        results_per_pdf = await asyncio.gather(*tasks)

        # Tag each chunk with its source pdf_id and flatten
        all_vector: list[dict] = []
        for pdf_id, results in zip(pdf_ids, results_per_pdf):
            for r in results:
                r["source_pdf_id"] = pdf_id
                all_vector.append(r)

        logger.debug(f"Multi-PDF vector search: {len(all_vector)} results across {len(pdf_ids)} PDFs for '{query[:50]}'")

        high_conf = [r for r in all_vector if r["score"] >= MIN_SCORE]

        if len(high_conf) >= 2:
            return sorted(high_conf, key=lambda x: x["score"], reverse=True)[:k]

        # Low confidence — fall back to keyword search across all PDFs
        logger.info(f"Low confidence results, running keyword fallback across {len(pdf_ids)} PDFs")
        keyword_results = await self._keyword_search_multi(db, pdf_ids, query, top_k=k)

        return self._merge(all_vector, keyword_results, top_k=k)

    async def _keyword_search_multi(
        self,
        db: AsyncSession,
        pdf_ids: list[str],
        query: str,
        top_k: int,
    ) -> list[dict]:
        """Keyword fallback across multiple PDFs."""
        tasks = [self._keyword_search(db, pdf_id, query, top_k) for pdf_id in pdf_ids]
        results_per_pdf = await asyncio.gather(*tasks)
        merged = []
        for results in results_per_pdf:
            merged.extend(results)
        return merged

    async def _keyword_search(
        self,
        db: AsyncSession,
        pdf_id: str,
        query: str,
        top_k: int,
    ) -> list[dict]:
        from sqlalchemy import select, or_
        from app.models.chunk import Chunk

        keywords = [w.strip() for w in query.split() if len(w.strip()) > 3]
        if not keywords:
            return []

        conditions = [Chunk.text.ilike(f"%{kw}%") for kw in keywords[:5]]
        result = await db.execute(
            select(Chunk)
            .where(Chunk.pdf_id == pdf_id)
            .where(or_(*conditions))
            .limit(top_k)
        )
        chunks = result.scalars().all()

        return [
            {
                "chunk_id": c.id,
                "text": c.text,
                "page_number": c.page_number,
                "bbox": c.bbox or {"x0": 0, "y0": 0, "x1": 0, "y1": 0},
                "score": 0.2,
                "source_pdf_id": pdf_id,
            }
            for c in chunks
        ]

    def _merge(
        self,
        vector: list[dict],
        keyword: list[dict],
        top_k: int,
    ) -> list[dict]:
        seen = set()
        merged = []

        for r in vector:
            if r["chunk_id"] not in seen:
                seen.add(r["chunk_id"])
                merged.append(r)

        for r in keyword:
            if r["chunk_id"] not in seen:
                seen.add(r["chunk_id"])
                merged.append(r)

        return sorted(merged, key=lambda x: x["score"], reverse=True)[:top_k]


retriever = Retriever()
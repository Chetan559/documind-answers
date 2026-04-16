import uuid
import asyncio
from loguru import logger
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models

from app.core.config import get_settings

settings = get_settings()

class VectorRepo:
    def __init__(self):
        self._clients = {}
        self._local_client = None

    @property
    def client(self) -> AsyncQdrantClient:
        # 1. Local mode MUST be a singleton to prevent RocksDB lock errors.
        if not settings.QDRANT_URL:
            if self._local_client is None:
                self._local_client = AsyncQdrantClient(path="./qdrant_db")
            return self._local_client

        # 2. Cloud mode requires a unique HTTP client per event loop 
        #    to prevent "Event loop is closed" errors between main and background threads.
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            return AsyncQdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

        loop_id = id(loop)

        # Cleanup references to closed loops to prevent memory bloat
        closed_ids = [l_id for l_id, (l, _) in self._clients.items() if l.is_closed()]
        for l_id in closed_ids:
            del self._clients[l_id]

        if loop_id not in self._clients:
            self._clients[loop_id] = (
                loop,
                AsyncQdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
            )

        return self._clients[loop_id][1]

    async def _ensure_collection(self):
        exists = await self.client.collection_exists(settings.QDRANT_COLLECTION)
        if not exists:
            # We must specify vectors_config accurately
            await self.client.create_collection(
                collection_name=settings.QDRANT_COLLECTION,
                vectors_config=models.VectorParams(
                    size=768,
                    distance=models.Distance.COSINE,
                ),
            )
            # Create payload indexes for faster filtering
            await self.client.create_payload_index(
                collection_name=settings.QDRANT_COLLECTION,
                field_name="user_id",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
            await self.client.create_payload_index(
                collection_name=settings.QDRANT_COLLECTION,
                field_name="document_id",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
            logger.info(f"Created Qdrant collection '{settings.QDRANT_COLLECTION}' and payload indexes.")

    async def add(self, pdf_id: str, chunks: list[dict], user_id: str):
        from app.services.embedding_service import embedding_service

        await self._ensure_collection()

        texts = [c["text"] for c in chunks]
        embeddings = await embedding_service.embed_documents(texts)

        points = []
        for i, c in enumerate(chunks):
            point_id = c.get("chunk_id") or str(uuid.uuid4())
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=embeddings[i],
                    payload={
                        "user_id": user_id,
                        "document_id": pdf_id,
                        "text": c["text"],
                        "page_number": int(c.get("page_number", 1)),
                        "bbox": c.get("bbox") or {"x0": 0.0, "y0": 0.0, "x1": 0.0, "y1": 0.0},
                    },
                )
            )

        logger.info(f"Writing {len(points)} vectors to Qdrant collection '{settings.QDRANT_COLLECTION}'...")
        await self.client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)
        logger.info(f"Qdrant: stored {len(points)} vectors for PDF {pdf_id} (User: {user_id})")

    async def query(self, pdf_id: str, query_text: str, top_k: int = 5) -> list[dict]:
        from app.services.embedding_service import embedding_service

        if not await self.client.collection_exists(settings.QDRANT_COLLECTION):
            return []

        embedding = await embedding_service.embed_query(query_text)

        # Filter by document_id
        query_filter = models.Filter(
            must=[
                models.FieldCondition(
                    key="document_id",
                    match=models.MatchValue(value=pdf_id)
                )
            ]
        )

        results = await self.client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=embedding,
            limit=top_k,
            query_filter=query_filter,
            with_payload=True,
        )

        chunks = []
        for hit in results.points:
            chunks.append({
                "chunk_id": str(hit.id),
                "text": hit.payload.get("text", ""),
                "page_number": hit.payload.get("page_number", 1),
                "bbox": hit.payload.get("bbox", {"x0": 0.0, "y0": 0.0, "x1": 0.0, "y1": 0.0}),
                "score": round(hit.score, 4),
            })
        return chunks

    async def get_all(self, pdf_id: str, limit: int = 50) -> list[dict]:
        if not await self.client.collection_exists(settings.QDRANT_COLLECTION):
            return []

        query_filter = models.Filter(
            must=[
                models.FieldCondition(
                    key="document_id",
                    match=models.MatchValue(value=pdf_id)
                )
            ]
        )

        results, _ = await self.client.scroll(
            collection_name=settings.QDRANT_COLLECTION,
            scroll_filter=query_filter,
            limit=limit,
            with_payload=True,
            with_vectors=False,
        )
        return sorted([
            {
                "chunk_id": str(hit.id),
                "text": hit.payload.get("text", ""),
                "page_number": hit.payload.get("page_number", 1),
            }
            for hit in results
        ], key=lambda x: x["page_number"])

    async def delete_document(self, pdf_id: str):
        if await self.client.collection_exists(settings.QDRANT_COLLECTION):
            query_filter = models.Filter(
                must=[
                    models.FieldCondition(
                        key="document_id",
                        match=models.MatchValue(value=pdf_id)
                    )
                ]
            )
            await self.client.delete(
                collection_name=settings.QDRANT_COLLECTION,
                points_selector=models.FilterSelector(filter=query_filter)
            )
            logger.info(f"Deleted Qdrant points for PDF {pdf_id} from collection '{settings.QDRANT_COLLECTION}'")


vector_repo = VectorRepo()
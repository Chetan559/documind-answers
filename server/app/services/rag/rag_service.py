from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.repos.chat.session_repo import session_repo
from app.repos.chat.message_repo import message_repo
from app.repos.chat.citation_repo import citation_repo
from app.repos.document.document_repo import document_repo
from app.services.rag.intent_service import intent_service
from app.services.rag.retriever import retriever
from app.services.rag.citation_service import citation_service
from app.services.prompts.rag_prompts import build_rag_prompt, build_continuation_prompt
from app.services.llm_service import llm_service
from app.core.exceptions import PDFNotFoundError, PDFNotReadyError


class RAGService:

    async def chat(
        self,
        db: AsyncSession,
        pdf_id: str,
        message: str,
        session_id: str | None,
        user_id: str,
        extra_pdf_ids: list[str] | None = None,
    ) -> dict:
        """
        Chat with one or more PDFs.
        pdf_id      — primary PDF (FK in DB)
        extra_pdf_ids — additional PDFs in the room (stored as JSON in session)
        """
        # ── Validate all PDFs ─────────────────────────────────────────────────
        all_pdf_ids = [pdf_id] + [p for p in (extra_pdf_ids or []) if p != pdf_id]

        pdf_objects: dict[str, object] = {}
        for pid in all_pdf_ids:
            pdf = await document_repo.get_by_id(db, pid)
            if not pdf:
                raise PDFNotFoundError(pid)
            if pdf.status != "ready":
                raise PDFNotReadyError(pid, pdf.status)
            pdf_objects[pid] = pdf

        primary_pdf = pdf_objects[pdf_id]

        # ── Get or create chat session ────────────────────────────────────────
        session = await session_repo.get_or_create(
            db, pdf_id, user_id, session_id,
            extra_pdf_ids=[p for p in all_pdf_ids if p != pdf_id],
        )

        # ── Load conversation history ─────────────────────────────────────────
        history = await message_repo.get_history_for_llm(db, session.id)

        # ── Detect intent ─────────────────────────────────────────────────────
        intent = await intent_service.detect(message, history)
        logger.info(f"Intent: {intent} — '{message[:60]}' across {len(all_pdf_ids)} PDFs")

        # ── Generate answer ───────────────────────────────────────────────────
        chunks = []
        answer = ""

        if intent == "rag":
            # Retrieve from ALL PDFs concurrently
            chunks = await retriever.retrieve_multi(db, all_pdf_ids, message)

            if not chunks:
                answer = (
                    "I couldn't find relevant information in the document(s) to answer your question. "
                    "Try rephrasing or asking about a different topic covered in the attached documents."
                )
            else:
                prompt = build_rag_prompt(message, chunks, history)
                answer = await llm_service.generate(prompt)

        else:
            # Continuation — use history only, no retrieval
            messages = build_continuation_prompt(message, history)
            answer = await llm_service.generate_with_history(messages)

        # ── Save user message ─────────────────────────────────────────────────
        user_msg = await message_repo.create(db, {
            "session_id": session.id,
            "role": "user",
            "content": message,
        })

        # ── Generate follow-up question ───────────────────────────────────────
        follow_up = await llm_service.generate_follow_up(answer)

        # ── Save assistant message ────────────────────────────────────────────
        assistant_msg = await message_repo.create(db, {
            "session_id": session.id,
            "role": "assistant",
            "content": answer,
            "mode": intent,
            "follow_up": follow_up,
        })

        # ── Build and save citations (multi-PDF aware) ────────────────────────
        citation_records = []
        if chunks:
            # Build a map of pdf_id → file_path for bbox resolution
            pdf_path_map = {pid: pdf_objects[pid].file_path for pid in all_pdf_ids}
            citation_records = citation_service.build_citation_records_multi(
                message_id=assistant_msg.id,
                chunks=chunks,
                pdf_path_map=pdf_path_map,
            )
            await citation_repo.bulk_create(db, citation_records)

        await db.commit()

        # ── Format citations for response ─────────────────────────────────────
        formatted_citations = [
            {
                "id": r.get("chunk_id", ""),
                "chunk_id": r.get("chunk_id"),
                "source_pdf_id": r.get("source_pdf_id"),
                "page_number": r["page_number"],
                "bbox": r["bbox"],
                "cited_text": r["cited_text"],
                "relevance_score": r.get("relevance_score"),
                "is_primary": r["is_primary"],
            }
            for r in citation_records
        ]

        return {
            "session_id": session.id,
            "message_id": assistant_msg.id,
            "answer": answer,
            "mode": intent,
            "citations": formatted_citations,
            "follow_up": follow_up,
        }

    async def get_history(self, db: AsyncSession, session_id: str, pdf_id: str) -> dict:
        messages = await message_repo.get_session_messages(db, session_id)

        formatted = []
        for msg in messages:
            citations = [
                {
                    "id": c.id,
                    "chunk_id": c.chunk_id,
                    "source_pdf_id": c.source_pdf_id,
                    "page_number": c.page_number,
                    "bbox": c.bbox,
                    "cited_text": c.cited_text,
                    "relevance_score": c.relevance_score,
                    "is_primary": c.is_primary,
                }
                for c in msg.citations
            ]
            formatted.append({
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "mode": msg.mode,
                "follow_up": msg.follow_up,
                "citations": citations,
                "created_at": msg.created_at,
            })

        return {"session_id": session_id, "pdf_id": pdf_id, "messages": formatted}

    async def clear_history(self, db: AsyncSession, session_id: str):
        await message_repo.delete_by_session(db, session_id)
        await db.commit()


rag_service = RAGService()
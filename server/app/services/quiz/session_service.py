from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.repos.quiz.quiz_session_repo import quiz_session_repo
from app.repos.quiz.quiz_question_repo import quiz_question_repo
from app.repos.document.document_repo import document_repo
from app.services.quiz.generator_service import generator_service
from app.core.exceptions import PDFNotFoundError, PDFNotReadyError, QuizNotFoundError
from app.utils.constants import QuizStatus
import asyncio


class SessionService:
    """
    Manages quiz session lifecycle: create, retrieve, append, clone, delete.
    Delegates question generation to generator_service.
    """

    async def create(
        self,
        db: AsyncSession,
        pdf_id: str,
        pdf_ids: list[str],
        user_id: str,
        count: int,
        question_type: str,
        difficulty: str,
        topic: str | None,
        title: str | None = None,
        chat_session_id: str | None = None,
    ) -> dict:
        # Build the full list: primary + extras (deduplicated, primary first)
        all_pdf_ids = [pdf_id] + [p for p in pdf_ids if p != pdf_id]

        # Validate ALL PDFs are ready in parallel
        async def _validate_pdf(pid: str):
            pdf = await document_repo.get_by_id(db, pid)
            if not pdf:
                raise PDFNotFoundError(pid)
            if pdf.status != "ready":
                raise PDFNotReadyError(pid, pdf.status)
            return pdf

        pdfs = []
        for pid in all_pdf_ids:
            pdfs.append(await _validate_pdf(pid))
        primary_pdf = pdfs[0]

        # Auto-generate title if not provided
        if not title:
            if len(all_pdf_ids) == 1:
                title = f"Quiz — {primary_pdf.name.rsplit('.', 1)[0]}"
            else:
                title = f"Multi-Doc Quiz ({len(all_pdf_ids)} docs)"

        session = await quiz_session_repo.create(db, {
            "pdf_id": pdf_id,
            "pdf_ids": all_pdf_ids,
            "user_id": user_id,
            "status": QuizStatus.ACTIVE,
            "question_count": 0,
            "title": title,
            "chat_session_id": chat_session_id,
        })
        await db.flush()
        logger.info(f"Quiz session {session.id} created across {len(all_pdf_ids)} PDF(s)")

        questions = await generator_service.generate_questions(
            db=db,
            pdf_ids=all_pdf_ids,
            session_id=session.id,
            count=count,
            question_type=question_type,
            difficulty=difficulty,
            topic=topic,
            start_index=0,
            exclude_questions=[],
        )

        session.question_count = len(questions)
        await db.commit()
        return self._format(session, questions)

    async def clone(
        self,
        db: AsyncSession,
        quiz_id: str,
        user_id: str,
        chat_session_id: str | None = None,
    ) -> dict:
        """
        Clone an existing quiz session (same questions, fresh attempt).
        Preserves original result — creates a brand-new session with copied questions.
        """
        original = await quiz_session_repo.get_by_id(db, quiz_id)
        if not original:
            raise QuizNotFoundError(quiz_id)

        original_questions = await quiz_question_repo.get_by_session(db, quiz_id)

        # Clone the session
        title = original.title
        if title and not title.startswith("Retake"):
            title = f"Retake — {title}"

        new_session = await quiz_session_repo.create(db, {
            "pdf_id": original.pdf_id,
            "pdf_ids": original.pdf_ids or [original.pdf_id],
            "user_id": user_id,
            "status": QuizStatus.ACTIVE,
            "question_count": 0,
            "title": title,
            "chat_session_id": chat_session_id,
        })
        await db.flush()

        # Copy questions to new session
        records = [
            {
                "session_id": new_session.id,
                "question_index": q.question_index,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "difficulty": q.difficulty,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
                "source_page": q.source_page,
            }
            for q in original_questions
        ]

        new_questions = await quiz_question_repo.create_many(db, records)
        new_session.question_count = len(new_questions)
        await db.commit()

        logger.info(f"Cloned quiz {quiz_id} → new session {new_session.id} with {len(new_questions)} questions")
        return self._format(new_session, new_questions)

    async def append(
        self,
        db: AsyncSession,
        quiz_id: str,
        count: int,
        question_type: str | None,
        difficulty: str | None,
    ) -> dict:
        session = await quiz_session_repo.get_by_id(db, quiz_id)
        if not session:
            raise QuizNotFoundError(quiz_id)

        existing = await quiz_question_repo.get_by_session(db, quiz_id)
        exclude = [q.question_text for q in existing]
        first = existing[0] if existing else None
        q_type = question_type or (first.question_type if first else "mcq")
        q_diff = difficulty or (first.difficulty if first else "medium")

        pdf_ids = session.pdf_ids or [session.pdf_id]
        new_questions = await generator_service.generate_questions(
            db=db,
            pdf_ids=pdf_ids,
            session_id=quiz_id,
            count=count,
            question_type=q_type,
            difficulty=q_diff,
            topic=None,
            start_index=len(existing),
            exclude_questions=exclude,
        )

        session.question_count += len(new_questions)
        await db.commit()

        all_questions = await quiz_question_repo.get_by_session(db, quiz_id)
        return {
            "id": quiz_id,
            "question_count": len(all_questions),
            "new_questions_added": len(new_questions),
            "questions": self._format_questions(all_questions),
        }

    async def get(self, db: AsyncSession, quiz_id: str) -> dict:
        session = await quiz_session_repo.get_by_id(db, quiz_id)
        if not session:
            raise QuizNotFoundError(quiz_id)
        questions = await quiz_question_repo.get_by_session(db, quiz_id)
        return self._format(session, questions)

    async def list_by_pdf(self, db: AsyncSession, pdf_id: str) -> list[dict]:
        sessions = await quiz_session_repo.get_by_pdf(db, pdf_id)
        result = []
        for s in sessions:
            questions = await quiz_question_repo.get_by_session(db, s.id)
            result.append(self._format(s, questions))
        return result

    async def list_by_chat_session(self, db: AsyncSession, chat_session_id: str) -> list[dict]:
        sessions = await quiz_session_repo.get_by_chat_session(db, chat_session_id)
        result = []
        for s in sessions:
            questions = await quiz_question_repo.get_by_session(db, s.id)
            result.append(self._format(s, questions))
        return result

    async def delete(self, db: AsyncSession, quiz_id: str) -> None:
        deleted = await quiz_session_repo.delete(db, quiz_id)
        if not deleted:
            raise QuizNotFoundError(quiz_id)
        await db.commit()
        logger.info(f"Quiz session {quiz_id} deleted")

    def _format_questions(self, questions: list) -> list[dict]:
        return [
            {
                "id": q.id,
                "question_index": q.question_index,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "difficulty": q.difficulty,
                "options": q.options,
                "source_page": q.source_page,
            }
            for q in questions
        ]

    def _format(self, session, questions: list) -> dict:
        # read from __dict__ to prevent triggering a synchronous lazy-load in AsyncSession
        result = session.__dict__.get("result")
        return {
            "id": session.id,
            "pdf_id": session.pdf_id,
            "pdf_ids": session.pdf_ids or [session.pdf_id],
            "status": session.status,
            "question_count": session.question_count,
            "questions": self._format_questions(questions),
            "title": session.title,
            "chat_session_id": session.chat_session_id,
            "has_result": result is not None,
            "score": result.score if result else None,
            "total": result.total if result else None,
            "percentage": result.percentage if result else None,
            "grade": result.grade if result else None,
            "created_at": session.created_at,
        }


session_service = SessionService()
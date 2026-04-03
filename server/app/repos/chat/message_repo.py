from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.models.chat import ChatMessage, ChatSession


class MessageRepo:

    async def create(self, db: AsyncSession, data: dict) -> ChatMessage:
        msg = ChatMessage(**data)
        db.add(msg)
        await db.flush()
        await db.refresh(msg)
        return msg

    async def create_quiz_card(
        self,
        db: AsyncSession,
        session_id: str,
        quiz_session_id: str,
    ) -> ChatMessage:
        """Create a quiz-type chat message (card) linked to a quiz session."""
        return await self.create(db, {
            "session_id": session_id,
            "role": "assistant",
            "content": "",
            "message_type": "quiz",
            "quiz_session_id": quiz_session_id,
        })

    async def get_session_messages(
        self,
        db: AsyncSession,
        session_id: str,
    ) -> list[ChatMessage]:
        """Get all messages with citations and quiz_session (+ result) eagerly loaded."""
        from app.models.quiz import QuizSession, QuizResult
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .options(
                selectinload(ChatMessage.citations),
                selectinload(ChatMessage.quiz_session).selectinload(QuizSession.result),
            )
            .order_by(ChatMessage.created_at.asc())
        )
        return list(result.scalars().all())


    async def get_history_for_llm(
        self,
        db: AsyncSession,
        session_id: str,
        limit: int = 20,
    ) -> list[dict]:
        """
        Returns last N NON-quiz messages formatted for LLM context.
        [{\"role\": \"user\"|\"assistant\", \"content\": \"...\"}]
        """
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .where(ChatMessage.message_type == "chat")
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        )
        messages = list(reversed(result.scalars().all()))
        return [{"role": m.role, "content": m.content} for m in messages]

    async def delete_by_session(self, db: AsyncSession, session_id: str):
        await db.execute(
            delete(ChatMessage).where(ChatMessage.session_id == session_id)
        )


message_repo = MessageRepo()
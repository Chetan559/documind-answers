from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.chat import ChatSession


class SessionRepo:

    async def get_by_id(self, db: AsyncSession, session_id: str) -> ChatSession | None:
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        return result.scalar_one_or_none()

    async def get_user_sessions_metadata(self, db: AsyncSession, user_id: str) -> list[dict]:
        from sqlalchemy import func
        from app.models.chat import ChatMessage
        
        # Correlated subqueries
        first_msg_sq = (
            select(func.left(ChatMessage.content, 40))
            .where(ChatMessage.session_id == ChatSession.id)
            .where(ChatMessage.role == 'user')
            .order_by(ChatMessage.created_at.asc())
            .limit(1)
            .correlate(ChatSession)
            .scalar_subquery()
        )

        last_msg_sq = (
            select(func.left(ChatMessage.content, 80))
            .where(ChatMessage.session_id == ChatSession.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
            .correlate(ChatSession)
            .scalar_subquery()
        )

        count_sq = (
            select(func.count(ChatMessage.id))
            .where(ChatMessage.session_id == ChatSession.id)
            .correlate(ChatSession)
            .scalar_subquery()
        )

        result = await db.execute(
            select(
                ChatSession.id,
                ChatSession.pdf_id,
                ChatSession.extra_pdf_ids,
                ChatSession.created_at,
                ChatSession.updated_at,
                first_msg_sq.label("title"),
                last_msg_sq.label("preview_text"),
                count_sq.label("message_count")
            )
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.updated_at.desc())
        )
        
        rows = result.all()
        output = []
        for row in rows:
            output.append({
                "id": row.id,
                "pdf_id": row.pdf_id,
                "extra_pdf_ids": row.extra_pdf_ids or [],
                "created_at": row.created_at,
                "updated_at": row.updated_at,
                "title": row.title or "Chat",
                "preview_text": row.preview_text or "No messages yet",
                "message_count": row.message_count or 0
            })
        return output

    async def get_or_create(
        self,
        db: AsyncSession,
        pdf_id: str,
        user_id: str,
        session_id: str | None,
        extra_pdf_ids: list[str] | None = None,
    ) -> ChatSession:
        # Try existing session first
        if session_id:
            session = await self.get_by_id(db, session_id)
            if session:
                # Update extra_pdf_ids if new ones were added
                if extra_pdf_ids:
                    existing = set(session.extra_pdf_ids or [])
                    new_extras = [p for p in extra_pdf_ids if p not in existing]
                    if new_extras:
                        session.extra_pdf_ids = list(existing) + new_extras
                        await db.flush()
                return session

        # Create new session
        session = ChatSession(
            pdf_id=pdf_id,
            user_id=user_id,
            extra_pdf_ids=extra_pdf_ids or [],
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session

    async def delete(self, db: AsyncSession, session_id: str) -> bool:
        session = await self.get_by_id(db, session_id)
        if not session:
            return False
        await db.delete(session)
        return True


session_repo = SessionRepo()
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.chat import ChatSession


class SessionRepo:

    async def get_by_id(self, db: AsyncSession, session_id: str) -> ChatSession | None:
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        return result.scalar_one_or_none()

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
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User


class UserRepo:

    async def get_by_id(self, db: AsyncSession, user_id: str) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_google_id(self, db: AsyncSession, google_id: str) -> User | None:
        result = await db.execute(select(User).where(User.google_id == google_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def upsert_from_google(
        self,
        db: AsyncSession,
        google_id: str,
        email: str,
        name: str | None,
        avatar_url: str | None,
    ) -> User:
        """Find user by google_id; if not found, try email; if not found, create new."""
        user = await self.get_by_google_id(db, google_id)
        if user:
            # Update fields that may have changed
            user.name = name or user.name
            user.avatar_url = avatar_url or user.avatar_url
            await db.flush()
            return user

        # Check if email exists (e.g. migrated from default_user or pre-existing)
        user = await self.get_by_email(db, email)
        if user:
            user.google_id = google_id
            user.name = name or user.name
            user.avatar_url = avatar_url or user.avatar_url
            user.auth_provider = "google"
            await db.flush()
            return user

        # Create new user
        user = User(
            email=email,
            name=name,
            google_id=google_id,
            avatar_url=avatar_url,
            auth_provider="google",
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user


user_repo = UserRepo()

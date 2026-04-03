import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def add_covering_index():
    print("Starting index injection...")
    async with AsyncSessionLocal() as session:
        # Create covering index on chat_messages(session_id, created_at)
        await session.execute(
            text("CREATE INDEX IF NOT EXISTS ix_chat_messages_session_created ON chat_messages(session_id, created_at)")
        )
        await session.commit()
    print("Successfully added covering index on chat_messages.")

if __name__ == "__main__":
    asyncio.run(add_covering_index())

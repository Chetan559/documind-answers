"""Add extra_pdf_ids to chat_sessions and source_pdf_id to citations."""
import asyncio
from sqlalchemy import text
from app.core.database import engine


async def migrate():
    async with engine.begin() as conn:
        await conn.execute(text(
            "ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS extra_pdf_ids TEXT DEFAULT '[]'"
        ))
        await conn.execute(text(
            "ALTER TABLE citations ADD COLUMN IF NOT EXISTS source_pdf_id VARCHAR(255)"
        ))
        await conn.execute(text(
            "ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS pdf_ids TEXT DEFAULT '[]'"
        ))
        await conn.execute(text(
            "ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS title VARCHAR(200)"
        ))
        await conn.execute(text(
            "ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS chat_session_id VARCHAR"
        ))
        await conn.execute(text(
            "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'chat'"
        ))
        await conn.execute(text(
            "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS quiz_session_id VARCHAR(255)"
        ))
        await conn.execute(text(
            "UPDATE chat_messages SET message_type = 'chat' WHERE message_type IS NULL"
        ))
        print("Migration complete — extra_pdf_ids and source_pdf_id columns added.")


if __name__ == "__main__":
    asyncio.run(migrate())

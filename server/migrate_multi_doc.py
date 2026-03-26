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
        print("Migration complete — extra_pdf_ids and source_pdf_id columns added.")


if __name__ == "__main__":
    asyncio.run(migrate())

import uuid
import json
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import DateTime, TypeDecorator, TEXT
from app.core.database import Base


class JSONList(TypeDecorator):
    """Stores a Python list as a JSON string in a TEXT column."""
    impl = TEXT
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        try:
            return json.loads(value)
        except (TypeError, ValueError):
            return []


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pdf_id: Mapped[str] = mapped_column(String, ForeignKey("pdfs.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # extra_pdf_ids stores additional PDFs attached to the chat room (JSON list of pdf_id strings)
    extra_pdf_ids: Mapped[str] = mapped_column(JSONList, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pdf: Mapped["PDF"] = relationship("PDF", back_populates="chat_sessions")
    user: Mapped["User"] = relationship("User", back_populates="chat_sessions")
    messages: Mapped[list["ChatMessage"]] = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

    @property
    def all_pdf_ids(self) -> list[str]:
        """Returns all PDF IDs (primary + extras) for this session."""
        ids = [self.pdf_id]
        for pid in (self.extra_pdf_ids or []):
            if pid not in ids:
                ids.append(pid)
        return ids


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = (
        Index("ix_chat_messages_session_created", "session_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    mode: Mapped[str | None] = mapped_column(String(20))
    follow_up: Mapped[str | None] = mapped_column(Text)
    # "chat" (default) or "quiz" (card message)
    message_type: Mapped[str] = mapped_column(String(20), nullable=False, default="chat")
    # FK to quiz_sessions — only set when message_type == "quiz"
    quiz_session_id: Mapped[str | None] = mapped_column(String, ForeignKey("quiz_sessions.id", ondelete="CASCADE"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")
    citations: Mapped[list["Citation"]] = relationship("Citation", back_populates="message", cascade="all, delete-orphan")
    quiz_session: Mapped["QuizSession | None"] = relationship("QuizSession", back_populates="chat_messages", foreign_keys=[quiz_session_id])
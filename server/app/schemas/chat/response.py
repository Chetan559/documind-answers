from pydantic import BaseModel
from datetime import datetime
from app.schemas.common import BBox


class CitationResponse(BaseModel):
    id: str
    chunk_id: str | None
    source_pdf_id: str | None    # which PDF this citation came from
    page_number: int
    bbox: BBox
    cited_text: str
    relevance_score: float | None
    is_primary: bool


class ChatMessageResponse(BaseModel):
    id: str
    role: str                           # user | assistant
    content: str
    mode: str | None                    # rag | continuation
    follow_up: str | None
    citations: list[CitationResponse] | None = None
    message_type: str | None = "chat"
    quiz_session_id: str | None = None
    quiz_data: dict | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    session_id: str
    message_id: str
    answer: str
    mode: str                           # rag | continuation
    citations: list[CitationResponse]
    follow_up: str | None


class ChatHistoryResponse(BaseModel):
    session_id: str
    pdf_id: str
    messages: list[ChatMessageResponse]

class ChatSessionMetadataResponse(BaseModel):
    id: str
    pdf_id: str
    extra_pdf_ids: list[str]
    created_at: datetime
    updated_at: datetime
    title: str = "Chat"
    preview_text: str = "No messages yet"
    message_count: int = 0

    class Config:
        from_attributes = True
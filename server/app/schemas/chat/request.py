from pydantic import BaseModel
from typing import List


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None   # null = start new session


class MultiChatRequest(BaseModel):
    """
    Multi-document chat request.
    pdf_ids: list of all PDF IDs for this room (first one is primary)
    """
    pdf_ids: List[str]
    message: str
    session_id: str | None = None
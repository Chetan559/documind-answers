from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.schemas.chat.request import ChatRequest, MultiChatRequest
from app.schemas.chat.response import ChatResponse, ChatHistoryResponse, ChatSessionMetadataResponse
from app.schemas.common import SuccessResponse
from app.services.rag.rag_service import rag_service
from app.repos.chat.session_repo import session_repo

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.get("/sessions", response_model=list[ChatSessionMetadataResponse])
async def get_user_sessions(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get metadata for all chat sessions belonging to the current user."""
    return await session_repo.get_user_sessions_metadata(db, user_id)

@router.post("/", response_model=ChatResponse)
async def chat_multi(
    body: MultiChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Multi-document chat. Accepts a list of pdf_ids — retrieves from all in parallel.
    First pdf_id in the list is the primary (owns the session FK).
    """
    if not body.pdf_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one pdf_id is required")

    primary_pdf_id = body.pdf_ids[0]
    extra_pdf_ids = body.pdf_ids[1:]

    return await rag_service.chat(
        db=db,
        pdf_id=primary_pdf_id,
        message=body.message,
        session_id=body.session_id,
        user_id=user_id,
        extra_pdf_ids=extra_pdf_ids if extra_pdf_ids else None,
    )


@router.post("/{pdf_id}", response_model=ChatResponse)
async def chat_single(
    pdf_id: str,
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Single-PDF chat (backward compat). Equivalent to POST /api/chat/ with [pdf_id].
    """
    return await rag_service.chat(
        db=db,
        pdf_id=pdf_id,
        message=body.message,
        session_id=body.session_id,
        user_id=user_id,
    )


@router.get("/{pdf_id}/history/{session_id}", response_model=ChatHistoryResponse)
async def get_history(
    pdf_id: str,
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get full conversation history with citations for a session."""
    return await rag_service.get_history(db, session_id, pdf_id)


@router.delete("/{pdf_id}/history/{session_id}", response_model=SuccessResponse)
async def clear_history(
    pdf_id: str,
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Clear all messages in a session (keeps session alive)."""
    await rag_service.clear_history(db, session_id)
    return SuccessResponse(message="Chat history cleared")
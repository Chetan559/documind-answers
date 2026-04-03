from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.services.quiz.quiz_service import quiz_service
from app.schemas.quiz.request import QuizGenerateRequest, QuizAppendRequest, QuizSubmitRequest, RetakeQuizRequest
from app.schemas.quiz.response import QuizSessionResponse, QuizResultResponse
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])


@router.post("/{pdf_id}/generate", response_model=QuizSessionResponse, status_code=201)
async def generate_quiz(
    pdf_id: str,
    body: QuizGenerateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a quiz for one or more PDFs.
    - `pdf_id` (path) is the primary PDF.
    - `body.pdf_ids` (optional) includes additional PDFs — if empty, only primary is used.
    - `body.chat_session_id` (optional) auto-posts a quiz card to the given chat session.
    """
    # Merge: primary + any extras from body (deduplicated)
    all_pdf_ids = [pdf_id] + [p for p in body.pdf_ids if p != pdf_id]

    return await quiz_service.generate_quiz(
        db=db,
        pdf_id=pdf_id,
        pdf_ids=all_pdf_ids,
        user_id=user_id,
        count=body.count,
        question_type=body.question_type.value,
        difficulty=body.difficulty.value,
        topic=body.topic,
        title=body.title,
        chat_session_id=body.chat_session_id,
    )


@router.post("/{quiz_id}/retake", response_model=QuizSessionResponse, status_code=201)
async def retake_quiz(
    quiz_id: str,
    body: RetakeQuizRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Clone an existing quiz (same questions, fresh attempt).
    The original session and its saved analysis are preserved.
    If `chat_session_id` is provided, a new quiz card is posted to that chat session.
    """
    return await quiz_service.retake_quiz(
        db=db,
        quiz_id=quiz_id,
        user_id=user_id,
        chat_session_id=body.chat_session_id,
    )


@router.get("/chat-session/{chat_session_id}/cards", response_model=list[QuizSessionResponse])
async def list_quiz_cards(
    chat_session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """List all quiz sessions linked to a chat session (for rendering quiz cards)."""
    return await quiz_service.list_by_chat_session(db, chat_session_id)


@router.get("/{pdf_id}/list", response_model=list[QuizSessionResponse])
async def list_quizzes(
    pdf_id: str,
    db: AsyncSession = Depends(get_db),
):
    """List all quiz sessions for a PDF."""
    return await quiz_service.list_by_pdf(db, pdf_id)


@router.get("/{quiz_id}", response_model=QuizSessionResponse)
async def get_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get quiz questions (without correct answers — for active quiz UI)."""
    return await quiz_service.get_quiz(db, quiz_id)


@router.post("/{quiz_id}/append")
async def append_questions(
    quiz_id: str,
    body: QuizAppendRequest,
    db: AsyncSession = Depends(get_db),
):
    """Add more questions to an existing quiz session."""
    return await quiz_service.append_questions(
        db=db,
        quiz_id=quiz_id,
        count=body.count,
        question_type=body.question_type.value if body.question_type else None,
        difficulty=body.difficulty.value if body.difficulty else None,
    )


@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_id: str,
    body: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit answers and get evaluated results. Idempotent — re-submitting returns saved result."""
    return await quiz_service.submit_and_evaluate(db, quiz_id, body.answers)


@router.get("/{quiz_id}/result", response_model=QuizResultResponse)
async def get_result(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the evaluated result for a submitted quiz."""
    return await quiz_service.get_result(db, quiz_id)


@router.delete("/{quiz_id}", response_model=SuccessResponse)
async def delete_quiz(
    quiz_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a quiz session and all its questions/answers from the backend."""
    await quiz_service.delete_quiz(db, quiz_id)
    return SuccessResponse(message="Quiz deleted")
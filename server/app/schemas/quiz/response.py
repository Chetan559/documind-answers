from pydantic import BaseModel
from datetime import datetime


class QuizQuestionResponse(BaseModel):
    id: str
    question_index: int
    question_text: str
    question_type: str
    difficulty: str
    options: list[str] | None
    source_page: int | None

    class Config:
        from_attributes = True


class QuizSessionResponse(BaseModel):
    id: str
    pdf_id: str
    pdf_ids: list[str]
    status: str
    question_count: int
    questions: list[QuizQuestionResponse]
    title: str | None
    chat_session_id: str | None = None
    has_result: bool = False
    score: int | None = None
    total: int | None = None
    percentage: float | None = None
    grade: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class QuizAppendResponse(BaseModel):
    id: str
    question_count: int
    new_questions_added: int
    questions: list[QuizQuestionResponse]


class PerQuestionResult(BaseModel):
    question_id: str
    question_text: str
    is_correct: bool
    user_answer: str | None
    correct_answer: str
    explanation: str | None


class QuizResultResponse(BaseModel):
    session_id: str
    score: int
    total: int
    percentage: float
    grade: str
    per_question: list[PerQuestionResult]
    weak_topics: list[str]
    recommendation: str
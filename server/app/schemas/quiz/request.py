from pydantic import BaseModel, Field
from enum import Enum


class QuestionType(str, Enum):
    MCQ               = "mcq"
    TRUE_FALSE        = "true_false"
    FILL_IN_THE_BLANK = "fill_in_the_blank"


class DifficultyLevel(str, Enum):
    EASY   = "easy"
    MEDIUM = "medium"
    HARD   = "hard"


class QuizGenerateRequest(BaseModel):
    count:          int             = Field(default=5, ge=3, le=20)
    question_type:  QuestionType    = Field(default=QuestionType.MCQ)
    difficulty:     DifficultyLevel = Field(default=DifficultyLevel.MEDIUM)
    topic:          str | None      = Field(default=None)
    # Multi-doc: list of PDF IDs to draw questions from (first is primary)
    pdf_ids:        list[str]       = Field(default_factory=list)
    # If provided, auto-post a quiz card to this chat session
    chat_session_id: str | None     = Field(default=None)
    # Optional title for the quiz card
    title:          str | None      = Field(default=None)


class QuizAppendRequest(BaseModel):
    count:         int                    = Field(default=5, ge=1, le=20)
    question_type: QuestionType | None    = None
    difficulty:    DifficultyLevel | None = None


class QuizSubmitRequest(BaseModel):
    answers: dict[str, str] = Field(description="{question_id: user_answer}")


class RetakeQuizRequest(BaseModel):
    """Clone an existing quiz session (same questions) and optionally link to a chat session."""
    chat_session_id: str | None = Field(default=None)
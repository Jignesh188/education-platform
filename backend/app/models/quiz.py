from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuizOption(BaseModel):
    """Quiz question option."""
    option_id: str  # A, B, C, D
    option_text: str


class QuizQuestion(BaseModel):
    """Quiz question model."""
    id: str
    question_text: str
    options: List[QuizOption]
    correct_answer: str  # A, B, C, or D
    explanation: str


class QuizCreate(BaseModel):
    """Quiz creation request."""
    document_id: str
    title: str
    difficulty: Difficulty
    question_count: int = Field(..., ge=1, le=50)


class QuizResponse(BaseModel):
    """Quiz response model."""
    id: str
    user_id: str
    document_id: str
    title: str
    difficulty: Difficulty
    question_count: int
    questions: List[QuizQuestion]
    created_at: datetime


class QuizListResponse(BaseModel):
    """List of quizzes response."""
    quizzes: List[QuizResponse]
    total: int


# Exam Models
class ExamAnswer(BaseModel):
    """Single answer submission."""
    question_id: str
    selected_answer: str  # A, B, C, or D


class ExamSubmission(BaseModel):
    """Exam submission request."""
    quiz_id: str
    answers: List[ExamAnswer]
    time_taken: int  # seconds


class AnswerDetail(BaseModel):
    """Detailed answer result."""
    question_id: str
    question_text: str
    selected_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str


class ExamResultResponse(BaseModel):
    """Exam result response."""
    id: str
    user_id: str
    quiz_id: str
    document_id: str
    quiz_title: str
    total_questions: int
    correct_answers: int
    wrong_answers: int
    score_percentage: float
    time_taken: int
    difficulty: Difficulty
    answers: List[AnswerDetail]
    weak_topics: List[str] = []
    completed_at: datetime


class ExamResultListResponse(BaseModel):
    """List of exam results."""
    results: List[ExamResultResponse]
    total: int

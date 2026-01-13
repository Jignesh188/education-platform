from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2, max_length=100)


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response model."""
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    created_at: datetime
    total_documents: int = 0
    total_quizzes_taken: int = 0
    total_correct_answers: int = 0
    total_questions_answered: int = 0
    study_streak: int = 0


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    """User profile update request."""
    name: Optional[str] = None
    avatar_url: Optional[str] = None

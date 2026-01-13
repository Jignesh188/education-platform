from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date


class DailyStat(BaseModel):
    """Daily learning statistics."""
    date: date
    documents_uploaded: int = 0
    quizzes_taken: int = 0
    questions_answered: int = 0
    correct_answers: int = 0
    study_time: int = 0  # minutes


class TopicProgress(BaseModel):
    """Progress on a specific topic."""
    topic: str
    total_questions: int
    correct_answers: int
    mastery_level: float  # 0-100%


class Achievement(BaseModel):
    """User achievement."""
    type: str
    title: str
    description: str
    earned_at: datetime


class LearningProgressResponse(BaseModel):
    """Learning progress response."""
    user_id: str
    daily_stats: List[DailyStat] = []
    topic_progress: List[TopicProgress] = []
    achievements: List[Achievement] = []
    
    # Aggregated stats
    total_study_time: int = 0
    average_score: float = 0.0
    current_streak: int = 0
    best_streak: int = 0
    total_documents: int = 0
    total_quizzes: int = 0
    updated_at: datetime


class ProgressOverview(BaseModel):
    """Quick progress overview for dashboard."""
    total_documents: int
    total_quizzes_taken: int
    average_score: float
    study_streak: int
    recent_activity: List[DailyStat]

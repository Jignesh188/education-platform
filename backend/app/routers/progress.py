from fastapi import APIRouter, Depends
from datetime import datetime, date, timedelta
from bson import ObjectId

from app.models.progress import LearningProgressResponse, ProgressOverview, DailyStat, TopicProgress, Achievement
from app.database import (
    get_progress_collection, get_users_collection,
    get_documents_collection, get_quiz_results_collection
)
from app.utils.security import get_current_user

router = APIRouter()


@router.get("/overview", response_model=ProgressOverview)
async def get_progress_overview(current_user: dict = Depends(get_current_user)):
    """Get quick progress overview for dashboard."""
    users = get_users_collection()
    results = get_quiz_results_collection()
    
    # Get user stats
    user = await users.find_one({"_id": current_user["_id"]})
    
    # Calculate average score from results
    cursor = results.find({"user_id": current_user["_id"]})
    result_list = await cursor.to_list(length=1000)
    
    avg_score = 0.0
    if result_list:
        avg_score = sum(r["score_percentage"] for r in result_list) / len(result_list)
    
    # Get recent activity (last 7 days)
    recent_activity = []
    progress = get_progress_collection()
    user_progress = await progress.find_one({"user_id": current_user["_id"]})
    
    if user_progress and user_progress.get("daily_stats"):
        # Get last 7 stats
        recent_activity = [
            DailyStat(**stat) 
            for stat in user_progress["daily_stats"][-7:]
        ]
    
    return ProgressOverview(
        total_documents=user.get("total_documents", 0),
        total_quizzes_taken=user.get("total_quizzes_taken", 0),
        average_score=round(avg_score, 1),
        study_streak=user.get("study_streak", 0),
        recent_activity=recent_activity
    )


@router.get("/detailed", response_model=LearningProgressResponse)
async def get_detailed_progress(current_user: dict = Depends(get_current_user)):
    """Get detailed learning progress."""
    progress = get_progress_collection()
    users = get_users_collection()
    results = get_quiz_results_collection()
    
    # Get or create progress document
    user_progress = await progress.find_one({"user_id": current_user["_id"]})
    
    if not user_progress:
        user_progress = {
            "user_id": current_user["_id"],
            "daily_stats": [],
            "topic_progress": [],
            "achievements": [],
            "updated_at": datetime.utcnow()
        }
        await progress.insert_one(user_progress)
    
    # Get user stats
    user = await users.find_one({"_id": current_user["_id"]})
    
    # Calculate aggregated stats
    cursor = results.find({"user_id": current_user["_id"]})
    result_list = await cursor.to_list(length=1000)
    
    total_study_time = sum(r.get("time_taken", 0) for r in result_list) // 60  # Convert to minutes
    avg_score = 0.0
    if result_list:
        avg_score = sum(r["score_percentage"] for r in result_list) / len(result_list)
    
    # Build response
    daily_stats = [DailyStat(**stat) for stat in user_progress.get("daily_stats", [])]
    topic_progress = [TopicProgress(**tp) for tp in user_progress.get("topic_progress", [])]
    achievements = [Achievement(**a) for a in user_progress.get("achievements", [])]
    
    return LearningProgressResponse(
        user_id=str(current_user["_id"]),
        daily_stats=daily_stats,
        topic_progress=topic_progress,
        achievements=achievements,
        total_study_time=total_study_time,
        average_score=round(avg_score, 1),
        current_streak=user.get("study_streak", 0),
        best_streak=user.get("study_streak", 0),
        total_documents=user.get("total_documents", 0),
        total_quizzes=user.get("total_quizzes_taken", 0),
        updated_at=user_progress.get("updated_at", datetime.utcnow())
    )


@router.post("/log-activity")
async def log_study_activity(
    study_time: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Log daily study activity."""
    progress = get_progress_collection()
    users = get_users_collection()
    
    today = date.today()
    today_str = today.isoformat()
    
    # Get current progress
    user_progress = await progress.find_one({"user_id": current_user["_id"]})
    
    if not user_progress:
        user_progress = {
            "user_id": current_user["_id"],
            "daily_stats": [],
            "topic_progress": [],
            "achievements": [],
            "updated_at": datetime.utcnow()
        }
    
    daily_stats = user_progress.get("daily_stats", [])
    
    # Find or create today's stat
    today_stat = None
    for stat in daily_stats:
        if str(stat.get("date")) == today_str:
            today_stat = stat
            break
    
    if today_stat:
        today_stat["study_time"] = today_stat.get("study_time", 0) + study_time
    else:
        daily_stats.append({
            "date": today_str,
            "documents_uploaded": 0,
            "quizzes_taken": 0,
            "questions_answered": 0,
            "correct_answers": 0,
            "study_time": study_time
        })
    
    # Keep only last 30 days
    daily_stats = daily_stats[-30:]
    
    # Update progress
    await progress.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {
            "daily_stats": daily_stats,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    
    # Check and update study streak
    user = await users.find_one({"_id": current_user["_id"]})
    yesterday = (today - timedelta(days=1)).isoformat()
    
    has_yesterday = any(str(s.get("date")) == yesterday for s in daily_stats)
    
    if has_yesterday or user.get("study_streak", 0) == 0:
        await users.update_one(
            {"_id": current_user["_id"]},
            {"$inc": {"study_streak": 1}}
        )
    
    return {"message": "Activity logged successfully"}

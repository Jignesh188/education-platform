from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta
from bson import ObjectId

from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse, UserUpdate
from app.database import get_users_collection, get_progress_collection
from app.utils.security import hash_password, verify_password, create_access_token, get_current_user
from fastapi import Depends

router = APIRouter()


def user_to_response(user: dict) -> UserResponse:
    """Convert MongoDB user document to response model."""
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        avatar_url=user.get("avatar_url"),
        created_at=user["created_at"],
        total_documents=user.get("total_documents", 0),
        total_quizzes_taken=user.get("total_quizzes_taken", 0),
        total_correct_answers=user.get("total_correct_answers", 0),
        total_questions_answered=user.get("total_questions_answered", 0),
        study_streak=user.get("study_streak", 0)
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user."""
    users = get_users_collection()
    
    # Check if email already exists
    existing_user = await users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    now = datetime.utcnow()
    user_doc = {
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "avatar_url": None,
        "created_at": now,
        "updated_at": now,
        "total_documents": 0,
        "total_quizzes_taken": 0,
        "total_correct_answers": 0,
        "total_questions_answered": 0,
        "study_streak": 0
    }
    
    # Insert user
    result = await users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    # Initialize learning progress
    progress = get_progress_collection()
    await progress.insert_one({
        "user_id": result.inserted_id,
        "daily_stats": [],
        "topic_progress": [],
        "achievements": [],
        "updated_at": now
    })
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(result.inserted_id)},
        expires_delta=timedelta(minutes=60)
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user_to_response(user_doc)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return token."""
    users = get_users_collection()
    
    # Find user
    user = await users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=60)
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user_to_response(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    return user_to_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile."""
    users = get_users_collection()
    
    update_fields = {}
    if update_data.name:
        update_fields["name"] = update_data.name
    if update_data.avatar_url is not None:
        update_fields["avatar_url"] = update_data.avatar_url
    
    if update_fields:
        update_fields["updated_at"] = datetime.utcnow()
        await users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_fields}
        )
    
    # Fetch updated user
    updated_user = await users.find_one({"_id": current_user["_id"]})
    return user_to_response(updated_user)

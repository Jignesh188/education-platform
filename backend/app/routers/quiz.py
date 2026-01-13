from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import List
from bson import ObjectId
import uuid

from app.models.quiz import (
    QuizCreate, QuizResponse, QuizListResponse, QuizQuestion, QuizOption,
    ExamSubmission, ExamResultResponse, ExamResultListResponse, AnswerDetail, Difficulty
)
from app.database import (
    get_quizzes_collection, get_quiz_results_collection,
    get_documents_collection, get_users_collection, get_progress_collection
)
from app.utils.security import get_current_user
from app.services.ai_service import ai_service

router = APIRouter()


def quiz_to_response(quiz: dict, include_answers: bool = False) -> QuizResponse:
    """Convert MongoDB quiz to response model."""
    questions = []
    for q in quiz.get("questions", []):
        question = QuizQuestion(
            id=q["id"],
            question_text=q["question_text"],
            options=[QuizOption(**opt) for opt in q["options"]],
            correct_answer=q["correct_answer"] if include_answers else "",
            explanation=q["explanation"] if include_answers else ""
        )
        questions.append(question)
    
    return QuizResponse(
        id=str(quiz["_id"]),
        user_id=str(quiz["user_id"]),
        document_id=str(quiz["document_id"]),
        title=quiz["title"],
        difficulty=quiz["difficulty"],
        question_count=quiz["question_count"],
        questions=questions,
        created_at=quiz["created_at"]
    )


@router.post("/create", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a quiz from a document."""
    documents = get_documents_collection()
    
    # Get document
    try:
        doc = await documents.find_one({
            "_id": ObjectId(quiz_data.document_id),
            "user_id": current_user["_id"]
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    if not doc.get("extracted_text"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document not yet processed. Please wait for processing to complete."
        )
    
    # Generate quiz questions using AI
    questions_data = await ai_service.generate_quiz_questions(
        doc["extracted_text"],
        quiz_data.difficulty.value,
        quiz_data.question_count,
        quiz_data.title
    )
    
    if not questions_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate quiz questions. Please try again."
        )
    
    # Format questions
    questions = []
    for q in questions_data:
        question = {
            "id": str(uuid.uuid4()),
            "question_text": q.get("question_text", ""),
            "options": q.get("options", []),
            "correct_answer": q.get("correct_answer", "A"),
            "explanation": q.get("explanation", "")
        }
        questions.append(question)
    
    # Create quiz document
    quizzes = get_quizzes_collection()
    now = datetime.utcnow()
    
    quiz = {
        "user_id": current_user["_id"],
        "document_id": ObjectId(quiz_data.document_id),
        "title": quiz_data.title,
        "difficulty": quiz_data.difficulty.value,
        "question_count": len(questions),
        "questions": questions,
        "created_at": now
    }
    
    result = await quizzes.insert_one(quiz)
    quiz["_id"] = result.inserted_id
    
    return quiz_to_response(quiz, include_answers=False)


@router.get("/", response_model=QuizListResponse)
async def list_quizzes(
    document_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    """List user's quizzes."""
    quizzes = get_quizzes_collection()
    
    query = {"user_id": current_user["_id"]}
    if document_id:
        try:
            query["document_id"] = ObjectId(document_id)
        except:
            pass
    
    cursor = quizzes.find(query).sort("created_at", -1)
    quiz_list = await cursor.to_list(length=100)
    
    return QuizListResponse(
        quizzes=[quiz_to_response(q, include_answers=False) for q in quiz_list],
        total=len(quiz_list)
    )


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: str,
    include_answers: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific quiz."""
    quizzes = get_quizzes_collection()
    
    try:
        quiz = await quizzes.find_one({
            "_id": ObjectId(quiz_id),
            "user_id": current_user["_id"]
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    return quiz_to_response(quiz, include_answers=include_answers)


@router.post("/submit", response_model=ExamResultResponse)
async def submit_exam(
    submission: ExamSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit exam answers and get results."""
    quizzes = get_quizzes_collection()
    
    # Get quiz with answers
    try:
        quiz = await quizzes.find_one({
            "_id": ObjectId(submission.quiz_id),
            "user_id": current_user["_id"]
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    
    # Create answer lookup
    answer_lookup = {a.question_id: a.selected_answer for a in submission.answers}
    
    # Evaluate answers
    answers_detail = []
    correct_count = 0
    wrong_answers_data = []
    
    for q in quiz["questions"]:
        selected = answer_lookup.get(q["id"], "")
        is_correct = selected == q["correct_answer"]
        
        if is_correct:
            correct_count += 1
        else:
            wrong_answers_data.append({
                "question_text": q["question_text"],
                "selected_answer": selected,
                "correct_answer": q["correct_answer"]
            })
        
        answers_detail.append(AnswerDetail(
            question_id=q["id"],
            question_text=q["question_text"],
            selected_answer=selected,
            correct_answer=q["correct_answer"],
            is_correct=is_correct,
            explanation=q["explanation"]
        ))
    
    total_questions = len(quiz["questions"])
    wrong_count = total_questions - correct_count
    score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    # Analyze weak topics if there are wrong answers
    weak_topics = []
    if wrong_answers_data:
        documents = get_documents_collection()
        doc = await documents.find_one({"_id": quiz["document_id"]})
        if doc and doc.get("summary"):
            weak_topics = await ai_service.analyze_weak_topics(
                wrong_answers_data, 
                doc["summary"]
            )
    
    # Save result
    results = get_quiz_results_collection()
    now = datetime.utcnow()
    
    result_doc = {
        "user_id": current_user["_id"],
        "quiz_id": quiz["_id"],
        "document_id": quiz["document_id"],
        "quiz_title": quiz["title"],
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "wrong_answers": wrong_count,
        "score_percentage": round(score_percentage, 2),
        "time_taken": submission.time_taken,
        "difficulty": quiz["difficulty"],
        "answers": [a.dict() for a in answers_detail],
        "weak_topics": weak_topics,
        "completed_at": now
    }
    
    insert_result = await results.insert_one(result_doc)
    result_doc["_id"] = insert_result.inserted_id
    
    # Update user stats
    users = get_users_collection()
    await users.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {
            "total_quizzes_taken": 1,
            "total_correct_answers": correct_count,
            "total_questions_answered": total_questions
        }}
    )
    
    return ExamResultResponse(
        id=str(result_doc["_id"]),
        user_id=str(result_doc["user_id"]),
        quiz_id=str(result_doc["quiz_id"]),
        document_id=str(result_doc["document_id"]),
        quiz_title=result_doc["quiz_title"],
        total_questions=result_doc["total_questions"],
        correct_answers=result_doc["correct_answers"],
        wrong_answers=result_doc["wrong_answers"],
        score_percentage=result_doc["score_percentage"],
        time_taken=result_doc["time_taken"],
        difficulty=Difficulty(result_doc["difficulty"]),
        answers=answers_detail,
        weak_topics=result_doc["weak_topics"],
        completed_at=result_doc["completed_at"]
    )


@router.get("/results/all", response_model=ExamResultListResponse)
async def list_exam_results(
    current_user: dict = Depends(get_current_user)
):
    """List all exam results for the user."""
    results = get_quiz_results_collection()
    
    cursor = results.find({"user_id": current_user["_id"]}).sort("completed_at", -1)
    result_list = await cursor.to_list(length=100)
    
    response_list = []
    for r in result_list:
        response_list.append(ExamResultResponse(
            id=str(r["_id"]),
            user_id=str(r["user_id"]),
            quiz_id=str(r["quiz_id"]),
            document_id=str(r["document_id"]),
            quiz_title=r["quiz_title"],
            total_questions=r["total_questions"],
            correct_answers=r["correct_answers"],
            wrong_answers=r["wrong_answers"],
            score_percentage=r["score_percentage"],
            time_taken=r["time_taken"],
            difficulty=Difficulty(r["difficulty"]),
            answers=[AnswerDetail(**a) for a in r.get("answers", [])],
            weak_topics=r.get("weak_topics", []),
            completed_at=r["completed_at"]
        ))
    
    return ExamResultListResponse(
        results=response_list,
        total=len(response_list)
    )


@router.get("/results/{result_id}", response_model=ExamResultResponse)
async def get_exam_result(
    result_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific exam result."""
    results = get_quiz_results_collection()
    
    try:
        result = await results.find_one({
            "_id": ObjectId(result_id),
            "user_id": current_user["_id"]
        })
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    
    return ExamResultResponse(
        id=str(result["_id"]),
        user_id=str(result["user_id"]),
        quiz_id=str(result["quiz_id"]),
        document_id=str(result["document_id"]),
        quiz_title=result["quiz_title"],
        total_questions=result["total_questions"],
        correct_answers=result["correct_answers"],
        wrong_answers=result["wrong_answers"],
        score_percentage=result["score_percentage"],
        time_taken=result["time_taken"],
        difficulty=Difficulty(result["difficulty"]),
        answers=[AnswerDetail(**a) for a in result.get("answers", [])],
        weak_topics=result.get("weak_topics", []),
        completed_at=result["completed_at"]
    )

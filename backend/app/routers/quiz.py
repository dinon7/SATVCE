from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import db

from app.models.quiz import (
    QuizQuestion,
    QuizResponse,
    QuizResult,
    QuizStage
)
from app.services.auth import get_current_user
from app.models.user import UserResponse
from app.services.ai import generate_follow_up_questions, generate_recommendations
from app.services.quiz_service import QuizService
from app.schemas.quiz import QuizAnswer

router = APIRouter(prefix="/quiz", tags=["quiz"])

# Predefined initial questions
INITIAL_QUESTIONS = [
    QuizQuestion(
        id="q1",
        text="How confident are you in your career choice?",
        type="slider",
        min_value=1,
        max_value=5
    ),
    QuizQuestion(
        id="q2",
        text="Have you thought about a specific career path?",
        type="multiple_choice",
        options=["Yes", "No", "Not sure"]
    ),
    QuizQuestion(
        id="q3",
        text="Which VCE subjects are you considering?",
        type="multiple_choice",
        options=[
            "English", "Mathematics", "Science", "History",
            "Languages", "Arts", "Technology", "Other"
        ]
    ),
    # Add more questions as needed
]

@router.get("/questions", response_model=List[QuizQuestion])
async def get_initial_questions(
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Get all initial quiz questions"""
    return await quiz_service.get_initial_questions()

@router.get("/questions/{question_id}", response_model=QuizQuestion)
async def get_question(
    question_id: str,
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Get a specific question by ID"""
    question = await quiz_service.get_question_by_id(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.post("/answers", response_model=QuizResult)
async def submit_initial_answers(
    answers: Dict[str, Any],
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Submit initial quiz answers and get AI-generated follow-up questions"""
    # Validate answers
    for question_id, answer in answers.items():
        if not await quiz_service.validate_answer(question_id, answer):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid answer for question {question_id}"
            )
    
    # Save initial answers and generate follow-up questions
    result = await quiz_service.save_initial_answers(current_user["id"], answers)
    
    # Generate follow-up questions based on initial answers
    follow_up_questions = await generate_follow_up_questions(answers)
    result.follow_up_questions = follow_up_questions
    
    return result

@router.post("/follow-up", response_model=QuizResult)
async def submit_follow_up_answers(
    answers: Dict[str, Any],
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Submit follow-up quiz answers and get AI-generated recommendations"""
    # Validate answers
    for question_id, answer in answers.items():
        if not await quiz_service.validate_answer(question_id, answer):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid answer for question {question_id}"
            )
    
    try:
        # Save follow-up answers
        result = await quiz_service.save_follow_up_answers(current_user["id"], answers)
        
        # Generate recommendations based on all answers
        all_answers = await quiz_service.get_all_answers(current_user["id"])
        recommendations = await generate_recommendations(all_answers)
        result.recommendations = recommendations
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/results", response_model=QuizResult)
async def get_quiz_results(
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Get quiz results and recommendations for the current user"""
    results = await quiz_service.get_quiz_results(current_user["id"])
    if not results:
        raise HTTPException(status_code=404, detail="No quiz results found")
    
    # If recommendations haven't been generated yet, generate them
    if not results.recommendations:
        all_answers = await quiz_service.get_all_answers(current_user["id"])
        recommendations = await generate_recommendations(all_answers)
        results.recommendations = recommendations
        await quiz_service.save_recommendations(current_user["id"], recommendations)
    
    return results 
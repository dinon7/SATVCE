from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
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

"""
routers/quiz.py - Quiz API endpoints for VCE Career Guidance backend.

- Purpose: Exposes endpoints for quiz questions, answers, follow-ups, and results.
- Major components: Initial questions, answer submission, follow-up, recommendations.
- Variable scope: Uses local variables in endpoints, constants for initial questions.
"""

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

@router.get("/subjects", response_model=List[str])
async def get_subject_list():
    """
    Get a list of all available VCE subjects for the frontend GUI.
    """
    return ["English", "Mathematics", "Science", "History", "Languages", "Arts", "Technology"]

@router.post("/answers", response_model=QuizResult)
async def submit_initial_answers(
    answers: Dict[str, Any],
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Submit initial quiz answers and get AI-generated follow-up questions"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    # Validate answers
    for question_id, answer in answers.items():
        if not await quiz_service.validate_answer(question_id, answer):
            # If an invalid answer is found, break out of the loop
            break
    
    # Save initial answers and generate follow-up questions
    result = await quiz_service.save_initial_answers(clerk_user_id, answers)
    
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
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    # Validate answers
    for question_id, answer in answers.items():
        if not await quiz_service.validate_answer(question_id, answer):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid answer for question {question_id}"
            )
    
    try:
        # Save follow-up answers
        result = await quiz_service.save_follow_up_answers(clerk_user_id, answers)
        
        # Generate recommendations based on all answers
        all_answers = await quiz_service.get_all_answers(clerk_user_id)
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
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    results = await quiz_service.get_quiz_results(clerk_user_id)
    if not results:
        raise HTTPException(status_code=404, detail="No quiz results found")
    
    # If recommendations haven't been generated yet, generate them
    if not results.recommendations:
        all_answers = await quiz_service.get_all_answers(clerk_user_id)
        recommendations = await generate_recommendations(all_answers)
        results.recommendations = recommendations
        await quiz_service.save_recommendations(clerk_user_id, recommendations)
    
    return results 
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.schemas.quiz import (
    QuizQuestion,
    QuizInitialRequestModel,
    QuizFollowUpRequestModel,
    QuizResultModel,
    RecommendationModel
)
from app.services.quiz_service import QuizManager
from app.services.auth import get_current_user
from app.models.user import UserResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.get("/quiz/initial-questions", response_model=List[QuizQuestion])
async def get_initial_questions(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get the initial set of quiz questions"""
    objQuizManager = QuizManager()
    return await objQuizManager.fetch_initial_questions()

@router.post("/quiz/initial", response_model=List[QuizQuestion])
async def submit_initial_answers(
    request: QuizInitialRequestModel,
    current_user: UserResponse = Depends(get_current_user)
):
    """Submit initial answers and get follow-up questions"""
    if current_user.id != request.strStudentID and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to submit answers for this student"
        )
    
    objQuizManager = QuizManager()
    await objQuizManager.record_initial_answers(request.strStudentID, request.arrAnswers)
    return await objQuizManager.get_follow_up_questions(request.strStudentID)

@router.post("/quiz/followup", response_model=RecommendationModel)
async def submit_followup_answers(
    request: QuizFollowUpRequestModel,
    current_user: UserResponse = Depends(get_current_user)
):
    """Submit follow-up answers and get final recommendations"""
    if current_user.id != request.strStudentID and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to submit answers for this student"
        )
    
    objQuizManager = QuizManager()
    return await objQuizManager.record_follow_up_answers(request.strStudentID, request.arrAnswers)

@router.get("/quiz/results/{strStudentID}", response_model=QuizResultModel)
async def get_quiz_results(
    strStudentID: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get complete quiz results for a student"""
    if current_user.id != strStudentID and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view results for this student"
        )
    
    objQuizManager = QuizManager()
    return await objQuizManager.get_combined_quiz_data(strStudentID)

@router.post("/quiz/submit/{strStudentID}", response_model=QuizResultModel)
async def submit_quiz(
    strStudentID: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Submit the complete quiz and get final results"""
    if current_user.id != strStudentID and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to submit quiz for this student"
        )
    
    objQuizManager = QuizManager()
    return await objQuizManager.submit_quiz(strStudentID) 
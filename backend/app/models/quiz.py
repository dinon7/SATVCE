from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .base import TimestampModel

class QuizQuestion(BaseModel):
    """Quiz question model"""
    id: str
    text: str
    type: str  # "multiple_choice", "slider", "text"
    options: Optional[List[str]] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None

class QuizAnswer(BaseModel):
    """Quiz answer model"""
    question_id: str
    answer: Any  # Can be string, number, or list depending on question type

class QuizStage(BaseModel):
    """Quiz stage model"""
    stage_number: int
    questions: List[QuizQuestion]
    description: str

class QuizResponse(BaseModel):
    """Quiz response model"""
    stage_number: int
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    """Quiz result model"""
    user_id: str
    initial_answers: Optional[Dict[str, Any]] = None
    follow_up_answers: Optional[Dict[str, Any]] = None
    recommendations: Optional[Dict[str, Any]] = None
    stage: Optional[str] = None
    stage1_results: Optional[Dict[str, Any]] = None
    stage2_results: Optional[Dict[str, Any]] = None
    recommended_subjects: Optional[List[str]] = None
    recommended_careers: Optional[List[str]] = None
    confidence_score: Optional[float] = None

class QuizResultInDB(QuizResult, TimestampModel):
    """Quiz result as stored in database"""
    id: str
    is_complete: bool = False 
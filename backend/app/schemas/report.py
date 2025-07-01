from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class JobMarketData(BaseModel):
    salaryMedian: int
    demandTrend: str
    industryTags: List[str]

class SubjectRecommendation(BaseModel):
    subjectCode: str
    subjectName: str
    subjectDescription: str
    imageUrl: str
    relatedCareers: List[str]
    relatedUniversities: List[str]
    scalingScore: float
    popularityIndex: float
    difficultyRating: float
    studyTips: List[str]
    prerequisites: List[str]
    jobMarketData: dict

class CareerReportRequest(BaseModel):
    selected_careers: List[str]

class CareerReportResponse(BaseModel):
    selected_careers: List[str]
    subject_recommendations: List[SubjectRecommendation]
    study_resources: List[str]
    generated_at: datetime

class QuizRequest(BaseModel):
    userId: str
    quizAnswers: dict

class CareerPreference(BaseModel):
    career_title: str
    is_interested: bool 
from pydantic import BaseModel, Field
from typing import List, Optional

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
    scalingScore: float = Field(..., ge=0.0, le=1.0)
    popularityIndex: int
    difficultyRating: int = Field(..., ge=1, le=5)
    studyTips: List[str]
    jobMarketData: JobMarketData
    prerequisites: List[str]

class CareerReportResponse(BaseModel):
    studentId: str
    recommendations: List[SubjectRecommendation]

class QuizRequest(BaseModel):
    userId: str
    quizAnswers: dict 
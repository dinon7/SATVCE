from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class JobMarketData(BaseModel):
    salary_range: Dict[str, float]
    demand_level: str
    growth_rate: float
    required_education: List[str]

class CareerBase(BaseModel):
    """Base career model"""
    title: str
    description: str
    related_subjects: List[str] = []
    job_market_data: JobMarketData

class CareerCreate(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    education_requirements: List[str]
    job_outlook: str
    salary_range: str

class CareerUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    education_requirements: Optional[List[str]] = None
    job_outlook: Optional[str] = None
    salary_range: Optional[str] = None

class CareerResponse(BaseModel):
    id: str
    title: str
    description: str
    required_skills: List[str]
    education_requirements: List[str]
    job_outlook: str
    salary_range: str

class CareerPreference(BaseModel):
    career_title: str
    is_interested: bool

class CareerPreferenceUpdate(BaseModel):
    is_interested: bool

class SubjectRecommendation(BaseModel):
    subjectCode: str
    subjectName: str
    subjectDescription: str
    relatedCareers: List[str]
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

class Career(CareerBase):
    """Career model"""
    id: str
    popularity_score: float = 0.0
    required_skills: List[str] = []
    career_path: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CareerPathway(BaseModel):
    id: str
    strCareerTitle: str = Field(..., description="Career title")
    arrSubjectsRequired: List[str] = Field(default_factory=list, description="List of required subject codes")
    arrCoursesLinked: List[str] = Field(default_factory=list, description="List of linked course IDs or names")
    strGrowthStats: Optional[str] = Field(None, description="Growth statistics or job outlook")
    strIndustryField: Optional[str] = Field(None, description="Industry field")
    txtAIAdvice: Optional[str] = Field(None, description="AI-generated advice or commentary")
    strAddedBy: Optional[str] = Field(None, description="Admin user who added this pathway")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CareerPathwayCreate(BaseModel):
    strCareerTitle: str = Field(..., description="Career title")
    arrSubjectsRequired: List[str] = Field(default_factory=list, description="List of required subject codes")
    arrCoursesLinked: List[str] = Field(default_factory=list, description="List of linked course IDs or names")
    strGrowthStats: Optional[str] = Field(None, description="Growth statistics or job outlook")
    strIndustryField: Optional[str] = Field(None, description="Industry field")
    txtAIAdvice: Optional[str] = Field(None, description="AI-generated advice or commentary")

class CareerPathwayUpdate(BaseModel):
    strCareerTitle: Optional[str] = Field(None, description="Career title")
    arrSubjectsRequired: Optional[List[str]] = Field(None, description="List of required subject codes")
    arrCoursesLinked: Optional[List[str]] = Field(None, description="List of linked course IDs or names")
    strGrowthStats: Optional[str] = Field(None, description="Growth statistics or job outlook")
    strIndustryField: Optional[str] = Field(None, description="Industry field")
    txtAIAdvice: Optional[str] = Field(None, description="AI-generated advice or commentary") 
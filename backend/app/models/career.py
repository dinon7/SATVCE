from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class JobMarketData(BaseModel):
    """Job market data model"""
    salary_range: Dict[str, float]  # e.g., {"min": 50000, "max": 100000}
    demand_level: str  # e.g., "High", "Medium", "Low"
    growth_rate: float  # Percentage
    required_education: List[str]

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

class CareerInDB(CareerBase):
    """Career model as stored in database"""
    id: str
    popularity_score: float = 0.0
    required_skills: List[str] = []
    career_path: List[str] = []  # Career progression path

class CareerResponse(BaseModel):
    id: str
    title: str
    description: str
    required_skills: List[str]
    education_requirements: List[str]
    job_outlook: str
    salary_range: str

    @classmethod
    def from_dict(cls, data: dict, id: str) -> 'CareerResponse':
        return cls(
            id=id,
            title=data['title'],
            description=data['description'],
            related_subjects=data.get('related_subjects', []),
            job_market_data=JobMarketData(**data['job_market_data']),
            popularity_score=data.get('popularity_score', 0.0),
            required_skills=data.get('required_skills', []),
            career_path=data.get('career_path', []),
            education_requirements=data.get('education_requirements', []),
            job_outlook=data.get('job_outlook', ''),
            salary_range=data.get('salary_range', '')
        )

class CareerReportRequest(BaseModel):
    selected_careers: List[str]

class CareerReportResponse(BaseModel):
    selected_careers: List[str]
    subject_recommendations: List[SubjectRecommendation]
    study_resources: List[str]
    generated_at: datetime

class CareerPreference(BaseModel):
    """Model for storing user career preferences"""
    user_id: str
    career_title: str
    is_interested: bool
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CareerPreferenceUpdate(BaseModel):
    """Model for updating career preferences"""
    is_interested: bool

class Career(BaseModel):
    id: str = None
    title: str
    description: str
    required_skills: list = []
    education_requirements: list = []
    job_outlook: str = ""
    salary_range: str = ""
    popularity_score: float = 0.0
    career_path: list = []
    related_subjects: list = []
    job_market_data: dict = {}
    # Add any other fields as needed

    @classmethod
    def from_dict(cls, data: dict) -> 'Career':
        return cls(
            id=data.get('id'),
            title=data.get('title', ''),
            description=data.get('description', ''),
            required_skills=data.get('required_skills', []),
            education_requirements=data.get('education_requirements', []),
            job_outlook=data.get('job_outlook', ''),
            salary_range=data.get('salary_range', ''),
            popularity_score=data.get('popularity_score', 0.0),
            career_path=data.get('career_path', []),
            related_subjects=data.get('related_subjects', []),
            job_market_data=data.get('job_market_data', {})
        )

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'required_skills': self.required_skills,
            'education_requirements': self.education_requirements,
            'job_outlook': self.job_outlook,
            'salary_range': self.salary_range,
            'popularity_score': self.popularity_score,
            'career_path': self.career_path,
            'related_subjects': self.related_subjects,
            'job_market_data': self.job_market_data
        }

    def update_from_dict(self, data: dict):
        for field in self.__fields__:
            if field in data:
                setattr(self, field, data[field]) 
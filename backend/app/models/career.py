from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class JobMarketData(BaseModel):
    """Job market data model"""
    salary_range: Dict[str, float]  # e.g., {"min": 50000, "max": 100000}
    demand_level: str  # e.g., "High", "Medium", "Low"
    growth_rate: float  # Percentage
    required_education: List[str]

class CareerBase(BaseModel):
    """Base career model"""
    title: str
    description: str
    related_subjects: List[str] = []
    job_market_data: JobMarketData

class CareerCreate(CareerBase):
    """Career creation model"""
    pass

class CareerUpdate(BaseModel):
    """Career update model"""
    title: Optional[str] = None
    description: Optional[str] = None
    related_subjects: Optional[List[str]] = None
    job_market_data: Optional[JobMarketData] = None

class CareerInDB(CareerBase):
    """Career model as stored in database"""
    id: str
    popularity_score: float = 0.0
    required_skills: List[str] = []
    career_path: List[str] = []  # Career progression path

class CareerResponse(CareerBase):
    """Career response model"""
    id: str
    popularity_score: float
    required_skills: List[str]
    career_path: List[str]

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
            career_path=data.get('career_path', [])
        ) 
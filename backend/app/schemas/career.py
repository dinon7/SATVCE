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

class CareerCreate(CareerBase):
    """Career creation model"""
    pass

class CareerUpdate(BaseModel):
    """Career update model"""
    title: Optional[str] = None
    description: Optional[str] = None
    related_subjects: Optional[List[str]] = None
    job_market_data: Optional[JobMarketData] = None

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
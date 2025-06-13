from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class Course(BaseModel):
    """Course schema for API responses"""
    id: str
    title: str
    description: str
    category: str
    university: str
    duration: str
    atar_requirement: Optional[float] = None
    fees: Optional[Dict] = None
    location: Optional[str] = None
    study_mode: Optional[str] = None
    prerequisites: List[str] = []
    career_outcomes: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    """Schema for creating a new course"""
    title: str
    description: str
    category: str
    university: str
    duration: str
    atar_requirement: Optional[float] = None
    fees: Optional[Dict] = None
    location: Optional[str] = None
    study_mode: Optional[str] = None
    prerequisites: List[str] = []
    career_outcomes: List[str] = [] 
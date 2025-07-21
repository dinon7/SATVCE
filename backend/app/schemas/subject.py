from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class SubjectBase(BaseModel):
    """Base subject model"""
    title: str
    description: str
    atar_scaling: float = Field(ge=0.0, le=1.0)
    difficulty_rating: int = Field(ge=1, le=5)
    related_careers: List[str] = []

class SubjectCreate(SubjectBase):
    """Subject creation model"""
    pass

class SubjectUpdate(BaseModel):
    """Subject update model"""
    title: Optional[str] = None
    description: Optional[str] = None
    atar_scaling: Optional[float] = Field(None, ge=0.0, le=1.0)
    difficulty_rating: Optional[int] = Field(None, ge=1, le=5)
    related_careers: Optional[List[str]] = None

class Subject(SubjectBase):
    """Subject model"""
    id: str
    popularity_score: float = 0.0
    prerequisites: List[str] = []
    recommended_subjects: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 
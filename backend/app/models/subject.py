from typing import List, Optional
from pydantic import BaseModel, Field

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

class SubjectInDB(SubjectBase):
    """Subject model as stored in database"""
    id: str
    popularity_score: float = 0.0
    prerequisites: List[str] = []
    recommended_subjects: List[str] = []

class SubjectResponse(SubjectBase):
    """Subject response model"""
    id: str
    popularity_score: float
    prerequisites: List[str]
    recommended_subjects: List[str]

    @classmethod
    def from_dict(cls, data: dict, id: str) -> 'SubjectResponse':
        return cls(
            id=id,
            title=data['title'],
            description=data['description'],
            atar_scaling=data['atar_scaling'],
            difficulty_rating=data['difficulty_rating'],
            related_careers=data.get('related_careers', []),
            popularity_score=data.get('popularity_score', 0.0),
            prerequisites=data.get('prerequisites', []),
            recommended_subjects=data.get('recommended_subjects', [])
        ) 
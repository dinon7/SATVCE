from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class Course:
    """Course model for Firebase"""
    def __init__(
        self,
        title: str,
        description: str,
        category: str,
        university: str,
        duration: str,
        atar_requirement: Optional[float] = None,
        fees: Optional[Dict] = None,
        location: Optional[str] = None,
        study_mode: Optional[str] = None,
        prerequisites: List[str] = None,
        career_outcomes: List[str] = None,
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.title = title
        self.description = description
        self.category = category
        self.university = university
        self.duration = duration
        self.atar_requirement = atar_requirement
        self.fees = fees
        self.location = location
        self.study_mode = study_mode
        self.prerequisites = prerequisites or []
        self.career_outcomes = career_outcomes or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at

    def to_dict(self) -> dict:
        """Convert course to dictionary for Firebase"""
        return {
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'university': self.university,
            'duration': self.duration,
            'atar_requirement': self.atar_requirement,
            'fees': self.fees,
            'location': self.location,
            'study_mode': self.study_mode,
            'prerequisites': self.prerequisites,
            'career_outcomes': self.career_outcomes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def from_dict(cls, data: dict, id: str) -> 'Course':
        """Create course from Firebase data"""
        return cls(
            id=id,
            title=data['title'],
            description=data['description'],
            category=data['category'],
            university=data['university'],
            duration=data['duration'],
            atar_requirement=data.get('atar_requirement'),
            fees=data.get('fees'),
            location=data.get('location'),
            study_mode=data.get('study_mode'),
            prerequisites=data.get('prerequisites', []),
            career_outcomes=data.get('career_outcomes', []),
            created_at=datetime.fromisoformat(data['created_at']),
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None
        )

class CourseBase(BaseModel):
    """Base course model"""
    title: str
    description: str
    category: str
    university: str
    duration: str
    atar_requirement: Optional[float] = None
    fees: Optional[dict] = None
    location: Optional[str] = None
    study_mode: Optional[str] = None
    prerequisites: List[str] = []
    career_outcomes: List[str] = []

class CourseCreate(CourseBase):
    """Course creation model"""
    pass

class CourseUpdate(BaseModel):
    """Course update model"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    university: Optional[str] = None
    duration: Optional[str] = None
    atar_requirement: Optional[float] = None
    fees: Optional[dict] = None
    location: Optional[str] = None
    study_mode: Optional[str] = None
    prerequisites: Optional[List[str]] = None
    career_outcomes: Optional[List[str]] = None

class CourseInDB(CourseBase):
    """Course model as stored in database"""
    id: str

class CourseResponse(CourseBase):
    """Course response model"""
    id: str 
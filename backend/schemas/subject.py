from typing import List, Optional
from pydantic import BaseModel, Field

class SubjectInfo(BaseModel):
    subjectCode: str
    subjectName: str
    imageUrl: Optional[str]

class SubjectDetail(BaseModel):
    subjectCode: str
    subjectName: str
    subjectDescription: str
    scalingScore: float = Field(..., ge=0, le=1)
    popularityIndex: int
    difficultyRating: int = Field(..., ge=1, le=5)
    relatedCareers: List[str]
    universityCourses: List[str]
    studyTips: List[str]
    prerequisites: List[str]
    imageUrl: Optional[str]

    class Config:
        from_attributes = True 
from pydantic import BaseModel
from typing import List, Optional

class SuggestionResult(BaseModel):
    subject: str
    relatedUniversityCourses: List[str]
    requiredPrerequisites: List[str]
    jobRoles: List[str]
    salaryRange: str
    industryGrowth: str
    studyPathways: List[str]
    aiReasoning: Optional[str]

class SuggestionResponse(BaseModel):
    id: str
    userId: str
    suggestions: List[SuggestionResult]
    createdAt: str 
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

class CourseUpdate(BaseModel):
    """Schema for updating an existing course"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    university: Optional[str] = None
    duration: Optional[str] = None
    atar_requirement: Optional[float] = None
    fees: Optional[Dict] = None
    location: Optional[str] = None
    study_mode: Optional[str] = None
    prerequisites: Optional[List[str]] = None
    career_outcomes: Optional[List[str]] = None

class Prerequisite(BaseModel):
    id: str
    strCourseCode: str = Field(..., description="Course code")
    strCourseTitle: str = Field(..., description="Course title")
    arrRequiredSubjects: List[str] = Field(default_factory=list, description="List of required subject codes")
    strUniversity: str = Field(..., description="University name")
    strNotes: Optional[str] = Field(None, description="Additional notes or requirements")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PrerequisiteCreate(BaseModel):
    strCourseCode: str = Field(..., description="Course code")
    strCourseTitle: str = Field(..., description="Course title")
    arrRequiredSubjects: List[str] = Field(default_factory=list, description="List of required subject codes")
    strUniversity: str = Field(..., description="University name")
    strNotes: Optional[str] = Field(None, description="Additional notes or requirements")

class PrerequisiteUpdate(BaseModel):
    strCourseCode: Optional[str] = Field(None, description="Course code")
    strCourseTitle: Optional[str] = Field(None, description="Course title")
    arrRequiredSubjects: Optional[List[str]] = Field(None, description="List of required subject codes")
    strUniversity: Optional[str] = Field(None, description="University name")
    strNotes: Optional[str] = Field(None, description="Additional notes or requirements")
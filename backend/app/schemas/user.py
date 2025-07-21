from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    first_name: str
    last_name: str
    year_level: int = Field(ge=9, le=12)

class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(min_length=8)

class UserUpdate(BaseModel):
    """User update model"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    year_level: Optional[int] = Field(None, ge=9, le=12)

class User(BaseModel):
    """User model"""
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    year_level: int
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    quiz_results: Optional[Dict[str, Any]] = None
    ai_results: Optional[Dict[str, Any]] = None
    saved_preferences: Optional[List[str]] = None
    generated_report_url: Optional[str] = None

class UserResponse(BaseModel):
    """User response model"""
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    year_level: int
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True 
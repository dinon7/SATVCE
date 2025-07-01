"""
models/user.py - User data models for VCE Career Guidance backend.

- Purpose: Defines Pydantic models and user-related data structures.
- Major components: UserBase, UserCreate, UserUpdate, UserInDB, UserResponse, User.
- Variable scope: All variables are scoped to classes or functions; constants and Enums are defined at module level.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from .base import TimestampModel
from datetime import datetime
from enum import Enum

class UserRole(Enum):
    STUDENT = "student"
    ADMIN = "admin"

class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    name: str
    is_admin: bool = False
    has_completed_quiz: bool = False

class UserCreate(UserBase):
    """User creation model"""
    password: str

class UserUpdate(BaseModel):
    """User update model"""
    name: Optional[str] = None
    is_admin: Optional[bool] = None
    has_completed_quiz: Optional[bool] = None
    quiz_answers: Optional[Dict[int, str]] = None

class UserInDB(UserBase):
    """User model as stored in database"""
    uid: str
    created_at: datetime
    updated_at: datetime
    quiz_answers: Optional[Dict[int, str]] = None

    class Config:
        from_attributes = True

class UserResponse(UserInDB):
    """Response model for user data"""
    pass

class User(UserInDB):
    pass

def example_user_usage():
    """Example of instantiating a User and accessing attributes."""
    user = User(email="test@example.com", name="Test", is_admin=False)
    print(user.email)  # Accessing attribute 
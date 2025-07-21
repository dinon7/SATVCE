from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime, ARRAY, UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from uuid import uuid4
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)  # Firebase UID
    email = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_admin = Column(Integer, default=0)  # 0 = False, 1 = True
    has_completed_quiz = Column(Integer, default=0)  # 0 = False, 1 = True
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    career_reports = relationship("CareerReport", back_populates="user")
    preferences = relationship("UserPreference", back_populates="user")

class CareerReport(Base):
    __tablename__ = "career_reports"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    recommendations = Column(JSON, nullable=False)  # Stores the full recommendations array

    # Relationships
    user = relationship("User", back_populates="career_reports")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject_code = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="preferences")

    class Config:
        orm_mode = True

class Subject(Base):
    __tablename__ = "subjects"

    subjectCode = Column(String, primary_key=True)
    subjectName = Column(String, nullable=False)
    subjectDescription = Column(String, nullable=False)
    scalingScore = Column(Float, nullable=False)
    popularityIndex = Column(Integer, nullable=False)
    difficultyRating = Column(Integer, nullable=False)
    relatedCareers = Column(JSON, nullable=False)
    universityCourses = Column(JSON, nullable=False)
    studyTips = Column(JSON, nullable=False)
    prerequisites = Column(JSON, nullable=False)
    imageUrl = Column(String)

    class Config:
        orm_mode = True

class Resource(Base):
    __tablename__ = "resources"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(String, nullable=False)
    tags = Column(JSON, nullable=False)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Suggestion(Base):
    __tablename__ = "suggestions"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, nullable=False)
    suggestions = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow) 
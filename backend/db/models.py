from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime, ARRAY, UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from uuid import uuid4
from datetime import datetime

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
    relatedCareers = Column(ARRAY(String), nullable=False)
    universityCourses = Column(ARRAY(String), nullable=False)
    studyTips = Column(ARRAY(String), nullable=False)
    prerequisites = Column(ARRAY(String), nullable=False)
    imageUrl = Column(String)

    class Config:
        orm_mode = True

class Resource(Base):
    __tablename__ = "resources"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(String, nullable=False)
    tags = Column(ARRAY(String), nullable=False)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Suggestion(Base):
    __tablename__ = "suggestions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(String, nullable=False)
    suggestions = Column(JSONB, nullable=False)  # Store AI response
    created_at = Column(DateTime, default=datetime.utcnow) 
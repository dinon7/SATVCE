from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from firebase_admin import db
import requests
from bs4 import BeautifulSoup
import json

from app.models.career import CareerCreate, CareerUpdate, CareerResponse
from app.services.auth import get_current_user
from app.models.user import UserResponse
from app.schemas.career import Career
from app.models.career import CareerInDB as CareerModel

router = APIRouter()
careers_ref = db.reference('careers')

@router.get("/careers", response_model=List[Career])
async def get_careers(
    current_user = Depends(get_current_user)
):
    """Get all careers with their details"""
    careers_data = careers_ref.get()
    if not careers_data:
        return []
    return [Career.from_dict(data, id) for id, data in careers_data.items()]

@router.get("/careers/{career_id}", response_model=Career)
async def get_career(
    career_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific career by ID"""
    career_data = careers_ref.child(career_id).get()
    if not career_data:
        raise HTTPException(status_code=404, detail="Career not found")
    return Career.from_dict(career_data, career_id)

@router.get("/careers/industry/{industry}", response_model=List[Career])
async def get_careers_by_industry(
    industry: str,
    current_user = Depends(get_current_user)
):
    """Get careers by industry"""
    careers_data = careers_ref.get()
    if not careers_data:
        return []
    return [
        Career.from_dict(data, id)
        for id, data in careers_data.items()
        if data.get('industry') == industry
    ]

@router.get("/careers/search/{query}", response_model=List[Career])
async def search_careers(
    query: str,
    current_user = Depends(get_current_user)
):
    """Search careers by title or description"""
    careers_data = careers_ref.get()
    if not careers_data:
        return []
    query = query.lower()
    return [
        Career.from_dict(data, id)
        for id, data in careers_data.items()
        if query in data.get('title', '').lower() or query in data.get('description', '').lower()
    ]

@router.get("/careers/fetch-market-data/{career_id}")
async def fetch_market_data(
    career_id: str,
    current_user = Depends(get_current_user)
):
    """Fetch real-time market data for a career"""
    career_data = careers_ref.child(career_id).get()
    if not career_data:
        raise HTTPException(status_code=404, detail="Career not found")

    try:
        # Example: Fetch data from job market APIs
        # You would need to replace these with actual API endpoints and keys
        market_data = {
            "current_demand": "High",
            "salary_trends": "Increasing",
            "job_growth": "12%",
            "remote_work_availability": "Yes",
            "top_skills_demand": ["Python", "Machine Learning", "Data Analysis"],
            "industry_trends": "Growing in AI and automation"
        }
        
        return market_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/careers/fetch-education-paths/{career_id}")
async def fetch_education_paths(
    career_id: str,
    current_user = Depends(get_current_user)
):
    """Fetch education paths and requirements for a career"""
    career_data = careers_ref.child(career_id).get()
    if not career_data:
        raise HTTPException(status_code=404, detail="Career not found")

    try:
        # Example: Fetch data from education APIs or databases
        education_paths = {
            "required_degrees": ["Bachelor's in Computer Science", "Master's in Data Science"],
            "certifications": ["AWS Certified", "Google Cloud Professional"],
            "prerequisites": ["Mathematics", "Statistics", "Programming"],
            "recommended_courses": ["Machine Learning", "Data Structures", "Algorithms"],
            "online_learning_resources": [
                "Coursera Data Science Specialization",
                "edX Machine Learning Course"
            ]
        }
        
        return education_paths
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/careers", response_model=CareerResponse)
async def create_career(
    career: CareerCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new career (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    career_data = career.dict()
    result = careers_ref.push(career_data)
    return CareerResponse.from_dict(career_data, result.key)

@router.put("/careers/{career_id}", response_model=CareerResponse)
async def update_career(
    career_id: str,
    career: CareerUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a career (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    career_data = career.dict(exclude_unset=True)
    careers_ref.child(career_id).update(career_data)
    updated_data = careers_ref.child(career_id).get()
    return CareerResponse.from_dict(updated_data, career_id)

@router.delete("/careers/{career_id}")
async def delete_career(
    career_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a career (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    careers_ref.child(career_id).delete()
    return {"message": "Career deleted successfully"} 
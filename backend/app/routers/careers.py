from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request
import requests
from bs4 import BeautifulSoup
import json

from ..models.career import CareerCreate, CareerUpdate, CareerResponse, CareerReportRequest, CareerReportResponse, CareerPreference, CareerPreferenceUpdate
from ..services.auth import get_current_user
from ..models.user import UserResponse
from ..schemas.career import Career
from ..models.career import CareerInDB as CareerModel
from ..services.ai_service import AIService
from ..services.career_service import CareerService
from ..services.supabase_service import supabase_service

router = APIRouter()
career_service = CareerService()

@router.get("/", response_model=List[Career])
async def get_careers():
    """Get all careers with their details (public)"""
    try:
        return await career_service.get_careers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{career_id}", response_model=Career)
async def get_career(career_id: str):
    """Get a specific career by ID (public)"""
    try:
        career = await career_service.get_career(career_id)
        if not career:
            raise HTTPException(status_code=404, detail="Career not found")
        return career
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/industry/{industry}", response_model=List[Career])
async def get_careers_by_industry(industry: str):
    """Get careers by industry (public)"""
    try:
        return await career_service.get_careers_by_industry(industry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/{query}", response_model=List[Career])
async def search_careers(query: str):
    """Search careers by title or description (public)"""
    try:
        return await career_service.search_careers(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pathways")
async def get_career_pathways():
    """Get career pathways (public)"""
    try:
        # Get common pathways from Supabase
        pathways = await supabase_service.get_common_pathways(limit=20)
        return {"pathways": pathways}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fetch-market-data/{career_id}")
async def fetch_market_data(
    career_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Fetch real-time market data for a career"""
    try:
        career = await career_service.get_by_id(career_id)
        if not career:
            raise HTTPException(status_code=404, detail="Career not found")

        # Get market data from career service
        market_data = await career_service.get_career_market_data(career_id)
        if not market_data:
            raise HTTPException(status_code=404, detail="Market data not found")
        
        return market_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fetch-education-paths/{career_id}")
async def fetch_education_paths(
    career_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Fetch education paths and requirements for a career"""
    try:
        career = await career_service.get_by_id(career_id)
        if not career:
            raise HTTPException(status_code=404, detail="Career not found")

        # Example: Fetch data from education APIs or databases
        education_paths = {
            "required_degrees": career.education_requirements.get("degrees", []),
            "certifications": career.education_requirements.get("certifications", []),
            "prerequisites": career.education_requirements.get("prerequisites", []),
            "recommended_courses": career.education_requirements.get("courses", []),
            "online_learning_resources": career.education_requirements.get("online_resources", [])
        }
        
        return education_paths
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Career)
async def create_career(
    career: CareerCreate,
    current_user = Depends(get_current_user)
):
    """Create a new career (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        objCareer = await career_service.create_career(career)
        return objCareer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{career_id}", response_model=Career)
async def update_career(
    career_id: str,
    career: CareerUpdate,
    current_user = Depends(get_current_user)
):
    """Update a career (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        objCareer = await career_service.update_career(career_id, career)
        if not objCareer:
            raise HTTPException(status_code=404, detail="Career not found")
        return objCareer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{career_id}")
async def delete_career(
    career_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a career (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        blnDeleted = await career_service.delete_career(career_id)
        if not blnDeleted:
            raise HTTPException(status_code=404, detail="Career not found")
        return {"message": "Career deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations")
async def generate_career_recommendations(request: Request, current_user: Dict = Depends(get_current_user)):
    """
    Generate career recommendations using Gemini AI based on quiz answers.
    """
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    data = await request.json()
    answers = data.get("answers")
    if not answers:
        raise HTTPException(status_code=400, detail="Missing quiz answers.")

    ai_service = AIService()

    # Step 1: Analyze quiz answers
    quiz_analysis = await ai_service.analyze_quiz_responses(clerk_user_id, answers)

    # Step 2: Generate career recommendations using the analysis
    recommendations = await ai_service.generate_career_recommendations(
        user_id=clerk_user_id,
        quiz_analysis=quiz_analysis,
        subject_recommendations=[]  # Subject recommendations come later, after careers are chosen
    )
    return recommendations

@router.post("/report", response_model=CareerReportResponse)
async def generate_career_report(
    request: CareerReportRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Generate a full career report including subject recommendations and study resources
    based on selected careers.
    """
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    ai_service = AIService()

    # Get the user's quiz analysis from cache
    quiz_analysis = await ai_service.cache.get(f"quiz_analysis:{clerk_user_id}")
    if not quiz_analysis:
        raise HTTPException(status_code=400, detail="No quiz analysis found. Please complete the quiz first.")

    # Generate subject recommendations based on selected careers
    subject_recommendations = await ai_service.generate_subject_recommendations(
        user_id=clerk_user_id,
        quiz_analysis=quiz_analysis,
        current_subjects=request.current_subjects
    )

    # Generate study resources
    study_resources = await ai_service.generate_study_resources(
        user_id=clerk_user_id,
        subject_recommendations=subject_recommendations,
        career_titles=request.selected_careers
    )

    # Save the complete report to Supabase
    report_data = {
        "quiz_analysis": quiz_analysis,
        "selected_careers": request.selected_careers,
        "subject_recommendations": subject_recommendations,
        "study_resources": study_resources,
        "current_subjects": request.current_subjects
    }
    
    await supabase_service.save_career_report(clerk_user_id, report_data)

    return CareerReportResponse(
        quiz_analysis=quiz_analysis,
        selected_careers=request.selected_careers,
        subject_recommendations=subject_recommendations,
        study_resources=study_resources,
        current_subjects=request.current_subjects
    )

@router.post("/preferences/{career_title}")
async def save_career_preference(
    career_title: str,
    preference: CareerPreferenceUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Save user's preference for a specific career"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    try:
        # Get user ID from Supabase
        user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Save preference to Supabase
        preference_data = {
            'user_id': user['id'],
            'career_title': career_title,
            'preference_level': preference.preference_level,
            'notes': preference.notes,
            'created_at': supabase_service.get_current_timestamp()
        }
        
        response = supabase_service.client.table('career_preferences').upsert(preference_data).execute()
        return {"message": "Career preference saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preferences")
async def get_career_preferences(
    current_user: Dict = Depends(get_current_user)
):
    """Get user's career preferences"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    try:
        # Get user ID from Supabase
        user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get preferences from Supabase
        response = supabase_service.client.table('career_preferences').select('*').eq('user_id', user['id']).execute()
        preferences = response.data if response.data else []
        
        return preferences
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
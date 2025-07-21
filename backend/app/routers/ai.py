from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Dict, Any, Optional
from app.services.ai_service import AIService
from app.services.auth import get_current_user

router = APIRouter(
    prefix="/api/ai",
    tags=["ai"]
)

ai_service = AIService()

@router.post("/analyze")
async def analyze_quiz_responses(
    request: Request,
    current_user: Dict = Depends(get_current_user)
):
    """Analyze quiz responses using AI"""
    try:
        clerk_user_id = current_user.get("sub")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        data = await request.json()
        answers = data.get("answers")
        if not answers:
            raise HTTPException(status_code=400, detail="Missing quiz answers")
        
        analysis = await ai_service.analyze_quiz_responses(clerk_user_id, answers)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-report")
async def generate_career_report(
    request: Request,
    current_user: Dict = Depends(get_current_user)
):
    """Generate a comprehensive career report using AI"""
    try:
        clerk_user_id = current_user.get("sub")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        data = await request.json()
        selected_careers = data.get("selected_careers", [])
        current_subjects = data.get("current_subjects", [])
        
        if not selected_careers:
            raise HTTPException(status_code=400, detail="No careers selected")
        
        report = await ai_service.generate_career_report(
            user_id=clerk_user_id,
            selected_careers=selected_careers,
            current_subjects=current_subjects
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations")
async def generate_career_recommendations(
    request: Request,
    current_user: Dict = Depends(get_current_user)
):
    """Generate career recommendations using AI"""
    try:
        clerk_user_id = current_user.get("sub")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        data = await request.json()
        quiz_analysis = data.get("quiz_analysis", {})
        
        recommendations = await ai_service.generate_career_recommendations(
            user_id=clerk_user_id,
            quiz_analysis=quiz_analysis,
            subject_recommendations=[]
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subject-recommendations")
async def generate_subject_recommendations(
    request: Request,
    current_user: Dict = Depends(get_current_user)
):
    """Generate subject recommendations using AI"""
    try:
        clerk_user_id = current_user.get("sub")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        data = await request.json()
        quiz_analysis = data.get("quiz_analysis", {})
        current_subjects = data.get("current_subjects", [])
        
        recommendations = await ai_service.generate_subject_recommendations(
            user_id=clerk_user_id,
            quiz_analysis=quiz_analysis,
            current_subjects=current_subjects
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/study-resources")
async def generate_study_resources(
    request: Request,
    current_user: Dict = Depends(get_current_user)
):
    """Generate study resources using AI"""
    try:
        clerk_user_id = current_user.get("sub")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        data = await request.json()
        subject_recommendations = data.get("subject_recommendations", [])
        career_titles = data.get("career_titles", [])
        
        resources = await ai_service.generate_study_resources(
            user_id=clerk_user_id,
            subject_recommendations=subject_recommendations,
            career_titles=career_titles
        )
        return resources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
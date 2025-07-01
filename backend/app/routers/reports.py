from fastapi import APIRouter, HTTPException, Depends, status, Response, Request
from fastapi.responses import StreamingResponse
from typing import List
from ..schemas.report import QuizRequest, CareerReportResponse, SubjectRecommendation
from ..services.ai import call_gemini_api, generate_recommendations
from ..services.supabase_service import supabase_service
from ..middleware.clerk_auth import get_current_user
import io
import json

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)

@router.get("/", summary="Reports root endpoint")
async def reports_root():
    """Placeholder for reports endpoints."""
    return {"message": "Reports endpoint is ready for production."}

@router.post("/career", response_model=CareerReportResponse)
async def generate_career_report(
    data: QuizRequest,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a career report based on quiz answers using AI recommendations.
    """
    try:
        # Verify user authorization
        if data.userId != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to generate report for this user"
            )

        # Generate AI recommendations
        recommendations = await generate_recommendations(data.quizAnswers)

        # Save to Supabase
        await supabase_service.save_career_report(current_user["id"], recommendations)

        # Return the career report
        return CareerReportResponse(
            studentId=current_user["id"],
            recommendations=recommendations
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating career report: {str(e)}"
        )

@router.post("/career/pdf")
async def generate_career_report_pdf(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Generate and download a comprehensive PDF version of the career report with selected careers."""
    try:
        # Get the request body with comprehensive data
        body = await request.json()
        
        # Extract data from request
        selected_careers = body.get("selected_careers", [])
        quiz_results = body.get("quiz_results", {})
        study_resources = body.get("study_resources", [])
        
        # Prepare comprehensive report data
        report_data = {
            "selected_careers": selected_careers,
            "subject_recommendations": [],  # Will be populated from quiz_results if available
            "study_resources": study_resources,
            "quiz_results": {
                "recommendations": quiz_results.get("recommendations", {})
            }
        }

        # For now, return a simple response since PDF generation requires additional setup
        # TODO: Implement PDF generation with proper template and styling
        return {
            "message": "PDF generation endpoint ready",
            "data": report_data,
            "user_id": current_user["id"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}"
        )

@router.get("/career/pdf")
async def get_career_report_pdf(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Generate and download a comprehensive PDF version of the career report."""
    try:
        # Get the latest report from Supabase
        report = await supabase_service.get_latest_career_report(current_user["id"])
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No career report found"
            )

        # Prepare comprehensive report data
        report_data = {
            "selected_careers": [],  # Will be populated from localStorage on frontend
            "subject_recommendations": report.get("content", {}).get("subject_recommendations", []),
            "study_resources": report.get("content", {}).get("study_resources", []),
            "quiz_results": {
                "recommendations": report.get("content", {})
            }
        }

        # For now, return a simple response since PDF generation requires additional setup
        # TODO: Implement PDF generation with proper template and styling
        return {
            "message": "PDF generation endpoint ready",
            "data": report_data,
            "user_id": current_user["id"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}"
        ) 
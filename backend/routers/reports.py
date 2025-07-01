from fastapi import APIRouter, HTTPException, Depends, status, Response, Request
from fastapi.responses import StreamingResponse
from typing import List
from sqlalchemy.orm import Session
from ..schemas.report import QuizRequest, CareerReportResponse, SubjectRecommendation
from ..services.ai_client import build_prompt, call_gemini, parse_response
from ..services.report_service import ReportService
from ..services.pdf_service import PDFService
from ..services.supabase_service import supabase_service
from ..middleware.clerk_auth import get_current_user
from ..db.database import get_db
import io

router = APIRouter(prefix="/api/reports", tags=["Career Report"])

@router.post("/career", response_model=CareerReportResponse)
async def generate_career_report(
    data: QuizRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
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

        # Build AI prompt and get recommendations
        prompt = build_prompt(data.quizAnswers)
        ai_response = await call_gemini(prompt)
        recommendations = parse_response(ai_response)

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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
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

        # Generate PDF with comprehensive data
        pdf_service = PDFService()
        pdf_content = await pdf_service.generate_career_report_pdf(
            current_user["id"],
            report_data
        )

        # Return PDF as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="career_report_{current_user["id"]}.pdf"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}"
        )

@router.get("/career/pdf")
async def get_career_report_pdf(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
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

        # Generate PDF with comprehensive data
        pdf_service = PDFService()
        pdf_content = await pdf_service.generate_career_report_pdf(
            current_user["id"],
            report_data
        )

        # Return PDF as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="career_report_{current_user["id"]}.pdf"'
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating PDF: {str(e)}"
        )

@router.post("/preferences/{subject_code}")
async def save_subject_preference(
    subject_code: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a subject to user's preferences."""
    try:
        # This would need to be implemented based on your subject preferences structure
        # For now, returning a placeholder response
        return {"message": "Preference saved successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving preference: {str(e)}"
        )

@router.get("/preferences")
async def get_subject_preferences(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all subject preferences for the current user."""
    try:
        # Get user preferences from Supabase
        preferences = await supabase_service.get_user_preferences(current_user["id"])
        return {"preferences": preferences}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting preferences: {str(e)}"
        )

@router.delete("/preferences/{subject_code}")
async def remove_subject_preference(
    subject_code: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a subject from user's preferences."""
    try:
        # This would need to be implemented based on your subject preferences structure
        # For now, returning a placeholder response
        return {"message": "Preference removed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing preference: {str(e)}"
        ) 
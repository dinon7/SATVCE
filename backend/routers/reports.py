from fastapi import APIRouter, HTTPException, Depends, status, Response
from fastapi.responses import StreamingResponse
from typing import List
from sqlalchemy.orm import Session
from ..schemas.report import QuizRequest, CareerReportResponse, SubjectRecommendation
from ..services.ai_client import build_prompt, call_gemini, parse_response
from ..services.report_service import ReportService
from ..services.pdf_service import PDFService
from ..utils.auth import get_current_user
from ..db.database import get_db
import io

router = APIRouter(prefix="/api/reports", tags=["Career Report"])

@router.post("/career", response_model=CareerReportResponse)
async def generate_career_report(
    data: QuizRequest,
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

        # Save to database
        report_service = ReportService(db)
        await report_service.save_career_report(current_user["id"], recommendations)

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

@router.get("/career/pdf")
async def get_career_report_pdf(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and download a PDF version of the career report."""
    try:
        # Get the latest report
        report_service = ReportService(db)
        report = await report_service.get_latest_report(current_user["id"])
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No career report found"
            )

        # Generate PDF
        pdf_service = PDFService()
        pdf_content = await pdf_service.generate_career_report_pdf(
            current_user["id"],
            [SubjectRecommendation(**rec) for rec in report.recommendations]
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a subject to user's preferences."""
    try:
        report_service = ReportService(db)
        preference = await report_service.save_preference(current_user["id"], subject_code)
        return {"message": "Preference saved successfully", "preference": preference}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving preference: {str(e)}"
        )

@router.get("/preferences")
async def get_subject_preferences(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all subject preferences for the current user."""
    try:
        report_service = ReportService(db)
        preferences = await report_service.get_preferences(current_user["id"])
        return {"preferences": preferences}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting preferences: {str(e)}"
        )

@router.delete("/preferences/{subject_code}")
async def remove_subject_preference(
    subject_code: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a subject from user's preferences."""
    try:
        report_service = ReportService(db)
        success = await report_service.remove_preference(current_user["id"], subject_code)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preference not found"
            )
        return {"message": "Preference removed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing preference: {str(e)}"
        ) 
#!/usr/bin/env python3
"""
Test script for PDF export functionality
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from services.pdf_service import PDFService
from schemas.report import CareerReportResponse, SubjectRecommendation
from datetime import datetime

async def test_pdf_generation():
    """Test PDF generation with sample data"""
    
    # Sample data for testing
    sample_report = CareerReportResponse(
        selected_careers=["Software Engineer", "Data Scientist"],
        subject_recommendations=[
            SubjectRecommendation(
                subjectCode="MATH101",
                subjectName="Advanced Mathematics",
                subjectDescription="A comprehensive course covering advanced mathematical concepts.",
                imageUrl="https://example.com/math.jpg",
                relatedCareers=["Software Engineer", "Data Scientist"],
                relatedUniversities=["University of Melbourne", "Monash University"],
                scalingScore=0.85,
                popularityIndex=0.75,
                difficultyRating=0.65,
                studyTips=["Practice regularly", "Use online resources", "Join study groups"],
                prerequisites=["Year 10 Mathematics"],
                jobMarketData={
                    "salaryMedian": 75000,
                    "demandTrend": "Growing",
                    "industryTags": ["Technology", "Finance", "Healthcare"]
                }
            ),
            SubjectRecommendation(
                subjectCode="COMP101",
                subjectName="Computer Science",
                subjectDescription="Introduction to computer science and programming.",
                imageUrl="https://example.com/comp.jpg",
                relatedCareers=["Software Engineer", "Web Developer"],
                relatedUniversities=["University of Melbourne", "RMIT University"],
                scalingScore=0.90,
                popularityIndex=0.80,
                difficultyRating=0.70,
                studyTips=["Code daily", "Build projects", "Read documentation"],
                prerequisites=["Basic computer literacy"],
                jobMarketData={
                    "salaryMedian": 80000,
                    "demandTrend": "High Growth",
                    "industryTags": ["Technology", "Startups", "Enterprise"]
                }
            )
        ],
        study_resources=[
            "Khan Academy - Advanced Mathematics",
            "Codecademy - Python Programming",
            "MIT OpenCourseWare - Computer Science",
            "Coursera - Data Science Specialization",
            "edX - Software Engineering"
        ],
        generated_at=datetime.now()
    )
    
    try:
        # Initialize PDF service
        pdf_service = PDFService()
        
        # Generate PDF
        print("Generating PDF...")
        pdf_content = await pdf_service.generate_career_report_pdf(
            "test_user_123",
            sample_report
        )
        
        # Save PDF to file
        output_path = "test_career_report.pdf"
        with open(output_path, "wb") as f:
            f.write(pdf_content)
        
        print(f"✅ PDF generated successfully: {output_path}")
        print(f"📄 File size: {len(pdf_content)} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error generating PDF: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing PDF Export Functionality")
    print("=" * 50)
    
    # Check if required dependencies are installed
    try:
        import weasyprint
        import jinja2
        print("✅ Required dependencies found")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install: pip install weasyprint jinja2")
        sys.exit(1)
    
    # Run the test
    success = asyncio.run(test_pdf_generation())
    
    if success:
        print("\n🎉 PDF export test completed successfully!")
    else:
        print("\n💥 PDF export test failed!")
        sys.exit(1) 
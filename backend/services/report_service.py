from typing import List, Optional
from sqlalchemy.orm import Session
from ..db.models import CareerReport, UserPreference
from ..schemas.report import SubjectRecommendation
import json

class ReportService:
    def __init__(self, db: Session):
        self.db = db

    async def save_career_report(self, student_id: str, recommendations: List[SubjectRecommendation]) -> CareerReport:
        """Save a new career report to the database."""
        report = CareerReport(
            student_id=student_id,
            recommendations=[rec.dict() for rec in recommendations]
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    async def get_latest_report(self, student_id: str) -> Optional[CareerReport]:
        """Get the most recent career report for a student."""
        return self.db.query(CareerReport)\
            .filter(CareerReport.student_id == student_id)\
            .order_by(CareerReport.created_at.desc())\
            .first()

    async def save_preference(self, student_id: str, subject_code: str) -> UserPreference:
        """Save a subject preference for a student."""
        preference = UserPreference(
            student_id=student_id,
            subject_code=subject_code
        )
        self.db.add(preference)
        self.db.commit()
        self.db.refresh(preference)
        return preference

    async def get_preferences(self, student_id: str) -> List[UserPreference]:
        """Get all subject preferences for a student."""
        return self.db.query(UserPreference)\
            .filter(UserPreference.student_id == student_id)\
            .all()

    async def remove_preference(self, student_id: str, subject_code: str) -> bool:
        """Remove a subject preference for a student."""
        result = self.db.query(UserPreference)\
            .filter(
                UserPreference.student_id == student_id,
                UserPreference.subject_code == subject_code
            )\
            .delete()
        self.db.commit()
        return result > 0 
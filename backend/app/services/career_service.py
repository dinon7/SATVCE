from typing import List, Optional
from firebase_admin import db
from app.models.career import Career
from app.services.base_service import BaseService

class CareerService(BaseService):
    def __init__(self):
        super().__init__(Career)
        self.careers_ref = db.reference('careers')

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Career]:
        """Get all careers"""
        careers_data = self.careers_ref.get()
        if not careers_data:
            return []
        
        careers = []
        for id, data in list(careers_data.items())[skip:skip + limit]:
            careers.append(Career.from_dict(data, id))
        return careers

    async def get_by_id(self, career_id: str) -> Optional[Career]:
        """Get a career by ID"""
        career_data = self.careers_ref.child(career_id).get()
        if not career_data:
            return None
        return Career.from_dict(career_data, career_id)

    async def create(self, career: Career) -> Career:
        """Create a new career"""
        career_data = career.to_dict()
        result = self.careers_ref.push(career_data)
        career.id = result.key
        return career

    async def update(self, career_id: str, career: Career) -> Career:
        """Update a career"""
        career_data = career.to_dict()
        self.careers_ref.child(career_id).update(career_data)
        career.id = career_id
        return career

    async def delete(self, career_id: str) -> None:
        """Delete a career"""
        self.careers_ref.child(career_id).delete()

    async def get_careers_by_industry(self, industry: str) -> List[Career]:
        """Get careers filtered by industry"""
        careers = await self.get_all()
        return [career for career in careers if career.industry == industry]

    async def get_careers_by_education_level(self, education_level: str) -> List[Career]:
        """Get careers filtered by required education level"""
        careers = await self.get_all()
        return [career for career in careers if career.required_education == education_level]

    async def get_careers_by_salary_range(self, min_salary: float, max_salary: float) -> List[Career]:
        """Get careers within a salary range"""
        careers = await self.get_all()
        return [career for career in careers if min_salary <= career.avg_salary <= max_salary]

    async def get_careers_by_growth_rate(self, min_growth_rate: float) -> List[Career]:
        """Get careers with growth rate above minimum"""
        careers = await self.get_all()
        return [career for career in careers if career.growth_rate >= min_growth_rate]

    async def get_careers_by_skills(self, skills: List[str]) -> List[Career]:
        """Get careers that require specific skills"""
        careers = await self.get_all()
        return [career for career in careers if any(skill in career.required_skills for skill in skills)]

    async def create_career(self, career_data: dict) -> Career:
        """Create a new career with validation"""
        career = Career.from_dict(career_data)
        return await self.create(career)

    async def update_career(self, career_id: str, career_data: dict) -> Optional[Career]:
        """Update an existing career with validation"""
        career = await self.get_by_id(career_id)
        if not career:
            return None
        career.update_from_dict(career_data)
        return await self.update(career_id, career)

    async def get_career_recommendations(self, skills: List[str], interests: List[str]) -> List[Career]:
        """Get career recommendations based on skills and interests"""
        careers = await self.get_all()
        return [career for career in careers if any(skill in career.required_skills for skill in skills) or any(interest in career.related_interests for interest in interests)]

    async def get_career_market_data(self, career_id: str) -> dict:
        """Get detailed market data for a specific career"""
        career = await self.get_by_id(career_id)
        if not career:
            return None
        
        return {
            "avg_salary": career.avg_salary,
            "growth_rate": career.growth_rate,
            "job_outlook": career.job_outlook,
            "market_demand": career.market_demand,
            "required_skills": career.required_skills,
            "education_requirements": career.education_requirements
        } 
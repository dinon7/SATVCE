from typing import List, Optional, Dict, Any
from ..schemas.career import Career, CareerCreate, CareerUpdate
from .supabase_service import supabase_service

class CareerService:
    """Service for career operations using Supabase."""
    
    def __init__(self):
        self.supabase = supabase_service
        self.strTableName = 'careers'

    async def get_careers(self, intSkip: int = 0, intLimit: int = 100) -> List[Career]:
        """Get all careers"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').range(intSkip, intSkip + intLimit - 1).execute()
            arrCareers = objResponse.data if objResponse.data else []
            return [Career(**objCareer) for objCareer in arrCareers]
        except Exception as objErr:
            raise Exception(f"Failed to get careers: {str(objErr)}")

    async def get_career(self, strCareerId: str) -> Optional[Career]:
        """Get a career by ID"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').eq('id', strCareerId).single().execute()
            if not objResponse.data:
                return None
            return Career(**objResponse.data)
        except Exception as objErr:
            raise Exception(f"Failed to get career: {str(objErr)}")

    async def create_career(self, objCareerCreate: CareerCreate) -> Career:
        """Create a new career"""
        try:
            dictCareer = objCareerCreate.model_dump()
            objResponse = await self.supabase.client.table(self.strTableName).insert(dictCareer).execute()
            if not objResponse.data:
                raise Exception("Failed to create career")
            return Career(**objResponse.data[0])
        except Exception as objErr:
            raise Exception(f"Failed to create career: {str(objErr)}")

    async def update_career(self, strCareerId: str, objCareerUpdate: CareerUpdate) -> Optional[Career]:
        """Update a career"""
        try:
            dictUpdate = objCareerUpdate.model_dump(exclude_unset=True)
            objResponse = await self.supabase.client.table(self.strTableName).update(dictUpdate).eq('id', strCareerId).execute()
            if not objResponse.data:
                return None
            return Career(**objResponse.data[0])
        except Exception as objErr:
            raise Exception(f"Failed to update career: {str(objErr)}")

    async def delete_career(self, strCareerId: str) -> bool:
        """Delete a career"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).delete().eq('id', strCareerId).execute()
            return bool(objResponse.data)
        except Exception as objErr:
            raise Exception(f"Failed to delete career: {str(objErr)}")

    async def get_careers_by_industry(self, strIndustry: str) -> List[Career]:
        """Get careers filtered by industry"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').eq('industry', strIndustry).execute()
            arrCareers = objResponse.data if objResponse.data else []
            return [Career(**objCareer) for objCareer in arrCareers]
        except Exception as objErr:
            raise Exception(f"Failed to get careers by industry: {str(objErr)}")

    async def get_careers_by_education_level(self, education_level: str) -> List[Career]:
        """Get careers filtered by required education level"""
        try:
            response = self.supabase.client.table(self.strTableName).select('*').eq('required_education', education_level).execute()
            careers_data = response.data if response.data else []
            return [Career(**objCareer) for objCareer in careers_data]
        except Exception as e:
            raise Exception(f"Failed to get careers by education level: {str(e)}")

    async def get_careers_by_salary_range(self, min_salary: float, max_salary: float) -> List[Career]:
        """Get careers within a salary range"""
        try:
            response = self.supabase.client.table(self.strTableName).select('*').gte('avg_salary', min_salary).lte('avg_salary', max_salary).execute()
            careers_data = response.data if response.data else []
            return [Career(**objCareer) for objCareer in careers_data]
        except Exception as e:
            raise Exception(f"Failed to get careers by salary range: {str(e)}")

    async def get_careers_by_growth_rate(self, min_growth_rate: float) -> List[Career]:
        """Get careers with growth rate above minimum"""
        try:
            response = self.supabase.client.table(self.strTableName).select('*').gte('growth_rate', min_growth_rate).execute()
            careers_data = response.data if response.data else []
            return [Career(**objCareer) for objCareer in careers_data]
        except Exception as e:
            raise Exception(f"Failed to get careers by growth rate: {str(e)}")

    async def get_careers_by_skills(self, skills: List[str]) -> List[Career]:
        """Get careers that require specific skills"""
        try:
            # Get all careers and filter by skills
            response = self.supabase.client.table(self.strTableName).select('*').execute()
            careers_data = response.data if response.data else []
            careers = [Career(**objCareer) for objCareer in careers_data]
            return [career for career in careers if any(skill in career.required_skills for skill in skills)]
        except Exception as e:
            raise Exception(f"Failed to get careers by skills: {str(e)}")

    async def get_career_recommendations(self, skills: List[str], interests: List[str]) -> List[Career]:
        """Get career recommendations based on skills and interests"""
        try:
            response = self.supabase.client.table(self.strTableName).select('*').execute()
            careers_data = response.data if response.data else []
            careers = [Career(**objCareer) for objCareer in careers_data]
            return [career for career in careers if any(skill in career.required_skills for skill in skills) or any(interest in career.related_interests for interest in interests)]
        except Exception as e:
            raise Exception(f"Failed to get career recommendations: {str(e)}")

    async def get_career_market_data(self, career_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed market data for a specific career"""
        try:
            career = await self.get_career(career_id)
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
        except Exception as e:
            raise Exception(f"Failed to get career market data: {str(e)}")

    async def search_careers(self, strQuery: str) -> List[Career]:
        """Search careers by title, description, or skills"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').execute()
            arrCareers = objResponse.data if objResponse.data else []
            strQueryLower = strQuery.lower()
            return [Career(**objCareer) for objCareer in arrCareers if strQueryLower in objCareer.get('title', '').lower() or strQueryLower in objCareer.get('description', '').lower()]
        except Exception as objErr:
            raise Exception(f"Failed to search careers: {str(objErr)}") 
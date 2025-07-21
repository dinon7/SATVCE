from typing import List, Optional, Dict, Any
from app.schemas.course import Course, CourseCreate, CourseUpdate
from app.services.supabase_service import SupabaseService
from fastapi import HTTPException

class CourseService:
    """Service for course operations, using SupabaseService."""

    def __init__(self, supabase_service: SupabaseService):
        self.supabase = supabase_service

    async def get_courses(self, skip: int = 0, limit: int = 100) -> List[Course]:
        courses_data = await self.supabase.get_all_courses(skip, limit)
        return [Course(**course) for course in courses_data]

    async def get_course(self, course_id: str) -> Optional[Course]:
        course_data = await self.supabase.get_course_by_id(course_id)
        if not course_data:
            return None
        return Course(**course_data)

    async def create_course(self, course_create: CourseCreate, admin_user_id: str) -> Course:
        course_data = course_create.model_dump()
        created_course_data = await self.supabase.create_course(course_data, admin_user_id)
        if not created_course_data:
            raise HTTPException(status_code=500, detail="Failed to create course")
        return Course(**created_course_data)

    async def update_course(self, course_id: str, course_update: CourseUpdate, admin_user_id: str) -> Optional[Course]:
        course_data = course_update.model_dump(exclude_unset=True)
        if not course_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        updated_course_data = await self.supabase.update_course(course_id, course_data, admin_user_id)
        if not updated_course_data:
            return None
        return Course(**updated_course_data)

    async def delete_course(self, course_id: str) -> bool:
        return await self.supabase.delete_course(course_id)

    async def get_courses_by_category(self, category: str) -> List[Course]:
        courses_data = await self.supabase.get_courses_by_category(category)
        return [Course(**course) for course in courses_data]

    async def search_courses(self, query: str) -> List[Course]:
        courses_data = await self.supabase.search_courses(query)
        return [Course(**course) for course in courses_data]

    async def fetch_university_info(self, course_id: str) -> Dict[str, Any]:
        """Fetch detailed university information for a course."""
        course = await self.get_course(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # In a real application, this would fetch data from external APIs or a dedicated microservice.
        # For now, it returns a hardcoded example.
        return {
            "university_rank": "Top 50",
            "faculty_info": "Renowned faculty with industry experience",
            "campus_facilities": ["Modern labs", "Research centers", "Library"],
            "student_support": ["Career services", "Academic advising", "Mental health support"],
        }

    async def fetch_career_outcomes(self, course_id: str) -> Dict[str, Any]:
        """Fetch career outcomes and employment data for a course."""
        course = await self.get_course(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
            
        return {
            "employment_rate": "95%",
            "average_salary": "$85,000",
            "top_employers": ["Top Tech Co.", "Leading Finance Firm", "Healthcare Innovators"],
            "career_paths": ["Software Engineer", "Data Scientist", "Product Manager"],
        }

    async def fetch_admission_requirements(self, course_id: str) -> Dict[str, Any]:
        """Fetch detailed admission requirements for a course."""
        course = await self.get_course(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        return {
            "atar_requirements": {"minimum": "85.00", "guaranteed_entry": "92.50"},
            "subject_prerequisites": ["Mathematics", "English"],
            "additional_requirements": ["Personal statement", "Portfolio (for some streams)"],
        } 
from typing import List, Optional
from firebase_admin import db
from app.models.course import Course
from app.services.base_service import BaseService

class CourseService(BaseService):
    def __init__(self):
        super().__init__(Course)
        self.courses_ref = db.reference('courses')

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Course]:
        """Get all courses"""
        courses_data = self.courses_ref.get()
        if not courses_data:
            return []
        
        courses = []
        for id, data in list(courses_data.items())[skip:skip + limit]:
            courses.append(Course.from_dict(data, id))
        return courses

    async def get_by_id(self, course_id: str) -> Optional[Course]:
        """Get a course by ID"""
        course_data = self.courses_ref.child(course_id).get()
        if not course_data:
            return None
        return Course.from_dict(course_data, course_id)

    async def create(self, course: Course) -> Course:
        """Create a new course"""
        course_data = course.to_dict()
        result = self.courses_ref.push(course_data)
        course.id = result.key
        return course

    async def update(self, course_id: str, course: Course) -> Course:
        """Update a course"""
        course_data = course.to_dict()
        self.courses_ref.child(course_id).update(course_data)
        course.id = course_id
        return course

    async def delete(self, course_id: str) -> None:
        """Delete a course"""
        self.courses_ref.child(course_id).delete()

    async def get_courses_by_category(self, category: str) -> List[Course]:
        """Get courses by category"""
        courses = await self.get_all()
        return [course for course in courses if course.category == category]

    async def get_courses_by_university(self, university: str) -> List[Course]:
        """Get courses by university"""
        courses = await self.get_all()
        return [course for course in courses if course.university == university]

    async def get_courses_by_atar_range(self, min_atar: float, max_atar: float) -> List[Course]:
        """Get courses within an ATAR range"""
        courses = await self.get_all()
        return [course for course in courses if course.atar_requirement and min_atar <= course.atar_requirement <= max_atar]

    async def search_courses(self, query: str) -> List[Course]:
        """Search courses by title or description"""
        courses = await self.get_all()
        query = query.lower()
        return [
            course for course in courses
            if query in course.title.lower() or query in course.description.lower()
        ] 
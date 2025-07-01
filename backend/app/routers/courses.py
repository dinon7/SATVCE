from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..services.course_service import CourseService
from ..services.auth import get_current_user
from ..schemas.course import Course as CourseSchema, CourseCreate
from ..services.supabase_service import supabase_service

router = APIRouter(tags=["courses"])
course_service = CourseService(supabase_service)

@router.post("/", response_model=CourseSchema, status_code=status.HTTP_201_CREATED)
async def create_course(
    course: CourseCreate,
    current_user = Depends(get_current_user)
):
    """Create a new course (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        objCourse = await course_service.create_course(course)
        return objCourse
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[CourseSchema])
async def get_courses(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user)
):
    """Get all courses"""
    try:
        arrCourses = await course_service.get_courses(skip, limit)
        return arrCourses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{course_id}", response_model=CourseSchema)
async def get_course(
    course_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific course by ID"""
    try:
        objCourse = await course_service.get_course(course_id)
        if not objCourse:
            raise HTTPException(status_code=404, detail="Course not found")
        return objCourse
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{course_id}", response_model=CourseSchema)
async def update_course(
    course_id: str,
    course: CourseCreate,
    current_user = Depends(get_current_user)
):
    """Update a course (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        objCourse = await course_service.update_course(course_id, course)
        if not objCourse:
            raise HTTPException(status_code=404, detail="Course not found")
        return objCourse
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a course (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        blnDeleted = await course_service.delete_course(course_id)
        if not blnDeleted:
            raise HTTPException(status_code=404, detail="Course not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/category/{category}", response_model=List[CourseSchema])
async def get_courses_by_category(
    category: str,
    current_user = Depends(get_current_user)
):
    """Get courses by category"""
    try:
        arrCourses = await course_service.get_courses_by_category(category)
        return arrCourses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/{query}", response_model=List[CourseSchema])
async def search_courses(
    query: str,
    current_user = Depends(get_current_user)
):
    """Search courses by title or description"""
    try:
        arrCourses = await course_service.search_courses(query)
        return arrCourses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fetch-university-info/{course_id}")
async def fetch_university_info(
    course_id: str,
    current_user = Depends(get_current_user)
):
    """Fetch detailed university information for a course"""
    try:
        response = supabase_service.client.table('courses').select('*').eq('id', course_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Course not found")

        # Example: Fetch data from university APIs or websites
        university_info = {
            "university_rank": "Top 50",
            "faculty_info": "Renowned faculty with industry experience",
            "campus_facilities": ["Modern labs", "Research centers", "Library"],
            "student_support": ["Career services", "Academic advising", "Mental health support"],
            "international_rankings": {
                "QS": "Top 100",
                "Times Higher Education": "Top 150"
            },
            "research_opportunities": ["Undergraduate research", "Industry projects"],
            "student_life": {
                "clubs": ["Tech Club", "Data Science Society"],
                "events": ["Hackathons", "Industry talks"],
                "facilities": ["Sports complex", "Student center"]
            }
        }
        
        return university_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fetch-career-outcomes/{course_id}")
async def fetch_career_outcomes(
    course_id: str,
    current_user = Depends(get_current_user)
):
    """Fetch career outcomes and employment data for a course"""
    try:
        response = supabase_service.client.table('courses').select('*').eq('id', course_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Course not found")

        # Example: Fetch data from career outcome APIs or databases
        career_outcomes = {
            "employment_rate": "95%",
            "average_salary": "$75,000",
            "top_employers": ["Google", "Microsoft", "Amazon"],
            "career_paths": [
                {
                    "role": "Software Engineer",
                    "salary_range": "$70,000 - $120,000",
                    "growth_rate": "15%"
                },
                {
                    "role": "Data Scientist",
                    "salary_range": "$80,000 - $130,000",
                    "growth_rate": "20%"
                }
            ],
            "internship_opportunities": [
                "Summer internships at tech companies",
                "Research internships at universities"
            ],
            "alumni_network": "Strong network of 10,000+ professionals"
        }
        
        return career_outcomes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fetch-admission-requirements/{course_id}")
async def fetch_admission_requirements(
    course_id: str,
    current_user = Depends(get_current_user)
):
    """Fetch detailed admission requirements for a course"""
    try:
        response = supabase_service.client.table('courses').select('*').eq('id', course_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Course not found")

        # Example: Fetch data from university admission APIs or websites
        admission_requirements = {
            "atar_requirements": {
                "minimum": "85.00",
                "guaranteed_entry": "90.00",
                "previous_year_cutoff": "87.50"
            },
            "subject_prerequisites": [
                {
                    "subject": "Mathematics",
                    "level": "Methods",
                    "minimum_score": "25"
                },
                {
                    "subject": "English",
                    "level": "Any",
                    "minimum_score": "25"
                }
            ],
            "additional_requirements": [
                "Personal statement",
                "Interview (for some applicants)",
                "Portfolio (for creative courses)"
            ],
            "international_requirements": {
                "ielts": "6.5 overall with no band less than 6.0",
                "toefl": "90 overall with minimum 20 in each section"
            }
        }
        
        return admission_requirements
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
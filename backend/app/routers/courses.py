from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from firebase_admin import db
from app.models.course import Course
from app.schemas.course import Course as CourseSchema, CourseCreate
from app.services.auth import get_current_user

router = APIRouter(
    prefix="/courses",
    tags=["courses"]
)

@router.post("/", response_model=CourseSchema, status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate):
    """Create a new course"""
    course_ref = db.reference('courses')
    new_course = Course(**course.model_dump())
    course_data = new_course.to_dict()
    result = course_ref.push(course_data)
    new_course.id = result.key
    return new_course

@router.get("/", response_model=List[CourseSchema])
def get_courses(skip: int = 0, limit: int = 100):
    """Get all courses"""
    course_ref = db.reference('courses')
    courses_data = course_ref.get()
    if not courses_data:
        return []
    
    courses = []
    for id, data in list(courses_data.items())[skip:skip + limit]:
        courses.append(Course.from_dict(data, id))
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
def get_course(course_id: str):
    """Get a specific course by ID"""
    course_ref = db.reference(f'courses/{course_id}')
    course_data = course_ref.get()
    if not course_data:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course.from_dict(course_data, course_id)

@router.put("/{course_id}", response_model=CourseSchema)
def update_course(course_id: str, course: CourseCreate):
    """Update a course"""
    course_ref = db.reference(f'courses/{course_id}')
    course_data = course_ref.get()
    if not course_data:
        raise HTTPException(status_code=404, detail="Course not found")
    
    updated_course = Course(**course.model_dump(), id=course_id)
    course_ref.update(updated_course.to_dict())
    return updated_course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: str):
    """Delete a course"""
    course_ref = db.reference(f'courses/{course_id}')
    course_data = course_ref.get()
    if not course_data:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course_ref.delete()
    return None

@router.get("/category/{category}", response_model=List[CourseSchema])
async def get_courses_by_category(
    category: str,
    current_user = Depends(get_current_user)
):
    """Get courses by category"""
    course_ref = db.reference('courses')
    courses_data = course_ref.get()
    if not courses_data:
        return []
    
    courses = []
    for id, data in list(courses_data.items()):
        if data.get('category') == category:
            courses.append(Course.from_dict(data, id))
    return courses

@router.get("/search/{query}", response_model=List[CourseSchema])
async def search_courses(
    query: str,
    current_user = Depends(get_current_user)
):
    """Search courses by title or description"""
    course_ref = db.reference('courses')
    courses_data = course_ref.get()
    if not courses_data:
        return []
    
    courses = []
    for id, data in list(courses_data.items()):
        if query.lower() in data.get('title', '').lower() or query.lower() in data.get('description', '').lower():
            courses.append(Course.from_dict(data, id))
    return courses

@router.get("/fetch-university-info/{course_id}")
async def fetch_university_info(
    course_id: str,
    current_user = Depends(get_current_user)
):
    """Fetch detailed university information for a course"""
    course_ref = db.reference(f'courses/{course_id}')
    course_data = course_ref.get()
    if not course_data:
        raise HTTPException(status_code=404, detail="Course not found")

    try:
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
    course_ref = db.reference(f'courses/{course_id}')
    course_data = course_ref.get()
    if not course_data:
        raise HTTPException(status_code=404, detail="Course not found")

    try:
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
    course_ref = db.reference(f'courses/{course_id}')
    course_data = course_ref.get()
    if not course_data:
        raise HTTPException(status_code=404, detail="Course not found")

    try:
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
                    "level": "Standard",
                    "minimum_score": "25"
                }
            ],
            "additional_requirements": [
                "Personal statement",
                "Interview",
                "Portfolio (for design courses)"
            ],
            "international_requirements": {
                "english_proficiency": "IELTS 6.5 or equivalent",
                "academic_equivalency": "Country-specific requirements"
            },
            "application_deadlines": {
                "domestic": "September 30",
                "international": "August 31"
            }
        }
        
        return admission_requirements
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from ..models.quiz import (
    QuizQuestion,
    QuizResponse,
    QuizResult,
    QuizStage
)
from ..services.auth import get_current_user
from ..models.user import UserResponse
from ..services.ai import generate_recommendations
from ..services.quiz_service import QuizService
from ..schemas.quiz import QuizAnswer
from ..services.enhanced_supabase_service import get_enhanced_supabase_service

router = APIRouter(tags=["quiz"])

"""
routers/quiz.py - Quiz API endpoints for VCE Career Guidance backend.

- Purpose: Exposes endpoints for quiz questions, answers, follow-ups, and results.
- Major components: Initial questions, answer submission, follow-up, recommendations.
- Variable scope: Uses local variables in endpoints, constants for initial questions.
"""

# Predefined initial questions
INITIAL_QUESTIONS = [
    QuizQuestion(
        id="q1",
        text="How confident are you in your career choice?",
        type="slider",
        min_value=1,
        max_value=5
    ),
    QuizQuestion(
        id="q2",
        text="Have you thought about a specific career path?",
        type="multiple_choice",
        options=["Yes", "No", "Not sure"]
    ),
    QuizQuestion(
        id="q3",
        text="Which VCE subjects are you considering?",
        type="multiple_choice",
        options=[
            "English", "Mathematics", "Science", "History",
            "Languages", "Arts", "Technology", "Other"
        ]
    ),
    # Add more questions as needed
]

@router.get("/questions", response_model=List[QuizQuestion])
async def get_initial_questions(
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Get all initial quiz questions"""
    return await quiz_service.get_initial_questions()

@router.get("/questions/{question_id}", response_model=QuizQuestion)
async def get_question(
    question_id: str,
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Get a specific question by ID"""
    question = await quiz_service.get_question_by_id(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.get("/subjects", response_model=List[str])
async def get_subject_list():
    """
    Get a list of all available VCE subjects for the frontend GUI.
    """
    return ["English", "Mathematics", "Science", "History", "Languages", "Arts", "Technology"]

@router.post("/answers", response_model=QuizResult)
async def submit_initial_answers(
    answers: Dict[str, Any],
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Submit initial quiz answers and get recommendations directly"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    # Validate answers
    for question_id, answer in answers.items():
        if not await quiz_service.validate_answer(question_id, answer):
            # If an invalid answer is found, break out of the loop
            break
    
    # Save initial answers and generate recommendations directly
    result = await quiz_service.save_initial_answers(clerk_user_id, answers)
    
    # Generate recommendations directly from the answers
    recommendations = await generate_recommendations(answers)
    result.recommendations = recommendations
    result.stage = 'completed'
    
    return result

@router.post("/answers-simple", response_model=QuizResult)
async def submit_initial_answers_simple(
    answers: Dict[str, Any]
):
    """Submit initial quiz answers and get recommendations directly (no followup questions)"""
    try:
        print(f"Received answers in answers-simple: {answers}")  # Debug log
        
        # Generate recommendations directly from the 25 questions
        recommendations = await generate_recommendations(answers)
        
        result = QuizResult(
            user_id="anonymous",
            initial_answers=answers,
            recommendations=recommendations,
            stage='completed'
        )
        
        print(f"Created result in answers-simple: {result}")  # Debug log
        return result
    except Exception as e:
        print(f"Error in answers-simple: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-results", response_model=QuizResult)
async def generate_results_from_answers(
    answers: Dict[str, Any],
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Generate results directly from all available answers (quiz + followup)"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    try:
        # Save all answers
        result = await quiz_service.save_all_answers(clerk_user_id, answers)
        
        # Generate recommendations based on all answers
        recommendations = await generate_recommendations(answers)
        result.recommendations = recommendations
        
        # Save the recommendations
        await quiz_service.save_recommendations(clerk_user_id, recommendations)
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-results-simple", response_model=QuizResult)
async def generate_results_from_answers_simple(
    answers: Dict[str, Any]
):
    """Generate results directly from all available answers (quiz + followup) without auth"""
    try:
        print(f"Received answers: {answers}")  # Debug log
        
        # Generate recommendations based on all answers
        recommendations = await generate_recommendations(answers)
        print(f"Generated recommendations: {recommendations}")  # Debug log
        
        result = QuizResult(
            user_id="anonymous",
            initial_answers=answers,
            recommendations=recommendations,
            stage='completed'
        )
        
        print(f"Created result: {result}")  # Debug log
        return result
    except Exception as e:
        print(f"Error in generate_results_from_answers_simple: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results", response_model=QuizResult)
async def get_quiz_results(
    quiz_service: QuizService = Depends(),
    current_user: Dict = Depends(get_current_user)
):
    """Get quiz results and recommendations for the current user"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    results = await quiz_service.get_quiz_results(clerk_user_id)
    if not results:
        raise HTTPException(status_code=404, detail="No quiz results found")
    
    return results

@router.post("/results", response_model=Dict[str, Any])
async def save_quiz_results(
    request: Dict[str, Any],
    current_user: Dict = Depends(get_current_user)
):
    """Save quiz results using enhanced service with transaction pooler"""
    try:
        # Get Clerk user ID from current user
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        answers = request.get("answers", {})
        if not answers:
            raise HTTPException(status_code=400, detail="No answers provided")
        
        # Use enhanced service to save quiz results
        enhanced_service = await get_enhanced_supabase_service()
        
        # Save quiz results
        result = await enhanced_service._execute_with_pooler(
            operation="POST",
            table="quiz_results",
            data={
                "user_id": clerk_user_id,  # This will be resolved to internal user ID
                "answers": answers,
                "score": 0,  # Score will be calculated based on answers
                "subject_id": None,  # Will be set based on recommendations
            }
        )
        
        # Log user activity
        await enhanced_service.log_user_activity(
            clerk_user_id=clerk_user_id,
            activity_type="quiz_completed",
            description="User completed quiz",
            metadata={"answers_count": len(answers)}
        )
        
        return {
            "success": True,
            "result_id": result.get("id") if result else None,
            "message": "Quiz results saved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save quiz results: {str(e)}")

@router.post("/career-selections", response_model=Dict[str, Any])
async def save_career_selections(
    selections: Dict[str, Any],
    current_user: Dict = Depends(get_current_user)
):
    """Save career selections using enhanced service with transaction pooler"""
    try:
        # Get Clerk user ID from current user
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        selected_careers = selections.get("selected_careers", [])
        rejected_careers = selections.get("rejected_careers", [])
        
        # Use enhanced service to save career selections
        enhanced_service = await get_enhanced_supabase_service()
        
        result = await enhanced_service.save_career_selections(
            clerk_user_id=clerk_user_id,
            selected_careers=selected_careers,
            rejected_careers=rejected_careers
        )
        
        # Log user activity
        await enhanced_service.log_user_activity(
            clerk_user_id=clerk_user_id,
            activity_type="career_selections_saved",
            description="User saved career selections",
            metadata={
                "selected_count": len(selected_careers),
                "rejected_count": len(rejected_careers)
            }
        )
        
        return {
            "success": True,
            "selections_id": result.get("id") if result else None,
            "message": "Career selections saved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save career selections: {str(e)}")

@router.get("/career-details/{career_title}", response_model=Dict[str, Any])
async def get_career_details(
    career_title: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get detailed information about a specific career"""
    try:
        # This would typically fetch from a career database
        # For now, return mock data based on the career title
        career_details = {
            "title": career_title,
            "description": f"Detailed information about {career_title}",
            "salary_range": "$60,000 - $120,000",
            "job_outlook": "Good - Steady growth expected",
            "required_skills": ["Skill 1", "Skill 2", "Skill 3"],
            "education_requirements": ["Bachelor's degree or equivalent"],
            "industry_tags": ["Industry", "Technology"],
            "work_environment": "Office-based, collaborative",
            "vce_subjects": ["Mathematics", "English"],
            "related_careers": ["Related Career 1", "Related Career 2"]
        }
        
        return career_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/followup-answers", response_model=QuizResult)
async def submit_followup_answers(
    answers: Dict[str, Any]
):
    """Submit followup quiz answers and get final recommendations"""
    try:
        print(f"Received followup answers: {answers}")  # Debug log
        
        # Generate recommendations from all answers (initial + followup)
        recommendations = await generate_recommendations(answers)
        
        result = QuizResult(
            user_id="anonymous",
            follow_up_answers=answers,
            recommendations=recommendations,
            stage='completed'
        )
        
        print(f"Created followup result: {result}")  # Debug log
        return result
    except Exception as e:
        print(f"Error in followup-answers: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit-complete", response_model=QuizResult)
async def submit_complete_quiz(
    request: Dict[str, Any]
):
    """Submit complete quiz (initial + followup answers) and get final recommendations"""
    try:
        initial_answers = request.get('initial_answers', {})
        followup_answers = request.get('followup_answers', {})
        
        # Combine all answers
        all_answers = {**initial_answers, **followup_answers}
        
        print(f"Received complete quiz answers: {all_answers}")  # Debug log
        
        # Generate recommendations from all answers
        recommendations = await generate_recommendations(all_answers)
        
        result = QuizResult(
            user_id="anonymous",
            initial_answers=initial_answers,
            follow_up_answers=followup_answers,
            recommendations=recommendations,
            stage='completed'
        )
        
        print(f"Created complete result: {result}")  # Debug log
        return result
    except Exception as e:
        print(f"Error in submit-complete: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-followup-questions")
async def generate_followup_questions_endpoint(
    request: Dict[str, Any]
):
    """Generate AI-powered followup questions based on initial quiz answers"""
    try:
        initial_answers = request.get('initial_answers', {})
        
        print(f"Generating followup questions for answers: {initial_answers}")  # Debug log
        
        # Import the function here to avoid circular imports
        from ..services.ai import generate_followup_questions
        
        # Generate followup questions using AI
        followup_questions = await generate_followup_questions(initial_answers)
        
        print(f"Generated {len(followup_questions)} followup questions")  # Debug log
        
        return followup_questions
    except Exception as e:
        print(f"Error generating followup questions: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(status_code=500, detail=str(e)) 
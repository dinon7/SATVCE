from typing import List, Optional
from sqlalchemy.orm import Session
from ..db.models import Suggestion
from ..schemas.suggestion import SuggestionResult, SuggestionResponse
from ..services.ai_service import get_ai_client
import json
from datetime import datetime

def get_custom_suggestions_for_user(db: Session, user_id: str) -> List[SuggestionResponse]:
    # First check if we have cached suggestions
    cached_suggestion = db.query(Suggestion).filter(
        Suggestion.user_id == user_id
    ).order_by(Suggestion.created_at.desc()).first()
    
    if cached_suggestion:
        return SuggestionResponse(
            id=str(cached_suggestion.id),
            userId=cached_suggestion.user_id,
            suggestions=cached_suggestion.suggestions,
            createdAt=cached_suggestion.created_at.isoformat()
        )
    
    # If no cached suggestions, generate new ones using AI
    ai_client = get_ai_client()
    
    # Get user's quiz results and preferences
    # TODO: Implement this function to get user's quiz data
    quiz_data = get_user_quiz_data(db, user_id)
    
    prompt = f"""Based on the following student profile, suggest relevant VCE subjects, university pathways, and career options:

    Interests: {quiz_data.get('interests', [])}
    Strengths: {quiz_data.get('strengths', [])}
    Career Goals: {quiz_data.get('career_goals', [])}
    
    For each suggestion, provide:
    1. A relevant VCE subject
    2. Related university courses
    3. Required prerequisites
    4. Potential job roles
    5. Salary range
    6. Industry growth outlook
    7. Study pathways
    8. AI reasoning for the suggestion
    
    Format the response as a JSON array of objects with these fields:
    [
      {{
        "subject": "...",
        "relatedUniversityCourses": [...],
        "requiredPrerequisites": [...],
        "jobRoles": [...],
        "salaryRange": "...",
        "industryGrowth": "...",
        "studyPathways": [...],
        "aiReasoning": "..."
      }}
    ]
    """
    
    response = ai_client.generate_content(prompt)
    suggestions = json.loads(response.text)
    
    # Save to database
    new_suggestion = Suggestion(
        user_id=user_id,
        suggestions=suggestions
    )
    db.add(new_suggestion)
    db.commit()
    db.refresh(new_suggestion)
    
    return SuggestionResponse(
        id=str(new_suggestion.id),
        userId=new_suggestion.user_id,
        suggestions=new_suggestion.suggestions,
        createdAt=new_suggestion.created_at.isoformat()
    )

def get_user_quiz_data(db: Session, user_id: str) -> dict:
    # TODO: Implement this function to get user's quiz data
    # For now, return dummy data
    return {
        "interests": ["Science", "Technology"],
        "strengths": ["Mathematics", "Problem Solving"],
        "career_goals": ["Software Development", "Research"]
    } 
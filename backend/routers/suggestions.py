from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..schemas.suggestion import SuggestionResponse
from ..services.suggestion_service import get_custom_suggestions_for_user
from ..auth.firebase_auth import get_current_user
from ..schemas.user import User

router = APIRouter(
    prefix="/api/suggestions",
    tags=["suggestions"]
)

@router.get("/", response_model=SuggestionResponse)
async def get_user_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized suggestions for the current user based on their quiz results and preferences.
    Requires authentication.
    """
    try:
        return get_custom_suggestions_for_user(db, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
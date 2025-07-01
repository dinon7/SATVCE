from fastapi import APIRouter, HTTPException, Body, Request, Depends
from ..services.supabase_service import supabase_service
from ..schemas.admin import FeedbackReport, FeedbackCreate

router = APIRouter(prefix="/api", tags=["feedback"])

@router.post("/feedback", response_model=FeedbackReport)
async def submit_feedback(
    feedback_data: FeedbackCreate,
    request: Request
):
    """Submit feedback or bug report (public or authenticated)"""
    try:
        # Optionally attach user ID if authenticated
        user_id = None
        if hasattr(request.state, 'user') and request.state.user:
            user_id = request.state.user.get('sub')
        
        feedback_dict = feedback_data.model_dump()
        if user_id:
            feedback_dict['strUserId'] = user_id

        feedback = await supabase_service.create_feedback(feedback_dict)
        if not feedback:
            raise HTTPException(status_code=500, detail="Failed to submit feedback")
        return FeedbackReport(**feedback)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
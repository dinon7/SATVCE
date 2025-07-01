from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from ..services.auth import get_current_user
from ..services.saved_items_service import SavedItemsService

router = APIRouter(prefix="/saved-items", tags=["saved-items"])
saved_items_service = SavedItemsService()

@router.get("/")
async def get_saved_items(current_user: Dict = Depends(get_current_user)):
    """Get user's saved subjects and careers"""
    try:
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        saved_items = await saved_items_service.get_saved_items(clerk_user_id)
        return saved_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subjects")
async def add_saved_subject(
    subject: str,
    current_user: Dict = Depends(get_current_user)
):
    """Add a subject to user's saved subjects"""
    try:
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        success = await saved_items_service.add_saved_subject(clerk_user_id, subject)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add saved subject")
        
        return {"message": "Subject added to saved items", "subject": subject}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/careers")
async def add_saved_career(
    career: str,
    current_user: Dict = Depends(get_current_user)
):
    """Add a career to user's saved careers"""
    try:
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        success = await saved_items_service.add_saved_career(clerk_user_id, career)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add saved career")
        
        return {"message": "Career added to saved items", "career": career}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/subjects/{subject}")
async def remove_saved_subject(
    subject: str,
    current_user: Dict = Depends(get_current_user)
):
    """Remove a subject from user's saved subjects"""
    try:
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        success = await saved_items_service.remove_saved_subject(clerk_user_id, subject)
        if not success:
            raise HTTPException(status_code=404, detail="Subject not found in saved items")
        
        return {"message": "Subject removed from saved items", "subject": subject}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/careers/{career}")
async def remove_saved_career(
    career: str,
    current_user: Dict = Depends(get_current_user)
):
    """Remove a career from user's saved careers"""
    try:
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        success = await saved_items_service.remove_saved_career(clerk_user_id, career)
        if not success:
            raise HTTPException(status_code=404, detail="Career not found in saved items")
        
        return {"message": "Career removed from saved items", "career": career}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subjects")
async def get_saved_subjects(current_user: Dict = Depends(get_current_user)):
    """Get user's saved subjects"""
    try:
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        subjects = await saved_items_service.get_saved_subjects(clerk_user_id)
        return {"subjects": subjects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/careers")
async def get_saved_careers(current_user: Dict = Depends(get_current_user)):
    """Get user's saved careers"""
    try:
        clerk_user_id = current_user.get("clerk_user_id")
        if not clerk_user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        careers = await saved_items_service.get_saved_careers(clerk_user_id)
        return {"careers": careers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
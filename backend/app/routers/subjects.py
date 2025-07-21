from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.subject_service import SubjectService
from app.services.auth import get_current_user
from app.schemas.subject import Subject, SubjectCreate, SubjectUpdate

router = APIRouter()
subject_service = SubjectService()

@router.get("/subjects", response_model=List[Subject])
async def list_subjects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    min_scaling: Optional[float] = Query(None, ge=0.0, le=1.0),
    max_difficulty: Optional[int] = Query(None, ge=1, le=5),
    search: Optional[str] = None
):
    """List all subjects with optional filtering"""
    try:
        arrSubjects = await subject_service.get_subjects()
        arrFiltered = []
        for objSubject in arrSubjects:
            if min_scaling and getattr(objSubject, 'scaling', None) is not None and objSubject.scaling < min_scaling:
                continue
            if max_difficulty and getattr(objSubject, 'difficulty', None) is not None and objSubject.difficulty > max_difficulty:
                continue
            if search and search.lower() not in objSubject.name.lower():
                continue
            arrFiltered.append(objSubject)
        return arrFiltered[skip:skip+limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subjects/{subject_id}", response_model=Subject)
async def get_subject(subject_id: str):
    """Get a specific subject by ID"""
    try:
        objSubject = await subject_service.get_subject(subject_id)
        if not objSubject:
            raise HTTPException(status_code=404, detail="Subject not found")
        return objSubject
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subjects", response_model=Subject)
async def create_subject(
    subject: SubjectCreate,
    current_user = Depends(get_current_user)
):
    """Create a new subject (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        objSubject = await subject_service.create_subject(subject)
        return objSubject
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/subjects/{subject_id}", response_model=Subject)
async def update_subject(
    subject_id: str,
    subject: SubjectUpdate,
    current_user = Depends(get_current_user)
):
    """Update a subject (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        objSubject = await subject_service.update_subject(subject_id, subject)
        if not objSubject:
            raise HTTPException(status_code=404, detail="Subject not found")
        return objSubject
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/subjects/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a subject (admin only)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        blnDeleted = await subject_service.delete_subject(subject_id)
        if not blnDeleted:
            raise HTTPException(status_code=404, detail="Subject not found")
        return {"message": "Subject deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
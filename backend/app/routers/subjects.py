from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from firebase_admin import db

from app.models.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.services.auth import get_current_user
from app.models.user import UserResponse

router = APIRouter()
subjects_ref = db.reference('subjects')

@router.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    min_scaling: Optional[float] = Query(None, ge=0.0, le=1.0),
    max_difficulty: Optional[int] = Query(None, ge=1, le=5),
    search: Optional[str] = None
):
    """List all subjects with optional filtering"""
    subjects_data = subjects_ref.get()
    if not subjects_data:
        return []
    
    subjects = []
    for id, data in list(subjects_data.items())[skip:skip + limit]:
        subject = SubjectResponse.from_dict(data, id)
        if min_scaling and subject.scaling < min_scaling:
            continue
        if max_difficulty and subject.difficulty > max_difficulty:
            continue
        if search and search.lower() not in subject.name.lower():
            continue
        subjects.append(subject)
    return subjects

@router.get("/subjects/{subject_id}", response_model=SubjectResponse)
async def get_subject(subject_id: str):
    """Get a specific subject by ID"""
    subject_data = subjects_ref.child(subject_id).get()
    if not subject_data:
        raise HTTPException(status_code=404, detail="Subject not found")
    return SubjectResponse.from_dict(subject_data, subject_id)

@router.post("/subjects", response_model=SubjectResponse)
async def create_subject(
    subject: SubjectCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new subject (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    subject_data = subject.dict()
    result = subjects_ref.push(subject_data)
    return SubjectResponse.from_dict(subject_data, result.key)

@router.put("/subjects/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: str,
    subject: SubjectUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a subject (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    subject_data = subject.dict(exclude_unset=True)
    subjects_ref.child(subject_id).update(subject_data)
    updated_data = subjects_ref.child(subject_id).get()
    return SubjectResponse.from_dict(updated_data, subject_id)

@router.delete("/subjects/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a subject (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    subjects_ref.child(subject_id).delete()
    return {"message": "Subject deleted successfully"} 
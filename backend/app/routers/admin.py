from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List, Dict, Any, Optional

from ..services.admin_service import AdminService
from ..services.auth import get_current_user
from ..schemas.admin import (
    AdminStatsResponse,
    SiteSettingsResponse,
    SiteSettingsUpdate,
    AdminActivityResponse,
    UserManagementResponse,
    ResourceManagementResponse,
    FeedbackReport,
    FeedbackUpdate,
    AdminUserUpdateRequest,
)
from ..schemas.user import UserResponse
from ..schemas.subject import Subject, SubjectCreate, SubjectUpdate
from ..schemas.career import CareerPathway, CareerPathwayCreate, CareerPathwayUpdate
from ..schemas.course import Prerequisite, PrerequisiteCreate, PrerequisiteUpdate


router = APIRouter(
    prefix="/api/admin",
    tags=["admin"]
)

admin_service = AdminService()

async def get_current_admin_user(current_user: Dict = Depends(get_current_user)):
    """Dependency to check for admin user."""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized, admin access required")
    return current_user

# All routes below will use this dependency for admin access
admin_user = Depends(get_current_admin_user)

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(current_user: Dict = admin_user):
    """Get admin dashboard statistics"""
    try:
        dictStats = await admin_service.get_admin_stats()
        return AdminStatsResponse(**dictStats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings", response_model=SiteSettingsResponse)
async def get_site_settings(current_user: Dict = admin_user):
    """Get site settings (admin only)"""
    try:
        dictSettings = await admin_service.get_site_settings()
        return SiteSettingsResponse(**dictSettings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings", response_model=SiteSettingsResponse)
async def update_site_settings(
    settings: SiteSettingsUpdate,
    current_user: Dict = admin_user
):
    """Update site settings (admin only)"""
    try:
        strAdminUserId = current_user.get("sub")
        dictUpdatedSettings = await admin_service.update_site_settings(strAdminUserId, settings.model_dump(exclude_unset=True))
        return SiteSettingsResponse(**dictUpdatedSettings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users", response_model=List[UserManagementResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: Dict = admin_user
):
    """Get all users (admin only)"""
    try:
        arrUsers = await admin_service.get_all_users(skip, limit)
        return [UserManagementResponse(**user) for user in arrUsers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=UserManagementResponse)
async def get_user_by_id(
    user_id: str,
    current_user: Dict = admin_user
):
    """Get specific user by ID (admin only)"""
    try:
        objUser = await admin_service.get_user_by_id(user_id)
        if not objUser:
            raise HTTPException(status_code=404, detail="User not found")
        return UserManagementResponse(**objUser)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}", response_model=UserManagementResponse)
async def update_user(
    user_id: str,
    user_data: AdminUserUpdateRequest,
    current_user: Dict = admin_user
):
    """Update user (admin only)"""
    try:
        objUpdatedUser = await admin_service.update_user(user_id, user_data.model_dump(exclude_unset=True))
        if not objUpdatedUser:
            raise HTTPException(status_code=404, detail="User not found")
        return UserManagementResponse(**objUpdatedUser)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: Dict = admin_user
):
    """Delete user (admin only)"""
    try:
        blnDeleted = await admin_service.delete_user(user_id)
        if not blnDeleted:
            raise HTTPException(status_code=404, detail="User not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/resources", response_model=List[ResourceManagementResponse])
async def get_all_resources_for_admin(
    status: Optional[str] = None,
    type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: Dict = admin_user
):
    """Get all resources with admin filtering"""
    try:
        arrResources = await admin_service.get_all_resources_for_admin(status, type, skip, limit)
        return [ResourceManagementResponse(**resource) for resource in arrResources]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/resources/{resource_id}/status")
async def update_resource_status(
    resource_id: str,
    status_body: dict = Body(..., embed=True, example={"status": "approved"}),
    current_user: Dict = admin_user
):
    """Update resource status (approve/reject)"""
    try:
        new_status = status_body.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required in the request body.")
        strAdminUserId = current_user.get("sub")
        objUpdatedResource = await admin_service.update_resource_status(resource_id, new_status, strAdminUserId)
        if not objUpdatedResource:
            raise HTTPException(status_code=404, detail="Resource not found or status update failed")
        return objUpdatedResource
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/activity", response_model=List[AdminActivityResponse])
async def get_admin_activity(
    skip: int = 0,
    limit: int = 50,
    current_user: Dict = admin_user
):
    """Get admin activity log"""
    try:
        arrActivities = await admin_service.get_admin_activity(skip, limit)
        return [AdminActivityResponse(**activity) for activity in arrActivities]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/activity")
async def log_admin_activity(
    activity_data: dict = Body(...),
    current_user: Dict = admin_user
):
    """Log admin activity"""
    try:
        strAdminUserId = current_user.get("sub")
        action = activity_data.get("action")
        details = activity_data.get("details", {})
        if not action:
            raise HTTPException(status_code=400, detail="Action is required.")
        await admin_service.log_admin_activity(strAdminUserId, action, details)
        return {"message": "Activity logged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resources", response_model=ResourceManagementResponse)
async def create_resource(
    resource_data: dict, # Consider creating a ResourceCreate schema
    current_user: Dict = admin_user
):
    """Create a new resource (admin only)"""
    try:
        clerk_user_id = current_user.get("sub")
        resource = await admin_service.create_resource(resource_data, clerk_user_id)
        if not resource:
            raise HTTPException(status_code=500, detail="Failed to create resource")
        return ResourceManagementResponse(**resource)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: str,
    current_user: Dict = admin_user
):
    """Delete a resource (admin only)"""
    try:
        success = await admin_service.delete_resource(resource_id)
        if not success:
            raise HTTPException(status_code=404, detail="Resource not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/resources/pending", response_model=List[ResourceManagementResponse])
async def get_pending_resources(
    skip: int = 0,
    limit: int = 100,
    current_user: Dict = admin_user
):
    """Get all pending resources (admin only)"""
    try:
        resources = await admin_service.get_pending_resources(skip, limit)
        return [ResourceManagementResponse(**resource) for resource in resources]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... Subjects CRUD ...
@router.get("/subjects", response_model=List[Subject])
async def get_all_subjects(skip: int = 0, limit: int = 100, current_user: Dict = admin_user):
    """Get all subjects"""
    try:
        subjects = await admin_service.get_all_subjects(skip, limit)
        return [Subject(**s) for s in subjects]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subjects", response_model=Subject)
async def create_subject(subject_data: SubjectCreate, current_user: Dict = admin_user):
    """Create a new subject"""
    try:
        admin_id = current_user.get("sub")
        subject = await admin_service.create_subject(subject_data.model_dump(), admin_id)
        return subject
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/subjects/{subject_id}", response_model=Subject)
async def update_subject(subject_id: str, subject_data: SubjectUpdate, current_user: Dict = admin_user):
    """Update a subject"""
    try:
        admin_id = current_user.get("sub")
        updated_subject = await admin_service.update_subject(subject_id, subject_data.model_dump(exclude_unset=True), admin_id)
        if not updated_subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        return updated_subject
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: str, current_user: Dict = admin_user):
    """Delete a subject"""
    try:
        success = await admin_service.delete_subject(subject_id)
        if not success:
            raise HTTPException(status_code=404, detail="Subject not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... Career Pathways CRUD ...
@router.get("/career-pathways", response_model=List[CareerPathway])
async def get_all_career_pathways(skip: int = 0, limit: int = 100, current_user: Dict = admin_user):
    """Get all career pathways"""
    try:
        pathways = await admin_service.get_all_career_pathways(skip, limit)
        return [CareerPathway(**p) for p in pathways]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/career-pathways", response_model=CareerPathway)
async def create_career_pathway(pathway_data: CareerPathwayCreate, current_user: Dict = admin_user):
    """Create a new career pathway"""
    try:
        admin_id = current_user.get("sub")
        pathway = await admin_service.create_career_pathway(pathway_data.model_dump(), admin_id)
        return pathway
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/career-pathways/{pathway_id}", response_model=CareerPathway)
async def update_career_pathway(pathway_id: str, pathway_data: CareerPathwayUpdate, current_user: Dict = admin_user):
    """Update a career pathway"""
    try:
        admin_id = current_user.get("sub")
        updated_pathway = await admin_service.update_career_pathway(pathway_id, pathway_data.model_dump(exclude_unset=True), admin_id)
        if not updated_pathway:
            raise HTTPException(status_code=404, detail="Career pathway not found")
        return updated_pathway
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/career-pathways/{pathway_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_career_pathway(pathway_id: str, current_user: Dict = admin_user):
    """Delete a career pathway"""
    try:
        success = await admin_service.delete_career_pathway(pathway_id)
        if not success:
            raise HTTPException(status_code=404, detail="Career pathway not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... University Prerequisites CRUD ...
@router.get("/prerequisites", response_model=List[Prerequisite])
async def get_all_prerequisites(skip: int = 0, limit: int = 100, current_user: Dict = admin_user):
    """Get all university prerequisites"""
    try:
        prereqs = await admin_service.get_all_prerequisites(skip, limit)
        return [Prerequisite(**p) for p in prereqs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prerequisites", response_model=Prerequisite)
async def create_prerequisite(prereq_data: PrerequisiteCreate, current_user: Dict = admin_user):
    """Create a new prerequisite"""
    try:
        admin_id = current_user.get("sub")
        prereq = await admin_service.create_prerequisite(prereq_data.model_dump(), admin_id)
        return prereq
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/prerequisites/{prereq_id}", response_model=Prerequisite)
async def update_prerequisite(prereq_id: str, prereq_data: PrerequisiteUpdate, current_user: Dict = admin_user):
    """Update a prerequisite"""
    try:
        admin_id = current_user.get("sub")
        updated_prereq = await admin_service.update_prerequisite(prereq_id, prereq_data.model_dump(exclude_unset=True), admin_id)
        if not updated_prereq:
            raise HTTPException(status_code=404, detail="Prerequisite not found")
        return updated_prereq
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/prerequisites/{prereq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prerequisite(prereq_id: str, current_user: Dict = admin_user):
    """Delete a prerequisite"""
    try:
        success = await admin_service.delete_prerequisite(prereq_id)
        if not success:
            raise HTTPException(status_code=404, detail="Prerequisite not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ... Feedback/Bug Reports CRUD ...
@router.get("/feedback", response_model=List[FeedbackReport])
async def get_all_feedback(skip: int = 0, limit: int = 100, current_user: Dict = admin_user):
    """Get all feedback reports"""
    try:
        feedback_list = await admin_service.get_all_feedback(skip, limit)
        return [FeedbackReport(**fb) for fb in feedback_list]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/feedback/{feedback_id}", response_model=FeedbackReport)
async def update_feedback(feedback_id: str, feedback_data: FeedbackUpdate, current_user: Dict = admin_user):
    """Update a feedback report"""
    try:
        admin_id = current_user.get("sub")
        updated_feedback = await admin_service.update_feedback(feedback_id, feedback_data.model_dump(exclude_unset=True), admin_id)
        if not updated_feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return updated_feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(feedback_id: str, current_user: Dict = admin_user):
    """Delete a feedback report"""
    try:
        success = await admin_service.delete_feedback(feedback_id)
        if not success:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
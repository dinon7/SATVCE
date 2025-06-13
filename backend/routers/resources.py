from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..db.database import get_db
from ..schemas.resource import ResourceCreate, ResourceResponse
from ..services.resource_service import (
    get_resources,
    create_resource,
    delete_resource,
    get_resource_by_id
)
from ..auth.firebase_auth import get_current_user, admin_check
from ..schemas.user import User

router = APIRouter(
    prefix="/api/resources",
    tags=["resources"]
)

@router.get("/", response_model=List[ResourceResponse])
async def list_resources(
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all resources, optionally filtered by tag.
    No authentication required.
    """
    return get_resources(db, tag)

@router.post("/", response_model=ResourceResponse, status_code=201)
async def add_resource(
    resource: ResourceCreate,
    current_user: User = Depends(admin_check),
    db: Session = Depends(get_db)
):
    """
    Add a new resource. Requires admin authentication.
    """
    return create_resource(db, resource, current_user.id)

@router.delete("/{resource_id}")
async def remove_resource(
    resource_id: str,
    current_user: User = Depends(admin_check),
    db: Session = Depends(get_db)
):
    """
    Delete a resource. Requires admin authentication.
    """
    success = delete_resource(db, resource_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Resource deleted successfully"}

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific resource by ID.
    No authentication required.
    """
    resource = get_resource_by_id(db, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource 
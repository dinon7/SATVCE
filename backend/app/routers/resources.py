from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from app.services.resource_service import ResourceService
from app.services.auth import get_current_user

router = APIRouter()
resource_service = ResourceService()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_resources(
    skip: int = 0,
    limit: int = 100
):
    """Get all resources (public)"""
    try:
        arrResources = await resource_service.get_resources(skip, limit)
        return arrResources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/approved", response_model=List[Dict[str, Any]])
async def get_approved_resources(
    skip: int = 0,
    limit: int = 100
):
    """Get approved resources only (public)"""
    try:
        arrResources = await resource_service.get_approved_resources(skip, limit)
        return arrResources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Dict[str, Any])
async def create_resource(
    resource_data: dict,
    current_user = Depends(get_current_user)
):
    """Create a new resource (authenticated users only)"""
    try:
        strUserId = current_user.get("sub")
        if not strUserId:
            raise HTTPException(status_code=400, detail="User ID not found")
        objResource = await resource_service.create_resource(strUserId, resource_data)
        return objResource
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{resource_id}", response_model=Dict[str, Any])
async def get_resource_by_id(resource_id: str):
    """Get a specific resource by ID (public)"""
    try:
        objResource = await resource_service.get_resource_by_id(resource_id)
        if not objResource:
            raise HTTPException(status_code=404, detail="Resource not found")
        return objResource
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{resource_id}", response_model=Dict[str, Any])
async def update_resource(
    resource_id: str,
    resource_data: dict,
    current_user = Depends(get_current_user)
):
    """Update a resource (authenticated users only)"""
    try:
        strUserId = current_user.get("sub")
        if not strUserId:
            raise HTTPException(status_code=400, detail="User ID not found")
        objResource = await resource_service.update_resource(resource_id, resource_data)
        if not objResource:
            raise HTTPException(status_code=404, detail="Resource not found")
        return objResource
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a resource (authenticated users only)"""
    try:
        strUserId = current_user.get("sub")
        if not strUserId:
            raise HTTPException(status_code=400, detail="User ID not found")
        blnDeleted = await resource_service.delete_resource(resource_id)
        if not blnDeleted:
            raise HTTPException(status_code=404, detail="Resource not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
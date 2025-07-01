from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from ..services.auth import get_current_user
from ..schemas.user import UserResponse, UserCreate, UserUpdate
from ..services.user_service import UserService

router = APIRouter(tags=["users"])
user_service = UserService()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Dict = Depends(get_current_user)):
    """Get current user information"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    user = await user_service.get_user_by_clerk_id(clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.get("/", response_model=List[UserResponse])
async def get_users(current_user: Dict = Depends(get_current_user)):
    """Get all users (admin only)"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    # Check if user is admin
    user = await user_service.get_user_by_clerk_id(clerk_user_id)
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return await user_service.get_users()

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user"""
    return await user_service.create_user(user)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: Dict = Depends(get_current_user)):
    """Get a specific user"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    # Check if user is admin or requesting their own data
    user = await user_service.get_user_by_clerk_id(clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Current user not found")
    
    if not user.is_admin and user.clerk_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get the requested user
    requested_user = await user_service.get_user(user_id)
    if not requested_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return requested_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user: UserUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Update a user"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    # Check if user is admin or updating their own data
    current_user_obj = await user_service.get_user_by_clerk_id(clerk_user_id)
    if not current_user_obj:
        raise HTTPException(status_code=404, detail="Current user not found")
    
    if not current_user_obj.is_admin and current_user_obj.clerk_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_user = await user_service.update_user(user_id, user.dict())
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, current_user: Dict = Depends(get_current_user)):
    """Delete a user"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    # Check if user is admin
    user = await user_service.get_user_by_clerk_id(clerk_user_id)
    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if not await user_service.delete_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        ) 

@router.get("/profile/preferences")
async def get_user_preferences(current_user: Dict = Depends(get_current_user)):
    """Get current user preferences"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    preferences = await user_service.get_user_preferences(clerk_user_id)
    if not preferences:
        return {"preferences": {}}
    
    return preferences

@router.put("/profile/preferences")
async def update_user_preferences(
    preferences: Dict[str, Any],
    current_user: Dict = Depends(get_current_user)
):
    """Update current user preferences"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    success = await user_service.update_user_preferences(clerk_user_id, preferences)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update preferences")
    
    return {"message": "Preferences updated successfully"}

@router.get("/profile/info")
async def get_user_profile(current_user: Dict = Depends(get_current_user)):
    """Get current user profile"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    profile = await user_service.get_user_profile(clerk_user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return profile

@router.put("/profile/info")
async def update_user_profile(
    profile_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user)
):
    """Update current user profile"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    success = await user_service.update_user_profile(clerk_user_id, profile_data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    
    return {"message": "Profile updated successfully"} 
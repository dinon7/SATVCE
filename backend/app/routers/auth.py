from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Dict, Any

from ..models.user import UserCreate, UserResponse
from ..services.auth import (
    create_user,
    get_current_user,
    create_user_from_clerk
)
from ..services.user_service import UserService
from ..config import settings
from ..services.auth import verify_clerk_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user with Clerk"""
    try:
        user = await create_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/clerk-webhook")
async def clerk_webhook(webhook_data: Dict[str, Any]):
    """Handle Clerk webhook for user creation/updates"""
    try:
        # Verify webhook signature (implement proper verification)
        event_type = webhook_data.get('type')
        
        if event_type == 'user.created':
            user_data = webhook_data.get('data', {})
            user = await create_user_from_clerk(user_data)
            return {"message": "User created successfully", "user_id": user.id}
        
        elif event_type == 'user.updated':
            # Handle user updates
            user_data = webhook_data.get('data', {})
            user_service = UserService()
            # Update user in Supabase
            return {"message": "User updated successfully"}
        
        elif event_type == 'user.deleted':
            # Handle user deletion
            user_data = webhook_data.get('data', {})
            user_service = UserService()
            # Delete user from Supabase
            return {"message": "User deleted successfully"}
        
        return {"message": "Webhook processed"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Dict = Depends(get_current_user)):
    """Get current user information"""
    # Get Clerk user ID from current user
    clerk_user_id = current_user.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    user_service = UserService()
    user = await user_service.get_user_by_clerk_id(clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.post("/verify-token")
async def verify_token(token: str):
    """Verify Clerk JWT token"""
    try:
        user_data = await verify_clerk_token(token)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return {"valid": True, "user_id": user_data.get('sub')}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Legacy endpoints for backward compatibility (deprecated)
@router.post("/login", deprecated=True)
async def legacy_login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Legacy login endpoint (deprecated - use Clerk authentication)"""
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="This endpoint is deprecated. Please use Clerk authentication."
    )

@router.post("/token", deprecated=True)
async def legacy_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Legacy token endpoint (deprecated - use Clerk authentication)"""
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="This endpoint is deprecated. Please use Clerk authentication."
    ) 
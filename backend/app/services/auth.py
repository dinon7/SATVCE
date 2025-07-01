"""
Authentication Service - Handles user authentication and authorization
"""

from datetime import datetime, timedelta, UTC
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from ..core.config import settings
from ..models.user import UserCreate, UserInDB, UserResponse
from ..services.user_service import UserService
from ..services.supabase_service import supabase_service
from ..utils.password import verify_password, get_password_hash
import os
import logging

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token with improved datetime handling"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.environ.get("SECRET_KEY"), algorithm="HS256")
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Get current user from Clerk token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify Clerk token
        user_data = await supabase_service.verify_clerk_token(token)
        if not user_data:
            raise credentials_exception
        
        # Get user from Supabase
        user_service = UserService()
        user = await user_service.get_user_by_clerk_id(user_data.get('sub'))
        if user is None:
            raise credentials_exception
        
        return user.dict()
    except Exception as e:
        raise credentials_exception

async def get_current_active_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Get current active user."""
    return current_user

async def get_current_admin_user(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Get current admin user."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """Authenticate a user with email and password (legacy support)"""
    try:
        # Get user from Supabase by email
        response = supabase_service.client.table('users').select('*').eq('email', email).single()
        if not response.data:
            return None
        
        user_data = response.data
        
        # Verify password (if using password-based auth)
        if 'hashed_password' in user_data and verify_password(password, user_data['hashed_password']):
            return UserInDB(**user_data)
        
        return None
    except Exception:
        return None

async def create_user(user_data: UserCreate) -> UserResponse:
    """Create a new user with Clerk authentication"""
    try:
        user_service = UserService()
        
        # Check if user already exists
        existing_user = await user_service.get_user_by_clerk_id(user_data.clerk_user_id)
        if existing_user:
            raise ValueError("User already exists")
        
        # Create user in Supabase
        user = await user_service.create_user(user_data)
        return user
    except Exception as e:
        raise ValueError(f"Failed to create user: {str(e)}")

def decode_access_token(token: str) -> dict:
    """Decode JWT access token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY.get_secret_value(), algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def verify_clerk_token(token: str) -> Optional[dict]:
    """Verify Clerk JWT token"""
    try:
        # Use Supabase service to verify Clerk token
        user_data = await supabase_service.verify_clerk_token(token)
        return user_data
    except Exception:
        return None

async def get_user_by_clerk_id(clerk_user_id: str) -> Optional[UserResponse]:
    """Get user by Clerk user ID"""
    try:
        user_service = UserService()
        return await user_service.get_user_by_clerk_id(clerk_user_id)
    except Exception:
        return None

async def create_user_from_clerk(clerk_user_data: dict) -> UserResponse:
    """Create user from Clerk webhook data"""
    try:
        user_data = UserCreate(
            clerk_user_id=clerk_user_data['id'],
            email=clerk_user_data['email_addresses'][0]['email_address'],
            first_name=clerk_user_data['first_name'],
            last_name=clerk_user_data['last_name'],
            year_level=11  # Default year level
        )
        
        return await create_user(user_data)
    except Exception as e:
        raise ValueError(f"Failed to create user from Clerk: {str(e)}") 
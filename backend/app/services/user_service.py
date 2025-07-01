from typing import List, Optional, Dict, Any
from datetime import datetime, UTC
from ..schemas.user import UserCreate, UserUpdate
from ..utils.password import get_password_hash, verify_password
from ..models.user import UserInDB, UserResponse
from .supabase_service import supabase_service
import logging

logger = logging.getLogger(__name__)

"""
services/user_service.py - User service logic for VCE Career Guidance backend.

- Purpose: Provides business logic for user CRUD, authentication, and profile management.
- Major components: UserService class, async CRUD methods, utility functions.
- Variable scope: Uses class attributes for shared state, local variables in methods, and protected/private attributes for encapsulation.
"""

class UserService:
    """Service for user operations using Supabase."""

    def __init__(self):
        self.supabase = supabase_service

    async def get_users(self) -> List[UserResponse]:
        """Get all users."""
        try:
            response = self.supabase.client.table('users').select('*').execute()
            users = response.data if response.data else []
            return [UserResponse(**user) for user in users]
        except Exception as e:
            raise Exception(f"Failed to get users: {str(e)}")

    async def get_user(self, user_id: str) -> Optional[UserResponse]:
        """Get user by ID."""
        try:
            response = self.supabase.client.table('users').select('*').eq('id', user_id).single()
            if not response.data:
                return None
            return UserResponse(**response.data)
        except Exception as e:
            raise Exception(f"Failed to get user: {str(e)}")

    async def get_user_by_clerk_id(self, clerk_user_id: str) -> Optional[UserResponse]:
        """Get user by Clerk user ID."""
        try:
            response = self.supabase.client.table('users').select('*').eq('clerk_user_id', clerk_user_id).single()
            if not response.data:
                return None
            return UserResponse(**response.data)
        except Exception as e:
            raise Exception(f"Failed to get user by Clerk ID: {str(e)}")

    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user."""
        try:
            # Check if user already exists
            existing_user = await self.get_user_by_clerk_id(user_data.clerk_user_id)
            if existing_user:
                raise ValueError("User already exists")

            user_dict = user_data.dict()
            user_dict['created_at'] = datetime.now(UTC).isoformat()
            user_dict['updated_at'] = datetime.now(UTC).isoformat()

            response = self.supabase.client.table('users').insert(user_dict).execute()
            if not response.data:
                raise ValueError("Failed to create user")

            return UserResponse(**response.data[0])
        except Exception as e:
            raise Exception(f"Failed to create user: {str(e)}")

    async def update_user(self, user_id: str, user_data: dict) -> Optional[UserResponse]:
        """Update user data."""
        try:
            user_data['updated_at'] = datetime.now(UTC).isoformat()
            
            response = self.supabase.client.table('users').update(user_data).eq('id', user_id).execute()
            if not response.data:
                return None
                
            return UserResponse(**response.data[0])
        except Exception as e:
            raise Exception(f"Failed to update user: {str(e)}")

    async def delete_user(self, user_id: str) -> bool:
        """Delete user."""
        try:
            response = self.supabase.client.table('users').delete().eq('id', user_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            raise Exception(f"Failed to delete user: {str(e)}")

    async def get_user_preferences(self, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user preferences."""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return None
            
            response = self.supabase.client.table('user_preferences').select('*').eq('user_id', user.id).single()
            return response.data if response.data else None
        except Exception as e:
            raise Exception(f"Failed to get user preferences: {str(e)}")

    async def update_user_preferences(self, clerk_user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user preferences."""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False
            
            preferences_data = {
                'user_id': user.id,
                'preferences': preferences,
                'updated_at': datetime.now(UTC).isoformat()
            }
            
            # Try to update existing preferences, insert if not exists
            response = self.supabase.client.table('user_preferences').upsert(preferences_data).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            raise Exception(f"Failed to update user preferences: {str(e)}")

    async def get_user_profile(self, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile."""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return None
            
            return {
                'id': user.id,
                'clerk_user_id': user.clerk_user_id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'year_level': user.year_level,
                'is_admin': user.is_admin,
                'created_at': user.created_at,
                'updated_at': user.updated_at
            }
        except Exception as e:
            raise Exception(f"Failed to get user profile: {str(e)}")

    async def update_user_profile(self, clerk_user_id: str, profile_data: Dict[str, Any]) -> bool:
        """Update user profile."""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False
            
            profile_data['updated_at'] = datetime.now(UTC).isoformat()
            
            response = self.supabase.client.table('users').update(profile_data).eq('id', user.id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            raise Exception(f"Failed to update user profile: {str(e)}")

    @staticmethod
    async def create_user_with_clerk(clerk_user_id: str, email: str, first_name: str, last_name: str, year_level: int = 11) -> Dict[str, Any]:
        """Create a new user with Clerk authentication."""
        try:
            user_data = {
                'clerk_user_id': clerk_user_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'year_level': year_level,
                'is_admin': False,
                'created_at': datetime.now(UTC).isoformat(),
                'updated_at': datetime.now(UTC).isoformat()
            }

            response = supabase_service.client.table('users').insert(user_data).execute()
            if not response.data:
                raise Exception("Failed to create user")

            return response.data[0]

        except Exception as e:
            raise Exception(f"Failed to create user: {str(e)}")

    @staticmethod
    async def get_user_by_clerk_id_static(clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by Clerk user ID (static method)."""
        try:
            response = supabase_service.client.table('users').select('*').eq('clerk_user_id', clerk_user_id).single()
            return response.data if response.data else None
        except Exception as e:
            raise Exception(f"Failed to get user: {str(e)}")

    @staticmethod
    async def update_user_static(clerk_user_id: str, data: Dict[str, Any]) -> bool:
        """Update user data (static method)."""
        try:
            data['updated_at'] = datetime.now(UTC).isoformat()
            response = supabase_service.client.table('users').update(data).eq('clerk_user_id', clerk_user_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            raise Exception(f"Failed to update user: {str(e)}")

    @staticmethod
    async def delete_user_static(clerk_user_id: str) -> bool:
        """Delete user (static method)."""
        try:
            response = supabase_service.client.table('users').delete().eq('clerk_user_id', clerk_user_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            raise Exception(f"Failed to delete user: {str(e)}")

    @staticmethod
    async def get_all_users_static() -> list:
        """Get all users (static method)."""
        try:
            response = supabase_service.client.table('users').select('*').eq('is_admin', False).execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Failed to get users: {str(e)}")

    @staticmethod
    async def get_all_admins_static() -> list:
        """Get all admin users (static method)."""
        try:
            response = supabase_service.client.table('users').select('*').eq('is_admin', True).execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Failed to get admins: {str(e)}")

    def calculate_quiz_score(self, answers: dict) -> int:
        """
        Calculate the quiz score based on answers.
        Args:
            answers (dict): The user's answers.
        Returns:
            int: The calculated score.
        """
        # Example logic: 1 point for each non-empty answer
        return sum(1 for a in answers.values() if a) 
from typing import List, Dict, Any, Optional
from datetime import datetime, UTC
from .supabase_service import supabase_service
from .user_service import UserService
import logging

logger = logging.getLogger(__name__)

"""
services/saved_items_service.py - Saved items service logic for VCE Career Guidance backend.

- Purpose: Provides business logic for managing user's saved subjects and careers.
- Major components: SavedItemsService class, async CRUD methods for saved items.
- Variable scope: Uses class attributes for shared state, local variables in methods.
"""

class SavedItemsService:
    """Service for managing user's saved subjects and careers."""

    def __init__(self):
        self.supabase = supabase_service
        self.user_service = UserService()

    async def get_saved_items(self, clerk_user_id: str) -> Dict[str, List[str]]:
        """Get user's saved subjects and careers."""
        try:
            # Get user by Clerk ID
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return {"subjects": [], "careers": []}

            # Get saved subjects from user preferences
            subjects = await self.get_saved_subjects(clerk_user_id)
            
            # Get saved careers from career_selections table
            careers = await self.get_saved_careers(clerk_user_id)

            return {
                "subjects": subjects,
                "careers": careers
            }
        except Exception as e:
            logger.error(f"Error getting saved items: {str(e)}")
            return {"subjects": [], "careers": []}

    async def get_saved_subjects(self, clerk_user_id: str) -> List[str]:
        """Get user's saved subjects from preferences."""
        try:
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return []

            # Get user preferences
            preferences = await self.user_service.get_user_preferences(clerk_user_id)
            if not preferences:
                return []

            # Extract saved subjects from preferences
            saved_subjects = preferences.get('preferences', {}).get('saved_subjects', [])
            return saved_subjects if isinstance(saved_subjects, list) else []
        except Exception as e:
            logger.error(f"Error getting saved subjects: {str(e)}")
            return []

    async def get_saved_careers(self, clerk_user_id: str) -> List[str]:
        """Get user's saved careers from career_selections table."""
        try:
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return []

            # Get career selections
            response = self.supabase.client.table('career_selections').select('selected_careers').eq('user_id', user.id).single()
            if not response.data:
                return []

            selected_careers = response.data.get('selected_careers', [])
            return selected_careers if isinstance(selected_careers, list) else []
        except Exception as e:
            logger.error(f"Error getting saved careers: {str(e)}")
            return []

    async def add_saved_subject(self, clerk_user_id: str, subject: str) -> bool:
        """Add a subject to user's saved subjects."""
        try:
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False

            # Get current preferences
            preferences = await self.user_service.get_user_preferences(clerk_user_id)
            if not preferences:
                preferences = {'preferences': {}}

            # Get current saved subjects
            saved_subjects = preferences.get('preferences', {}).get('saved_subjects', [])
            if not isinstance(saved_subjects, list):
                saved_subjects = []

            # Add subject if not already saved
            if subject not in saved_subjects:
                saved_subjects.append(subject)
                
                # Update preferences
                preferences['preferences']['saved_subjects'] = saved_subjects
                success = await self.user_service.update_user_preferences(clerk_user_id, preferences['preferences'])
                return success

            return True  # Subject already exists
        except Exception as e:
            logger.error(f"Error adding saved subject: {str(e)}")
            return False

    async def add_saved_career(self, clerk_user_id: str, career: str) -> bool:
        """Add a career to user's saved careers."""
        try:
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False

            # Check if career_selections record exists
            response = self.supabase.client.table('career_selections').select('*').eq('user_id', user.id).single()
            
            if response.data:
                # Update existing record
                selected_careers = response.data.get('selected_careers', [])
                if not isinstance(selected_careers, list):
                    selected_careers = []

                if career not in selected_careers:
                    selected_careers.append(career)
                    
                    update_data = {
                        'selected_careers': selected_careers,
                        'updated_at': datetime.now(UTC).isoformat()
                    }
                    
                    self.supabase.client.table('career_selections').update(update_data).eq('user_id', user.id).execute()
            else:
                # Create new record
                insert_data = {
                    'user_id': user.id,
                    'selected_careers': [career],
                    'created_at': datetime.now(UTC).isoformat(),
                    'updated_at': datetime.now(UTC).isoformat()
                }
                
                self.supabase.client.table('career_selections').insert(insert_data).execute()

            return True
        except Exception as e:
            logger.error(f"Error adding saved career: {str(e)}")
            return False

    async def remove_saved_subject(self, clerk_user_id: str, subject: str) -> bool:
        """Remove a subject from user's saved subjects."""
        try:
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False

            # Get current preferences
            preferences = await self.user_service.get_user_preferences(clerk_user_id)
            if not preferences:
                return False

            # Get current saved subjects
            saved_subjects = preferences.get('preferences', {}).get('saved_subjects', [])
            if not isinstance(saved_subjects, list):
                return False

            # Remove subject if exists
            if subject in saved_subjects:
                saved_subjects.remove(subject)
                
                # Update preferences
                preferences['preferences']['saved_subjects'] = saved_subjects
                success = await self.user_service.update_user_preferences(clerk_user_id, preferences['preferences'])
                return success

            return False  # Subject not found
        except Exception as e:
            logger.error(f"Error removing saved subject: {str(e)}")
            return False

    async def remove_saved_career(self, clerk_user_id: str, career: str) -> bool:
        """Remove a career from user's saved careers."""
        try:
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False

            # Get career selections
            response = self.supabase.client.table('career_selections').select('*').eq('user_id', user.id).single()
            if not response.data:
                return False

            selected_careers = response.data.get('selected_careers', [])
            if not isinstance(selected_careers, list):
                return False

            # Remove career if exists
            if career in selected_careers:
                selected_careers.remove(career)
                
                update_data = {
                    'selected_careers': selected_careers,
                    'updated_at': datetime.now(UTC).isoformat()
                }
                
                self.supabase.client.table('career_selections').update(update_data).eq('user_id', user.id).execute()
                return True

            return False  # Career not found
        except Exception as e:
            logger.error(f"Error removing saved career: {str(e)}")
            return False

    async def clear_saved_subjects(self, clerk_user_id: str) -> bool:
        """Clear all saved subjects for a user."""
        try:
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False

            # Get current preferences
            preferences = await self.user_service.get_user_preferences(clerk_user_id)
            if not preferences:
                return True  # No preferences to clear

            # Clear saved subjects
            preferences['preferences']['saved_subjects'] = []
            success = await self.user_service.update_user_preferences(clerk_user_id, preferences['preferences'])
            return success
        except Exception as e:
            logger.error(f"Error clearing saved subjects: {str(e)}")
            return False

    async def clear_saved_careers(self, clerk_user_id: str) -> bool:
        """Clear all saved careers for a user."""
        try:
            user = await self.user_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False

            # Clear career selections
            update_data = {
                'selected_careers': [],
                'updated_at': datetime.now(UTC).isoformat()
            }
            
            self.supabase.client.table('career_selections').update(update_data).eq('user_id', user.id).execute()
            return True
        except Exception as e:
            logger.error(f"Error clearing saved careers: {str(e)}")
            return False 
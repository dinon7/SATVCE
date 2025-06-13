"""
Firebase Service Module

This module provides a singleton service for Firebase operations, implementing
secure, efficient, and maintainable database interactions. It follows the
user-centred design principles and implements robust error handling and logging.

Key Features:
- Secure authentication and authorization
- Comprehensive error handling and logging
- Clear and concise code structure
- Detailed internal documentation
- Efficient data operations
- Robust validation
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth, db, initialize_app
from typing import Dict, Any, Optional, List, Union
import os
import logging
from datetime import datetime
import json
from pathlib import Path
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FirebaseError(Exception):
    """Custom exception for Firebase-related errors"""
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class FirebaseService:
    """
    Singleton service for Firebase operations.
    
    This class implements a thread-safe singleton pattern for Firebase operations,
    ensuring efficient resource usage and consistent state across the application.
    """
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        self.initialized = False
        self.db = db
        self.auth = auth
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK."""
        try:
            if settings.DEBUG:
                logger.info("Running in development mode")
                self.initialized = True
                return

            # Try to initialize using service account file first
            service_account_path = Path(settings.FIREBASE_SERVICE_ACCOUNT)
            if service_account_path.exists():
                cred = credentials.Certificate(str(service_account_path))
                initialize_app(cred, {'databaseURL': settings.FIREBASE_DATABASE_URL})
                self.initialized = True
                logger.info("Firebase Admin SDK initialized successfully using service account file")
                return

            # Fall back to individual credentials if service account file is not available
            required_credentials = [
                settings.FIREBASE_PROJECT_ID,
                settings.FIREBASE_PRIVATE_KEY,
                settings.FIREBASE_CLIENT_EMAIL
            ]

            if not all(required_credentials):
                logger.warning("Firebase credentials not fully configured. Using development mode.")
                self.initialized = True
                return

            # Format the private key properly
            private_key = settings.FIREBASE_PRIVATE_KEY
            if private_key and '\\n' in private_key:
                private_key = private_key.replace('\\n', '\n')

            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                "private_key": private_key,
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "client_id": settings.FIREBASE_CLIENT_ID,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": settings.FIREBASE_CLIENT_CERT_URL
            })
            
            initialize_app(cred, {'databaseURL': settings.FIREBASE_DATABASE_URL})
            self.initialized = True
            logger.info("Firebase Admin SDK initialized successfully using individual credentials")
            
        except Exception as e:
            if settings.DEBUG:
                logger.warning(f"Firebase initialization failed: {str(e)}")
                self.initialized = True
            else:
                logger.error(f"Firebase initialization failed: {str(e)}")
                raise

    async def verify_token(self, id_token: str) -> Dict[str, Any]:
        """
        Verify Firebase ID token with proper error handling.
        
        Args:
            id_token: The Firebase ID token to verify
            
        Returns:
            Dict containing the decoded token information
            
        Raises:
            FirebaseError: If token verification fails
        """
        try:
            decoded_token = self.auth.verify_id_token(id_token)
            logger.info(f"Token verified for user: {decoded_token.get('uid')}")
            return decoded_token
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise FirebaseError(f"Invalid token: {str(e)}", "TOKEN_VERIFICATION_FAILED")

    async def create_user_profile(self, user_id: str, data: Dict[str, Any]) -> None:
        """
        Create or update user profile with validation.
        
        Args:
            user_id: The user's unique identifier
            data: User profile data
            
        Raises:
            FirebaseError: If profile creation/update fails
        """
        try:
            # Validate required fields
            required_fields = ['email', 'displayName']
            if not all(field in data for field in required_fields):
                raise FirebaseError("Missing required fields", "VALIDATION_ERROR")

            # Add metadata
            data['updatedAt'] = datetime.utcnow()
            
            # Update Firestore
            self.db.collection('users').document(user_id).set(data, merge=True)
            logger.info(f"User profile updated for user: {user_id}")
        except Exception as e:
            logger.error(f"Failed to create/update user profile: {str(e)}")
            raise FirebaseError(f"Profile operation failed: {str(e)}", "PROFILE_OPERATION_FAILED")

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile with error handling.
        
        Args:
            user_id: The user's unique identifier
            
        Returns:
            User profile data or None if not found
            
        Raises:
            FirebaseError: If profile retrieval fails
        """
        try:
            doc = self.db.collection('users').document(user_id).get()
            if not doc.exists:
                logger.warning(f"User profile not found for user: {user_id}")
                return None
            return doc.to_dict()
        except Exception as e:
            logger.error(f"Failed to get user profile: {str(e)}")
            raise FirebaseError(f"Profile retrieval failed: {str(e)}", "PROFILE_RETRIEVAL_FAILED")

    async def store_ai_result(self, user_id: str, data: Dict[str, Any]) -> str:
        """
        Store AI analysis result with validation.
        
        Args:
            user_id: The user's unique identifier
            data: AI analysis result data
            
        Returns:
            Document ID of the stored result
            
        Raises:
            FirebaseError: If storage operation fails
        """
        try:
            # Validate data structure
            if not isinstance(data, dict) or not data:
                raise FirebaseError("Invalid AI result data", "VALIDATION_ERROR")

            # Add metadata
            doc_data = {
                'userId': user_id,
                'data': data,
                'createdAt': datetime.utcnow()
            }
            
            # Store in Firestore
            doc_ref = self.db.collection('ai_results').document()
            doc_ref.set(doc_data)
            logger.info(f"AI result stored for user: {user_id}")
            return doc_ref.id
        except Exception as e:
            logger.error(f"Failed to store AI result: {str(e)}")
            raise FirebaseError(f"AI result storage failed: {str(e)}", "STORAGE_FAILED")

    async def get_user_ai_results(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all AI results for a user with error handling.
        
        Args:
            user_id: The user's unique identifier
            
        Returns:
            List of AI results
            
        Raises:
            FirebaseError: If retrieval fails
        """
        try:
            results = self.db.collection('ai_results')\
                .where('userId', '==', user_id)\
                .order_by('createdAt', direction=firestore.Query.DESCENDING)\
                .stream()
            return [doc.to_dict() for doc in results]
        except Exception as e:
            logger.error(f"Failed to get AI results: {str(e)}")
            raise FirebaseError(f"AI results retrieval failed: {str(e)}", "RETRIEVAL_FAILED")

    async def store_career_suggestion(self, user_id: str, data: Dict[str, Any]) -> str:
        """
        Store career suggestion with validation.
        
        Args:
            user_id: The user's unique identifier
            data: Career suggestion data
            
        Returns:
            Document ID of the stored suggestion
            
        Raises:
            FirebaseError: If storage operation fails
        """
        try:
            # Validate data structure
            required_fields = ['career', 'description', 'requiredSkills']
            if not all(field in data for field in required_fields):
                raise FirebaseError("Missing required fields", "VALIDATION_ERROR")

            # Add metadata
            doc_data = {
                'userId': user_id,
                'data': data,
                'createdAt': datetime.utcnow()
            }
            
            # Store in Firestore
            doc_ref = self.db.collection('career_suggestions').document()
            doc_ref.set(doc_data)
            logger.info(f"Career suggestion stored for user: {user_id}")
            return doc_ref.id
        except Exception as e:
            logger.error(f"Failed to store career suggestion: {str(e)}")
            raise FirebaseError(f"Career suggestion storage failed: {str(e)}", "STORAGE_FAILED")

    async def get_career_suggestions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get career suggestions for a user with error handling.
        
        Args:
            user_id: The user's unique identifier
            
        Returns:
            List of career suggestions
            
        Raises:
            FirebaseError: If retrieval fails
        """
        try:
            suggestions = self.db.collection('career_suggestions')\
                .where('userId', '==', user_id)\
                .order_by('createdAt', direction=firestore.Query.DESCENDING)\
                .stream()
            return [doc.to_dict() for doc in suggestions]
        except Exception as e:
            logger.error(f"Failed to get career suggestions: {str(e)}")
            raise FirebaseError(f"Career suggestions retrieval failed: {str(e)}", "RETRIEVAL_FAILED")

    async def store_resource(self, data: Dict[str, Any]) -> str:
        """
        Store educational resource with validation.
        
        Args:
            data: Resource data
            
        Returns:
            Document ID of the stored resource
            
        Raises:
            FirebaseError: If storage operation fails
        """
        try:
            # Validate data structure
            required_fields = ['title', 'url', 'description', 'tags']
            if not all(field in data for field in required_fields):
                raise FirebaseError("Missing required fields", "VALIDATION_ERROR")

            # Add metadata
            doc_data = {
                **data,
                'createdAt': datetime.utcnow()
            }
            
            # Store in Firestore
            doc_ref = self.db.collection('resources').document()
            doc_ref.set(doc_data)
            logger.info("Resource stored successfully")
            return doc_ref.id
        except Exception as e:
            logger.error(f"Failed to store resource: {str(e)}")
            raise FirebaseError(f"Resource storage failed: {str(e)}", "STORAGE_FAILED")

    async def get_resources(self, tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Get resources with optional tag filtering.
        
        Args:
            tags: Optional list of tags to filter by
            
        Returns:
            List of resources
            
        Raises:
            FirebaseError: If retrieval fails
        """
        try:
            query = self.db.collection('resources')
            if tags:
                query = query.where('tags', 'array_contains_any', tags)
            resources = query.order_by('createdAt', direction=firestore.Query.DESCENDING).stream()
            return [doc.to_dict() for doc in resources]
        except Exception as e:
            logger.error(f"Failed to get resources: {str(e)}")
            raise FirebaseError(f"Resources retrieval failed: {str(e)}", "RETRIEVAL_FAILED")

    async def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> None:
        """
        Update user preferences in real-time database.
        
        Args:
            user_id: The user's unique identifier
            preferences: User preferences data
            
        Raises:
            FirebaseError: If update fails
        """
        try:
            ref = self.rtdb.reference(f'/users/{user_id}/preferences')
            ref.set(preferences)
            logger.info(f"User preferences updated for user: {user_id}")
        except Exception as e:
            logger.error(f"Failed to update user preferences: {str(e)}")
            raise FirebaseError(f"Preferences update failed: {str(e)}", "UPDATE_FAILED")

    async def get_user_preferences(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user preferences from real-time database.
        
        Args:
            user_id: The user's unique identifier
            
        Returns:
            User preferences or None if not found
            
        Raises:
            FirebaseError: If retrieval fails
        """
        try:
            ref = self.rtdb.reference(f'/users/{user_id}/preferences')
            return ref.get()
        except Exception as e:
            logger.error(f"Failed to get user preferences: {str(e)}")
            raise FirebaseError(f"Preferences retrieval failed: {str(e)}", "RETRIEVAL_FAILED")

# Create a singleton instance
firebase_service = FirebaseService() 
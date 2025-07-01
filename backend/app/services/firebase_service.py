"""
Firebase Service Module - AI Operations Only

This module provides a singleton service for Firebase operations related to AI only.
All user data operations have been moved to Supabase.

Key Features:
- AI result caching and storage
- AI analysis result management
- AI recommendation storage
- Comprehensive error handling and logging
"""

import firebase_admin
from firebase_admin import credentials, firestore, initialize_app
from typing import Dict, Any, Optional, List
import os
import logging
from datetime import datetime, UTC
from pathlib import Path
from ..core.config import settings

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
    Singleton service for Firebase AI operations only.
    
    This class implements a thread-safe singleton pattern for Firebase operations,
    ensuring efficient resource usage and consistent state across the application.
    Only AI-related operations are handled here.
    """
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        self.initialized = False
        self.db = None
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK for AI operations."""
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
                self.db = firestore.client()
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
            self.db = firestore.client()
            self.initialized = True
            logger.info("Firebase Admin SDK initialized successfully using individual credentials")
            
        except Exception as e:
            if settings.DEBUG:
                logger.warning(f"Firebase initialization failed: {str(e)}")
                self.initialized = True
            else:
                logger.error(f"Firebase initialization failed: {str(e)}")
                raise

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
                'createdAt': datetime.now(UTC),
                'type': 'ai_analysis'
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

    async def store_ai_recommendation(self, user_id: str, data: Dict[str, Any]) -> str:
        """
        Store AI-generated recommendation with validation.
        
        Args:
            user_id: The user's unique identifier
            data: AI recommendation data
            
        Returns:
            Document ID of the stored recommendation
            
        Raises:
            FirebaseError: If storage operation fails
        """
        try:
            # Validate data structure
            if not isinstance(data, dict) or not data:
                raise FirebaseError("Invalid AI recommendation data", "VALIDATION_ERROR")

            # Add metadata
            doc_data = {
                'userId': user_id,
                'data': data,
                'createdAt': datetime.now(UTC),
                'type': 'ai_recommendation'
            }
            
            # Store in Firestore
            doc_ref = self.db.collection('ai_recommendations').document()
            doc_ref.set(doc_data)
            logger.info(f"AI recommendation stored for user: {user_id}")
            return doc_ref.id
        except Exception as e:
            logger.error(f"Failed to store AI recommendation: {str(e)}")
            raise FirebaseError(f"AI recommendation storage failed: {str(e)}", "STORAGE_FAILED")

    async def get_ai_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all AI recommendations for a user with error handling.
        
        Args:
            user_id: The user's unique identifier
            
        Returns:
            List of AI recommendations
            
        Raises:
            FirebaseError: If retrieval fails
        """
        try:
            results = self.db.collection('ai_recommendations')\
                .where('userId', '==', user_id)\
                .order_by('createdAt', direction=firestore.Query.DESCENDING)\
                .stream()
            return [doc.to_dict() for doc in results]
        except Exception as e:
            logger.error(f"Failed to get AI recommendations: {str(e)}")
            raise FirebaseError(f"AI recommendations retrieval failed: {str(e)}", "RETRIEVAL_FAILED")

    async def store_ai_cache(self, cache_key: str, data: Dict[str, Any], ttl: int = 3600) -> None:
        """
        Store AI cache with TTL (Time To Live).
        
        Args:
            cache_key: Unique cache key
            data: Data to cache
            ttl: Time to live in seconds (default: 1 hour)
            
        Raises:
            FirebaseError: If storage operation fails
        """
        try:
            doc_data = {
                'data': data,
                'createdAt': datetime.now(UTC),
                'expiresAt': datetime.now(UTC).timestamp() + ttl,
                'ttl': ttl
            }
            
            doc_ref = self.db.collection('ai_cache').document(cache_key)
            doc_ref.set(doc_data)
            logger.info(f"AI cache stored with key: {cache_key}")
        except Exception as e:
            logger.error(f"Failed to store AI cache: {str(e)}")
            raise FirebaseError(f"AI cache storage failed: {str(e)}", "STORAGE_FAILED")

    async def get_ai_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Get AI cache with TTL validation.
        
        Args:
            cache_key: Unique cache key
            
        Returns:
            Cached data if valid, None if expired or not found
            
        Raises:
            FirebaseError: If retrieval fails
        """
        try:
            doc_ref = self.db.collection('ai_cache').document(cache_key)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
                
            doc_data = doc.to_dict()
            
            # Check if cache has expired
            if doc_data.get('expiresAt', 0) < datetime.now(UTC).timestamp():
                # Delete expired cache
                doc_ref.delete()
                logger.info(f"Expired AI cache deleted: {cache_key}")
                return None
                
            return doc_data.get('data')
        except Exception as e:
            logger.error(f"Failed to get AI cache: {str(e)}")
            raise FirebaseError(f"AI cache retrieval failed: {str(e)}", "RETRIEVAL_FAILED")

    async def clear_ai_cache(self, user_id: str) -> None:
        """
        Clear all AI cache for a user.
        
        Args:
            user_id: The user's unique identifier
            
        Raises:
            FirebaseError: If clearing fails
        """
        try:
            # Get all cache documents for the user
            cache_docs = self.db.collection('ai_cache')\
                .where('userId', '==', user_id)\
                .stream()
            
            # Delete each cache document
            for doc in cache_docs:
                doc.reference.delete()
                
            logger.info(f"AI cache cleared for user: {user_id}")
        except Exception as e:
            logger.error(f"Failed to clear AI cache: {str(e)}")
            raise FirebaseError(f"AI cache clearing failed: {str(e)}", "CLEAR_FAILED")

    async def store_ai_analysis(self, user_id: str, analysis_data: Dict[str, Any]) -> str:
        """
        Store AI analysis with validation.
        
        Args:
            user_id: The user's unique identifier
            analysis_data: AI analysis data
            
        Returns:
            Document ID of the stored analysis
            
        Raises:
            FirebaseError: If storage operation fails
        """
        try:
            # Validate data structure
            if not isinstance(analysis_data, dict) or not analysis_data:
                raise FirebaseError("Invalid AI analysis data", "VALIDATION_ERROR")

            # Add metadata
            doc_data = {
                'userId': user_id,
                'analysis': analysis_data,
                'createdAt': datetime.now(UTC),
                'type': 'ai_analysis'
            }
            
            # Store in Firestore
            doc_ref = self.db.collection('ai_analyses').document()
            doc_ref.set(doc_data)
            logger.info(f"AI analysis stored for user: {user_id}")
            return doc_ref.id
        except Exception as e:
            logger.error(f"Failed to store AI analysis: {str(e)}")
            raise FirebaseError(f"AI analysis storage failed: {str(e)}", "STORAGE_FAILED")

    async def get_latest_ai_analysis(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the latest AI analysis for a user.
        
        Args:
            user_id: The user's unique identifier
            
        Returns:
            Latest AI analysis or None if not found
            
        Raises:
            FirebaseError: If retrieval fails
        """
        try:
            results = self.db.collection('ai_analyses')\
                .where('userId', '==', user_id)\
                .order_by('createdAt', direction=firestore.Query.DESCENDING)\
                .limit(1)\
                .stream()
            
            for doc in results:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Failed to get latest AI analysis: {str(e)}")
            raise FirebaseError(f"AI analysis retrieval failed: {str(e)}", "RETRIEVAL_FAILED")

# Create a singleton instance
firebase_service = FirebaseService() 
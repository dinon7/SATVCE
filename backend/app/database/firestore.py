from firebase_admin import credentials, firestore, initialize_app
import os
from typing import Optional, Dict, Any
import json
from google.cloud import firestore
from google.oauth2 import service_account
from app.core.config import settings
from pathlib import Path

class FirestoreClient:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            try:
                if settings.DEBUG:
                    # Try to use service account file first
                    service_account_path = Path(settings.FIREBASE_SERVICE_ACCOUNT)
                    if service_account_path.exists():
                        credentials = service_account.Credentials.from_service_account_file(
                            str(service_account_path)
                        )
                        cls._instance = firestore.Client(credentials=credentials)
                        return cls._instance
                    
                    # Fall back to default credentials for development
                    print("Warning: Using development mode with default credentials")
                    cls._instance = firestore.Client()
                else:
                    # Check for required Firebase credentials
                    required_credentials = [
                        settings.FIREBASE_PROJECT_ID,
                        settings.FIREBASE_PRIVATE_KEY,
                        settings.FIREBASE_CLIENT_EMAIL
                    ]

                    if not all(required_credentials):
                        raise ValueError("Missing required Firebase credentials")

                    # Format the private key properly
                    private_key = settings.FIREBASE_PRIVATE_KEY
                    if private_key and '\\n' in private_key:
                        private_key = private_key.replace('\\n', '\n')

                    # Use service account for production
                    credentials_dict = {
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
                    }
                    
                    credentials = service_account.Credentials.from_service_account_info(credentials_dict)
                    cls._instance = firestore.Client(credentials=credentials, project=settings.FIREBASE_PROJECT_ID)
                    
            except Exception as e:
                if settings.DEBUG:
                    print(f"Warning: Using development mode. Firebase initialization failed: {str(e)}")
                    cls._instance = firestore.Client()
                else:
                    raise Exception(f"Failed to initialize Firestore client: {str(e)}")
                    
        return cls._instance

    @classmethod
    async def get_document(cls, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a document from Firestore."""
        try:
            doc = cls.get_instance().collection(collection).document(doc_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            raise Exception(f"Failed to get document: {str(e)}")

    @classmethod
    async def set_document(cls, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        """Set a document in Firestore."""
        try:
            cls.get_instance().collection(collection).document(doc_id).set(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to set document: {str(e)}")

    @classmethod
    async def update_document(cls, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        """Update a document in Firestore."""
        try:
            cls.get_instance().collection(collection).document(doc_id).update(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to update document: {str(e)}")

    @classmethod
    async def delete_document(cls, collection: str, doc_id: str) -> bool:
        """Delete a document from Firestore."""
        try:
            cls.get_instance().collection(collection).document(doc_id).delete()
            return True
        except Exception as e:
            raise Exception(f"Failed to delete document: {str(e)}")

    @classmethod
    async def query_documents(cls, collection: str, field: str, operator: str, value: Any) -> list:
        """Query documents from Firestore."""
        try:
            docs = cls.get_instance().collection(collection).where(field, operator, value).get()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            raise Exception(f"Failed to query documents: {str(e)}")

# Initialize collections
db = FirestoreClient.get_instance()
users = db.collection('users')
subjects = db.collection('subjects')
careers = db.collection('careers')
quiz_results = db.collection('quiz_results') 
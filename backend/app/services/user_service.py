from typing import List, Optional, Dict, Any
from firebase_admin import db, auth
from app.schemas.user import User, UserCreate, UserUpdate
from app.utils.password import get_password_hash, verify_password
from app.firebase_init import initialize_firebase
from app.database.firestore import FirestoreClient
from datetime import datetime
from app.models.user import UserInDB, UserResponse
from app.services.firebase_service import firebase_service

class UserService:
    def __init__(self):
        initialize_firebase()
        self.users_ref = db.reference('users')
        self.db = firebase_service.db

    async def get_users(self) -> List[User]:
        """Get all users"""
        users_data = self.users_ref.get()
        if not users_data:
            return []
        return [User(**data) for data in users_data.values()]

    async def get_user(self, user_id: str) -> Optional[User]:
        """Get a specific user by ID"""
        user_data = self.users_ref.child(user_id).get()
        if not user_data:
            return None
        return User(**user_data)

    async def create_user(self, user: UserCreate) -> UserResponse:
        """Create a new user."""
        user_dict = user.dict()
        user_dict["hashed_password"] = get_password_hash(user.password)
        del user_dict["password"]
        
        user_ref = self.db.collection("users").document()
        user_dict["id"] = user_ref.id
        user_ref.set(user_dict)
        
        return UserResponse(**user_dict)

    async def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """Get user by email."""
        users = self.db.collection("users").where("email", "==", email).limit(1).get()
        if not users:
            return None
        return UserResponse(**users[0].to_dict())

    async def authenticate_user(self, email: str, password: str) -> Optional[UserResponse]:
        """Authenticate user with email and password."""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def update_user(self, user_id: str, user_data: dict) -> Optional[UserResponse]:
        """Update user data."""
        user_ref = self.db.collection("users").document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return None
            
        user_ref.update(user_data)
        updated_user = user_ref.get()
        return UserResponse(**updated_user.to_dict())

    async def delete_user(self, user_id: str) -> bool:
        """Delete user."""
        user_ref = self.db.collection("users").document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return False
            
        user_ref.delete()
        return True

    @staticmethod
    async def create_user(email: str, password: str, name: str, is_admin: bool = False) -> Dict[str, Any]:
        """Create a new user in Firebase Auth and Firestore."""
        try:
            # Create user in Firebase Auth
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=name
            )

            # Create user document in Firestore
            user_data = {
                'uid': user_record.uid,
                'email': email,
                'name': name,
                'is_admin': is_admin,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }

            await FirestoreClient.set_document('users', user_record.uid, user_data)
            return user_data

        except Exception as e:
            raise Exception(f"Failed to create user: {str(e)}")

    @staticmethod
    async def get_user(uid: str) -> Optional[Dict[str, Any]]:
        """Get user by UID."""
        try:
            return await FirestoreClient.get_document('users', uid)
        except Exception as e:
            raise Exception(f"Failed to get user: {str(e)}")

    @staticmethod
    async def update_user(uid: str, data: Dict[str, Any]) -> bool:
        """Update user data."""
        try:
            data['updated_at'] = datetime.utcnow().isoformat()
            return await FirestoreClient.update_document('users', uid, data)
        except Exception as e:
            raise Exception(f"Failed to update user: {str(e)}")

    @staticmethod
    async def delete_user(uid: str) -> bool:
        """Delete user from Firebase Auth and Firestore."""
        try:
            # Delete from Firebase Auth
            auth.delete_user(uid)
            
            # Delete from Firestore
            return await FirestoreClient.delete_document('users', uid)
        except Exception as e:
            raise Exception(f"Failed to delete user: {str(e)}")

    @staticmethod
    async def get_all_users() -> list:
        """Get all users."""
        try:
            return await FirestoreClient.query_documents('users', 'is_admin', '==', False)
        except Exception as e:
            raise Exception(f"Failed to get users: {str(e)}")

    @staticmethod
    async def get_all_admins() -> list:
        """Get all admin users."""
        try:
            return await FirestoreClient.query_documents('users', 'is_admin', '==', True)
        except Exception as e:
            raise Exception(f"Failed to get admins: {str(e)}")

    @staticmethod
    async def verify_token(token: str) -> Dict[str, Any]:
        """Verify Firebase ID token."""
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            raise Exception(f"Failed to verify token: {str(e)}") 
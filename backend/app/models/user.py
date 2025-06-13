from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from .base import TimestampModel
from datetime import datetime
from firebase_admin import auth

class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    name: str
    is_admin: bool = False
    has_completed_quiz: bool = False

class UserCreate(UserBase):
    """User creation model"""
    password: str

class UserUpdate(BaseModel):
    """User update model"""
    name: Optional[str] = None
    is_admin: Optional[bool] = None
    has_completed_quiz: Optional[bool] = None
    quiz_answers: Optional[Dict[int, str]] = None

class UserInDB(UserBase):
    """User model as stored in database"""
    uid: str
    created_at: datetime
    updated_at: datetime
    quiz_answers: Optional[Dict[int, str]] = None

    class Config:
        from_attributes = True

class UserResponse(UserInDB):
    """Response model for user data"""
    pass

class User(UserInDB):
    pass

async def create_user(user_data: UserCreate) -> User:
    """Create a new user in Firebase Auth and Firestore."""
    try:
        # Create user in Firebase Auth
        user_record = auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.name
        )

        # Create user document in Firestore
        user_doc = {
            'uid': user_record.uid,
            'email': user_data.email,
            'name': user_data.name,
            'is_admin': user_data.is_admin,
            'has_completed_quiz': user_data.has_completed_quiz,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        from app.database.firestore import users_collection
        users_collection.document(user_record.uid).set(user_doc)

        return User(**user_doc)
    except Exception as e:
        raise Exception(f"Failed to create user: {str(e)}")

async def get_user(uid: str) -> Optional[User]:
    """Get a user by UID."""
    try:
        from app.database.firestore import users_collection
        user_doc = users_collection.document(uid).get()
        if user_doc.exists:
            return User(**user_doc.to_dict())
        return None
    except Exception as e:
        raise Exception(f"Failed to get user: {str(e)}")

async def update_user(uid: str, user_data: UserUpdate) -> Optional[User]:
    """Update a user's information."""
    try:
        from app.database.firestore import users_collection
        user_ref = users_collection.document(uid)
        
        update_data = user_data.dict(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        user_ref.update(update_data)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            return User(**user_doc.to_dict())
        return None
    except Exception as e:
        raise Exception(f"Failed to update user: {str(e)}")

async def delete_user(uid: str) -> bool:
    """Delete a user from Firebase Auth and Firestore."""
    try:
        # Delete from Firebase Auth
        auth.delete_user(uid)
        
        # Delete from Firestore
        from app.database.firestore import users_collection
        users_collection.document(uid).delete()
        
        return True
    except Exception as e:
        raise Exception(f"Failed to delete user: {str(e)}") 
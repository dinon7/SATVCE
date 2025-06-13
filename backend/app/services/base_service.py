from typing import TypeVar, Generic
from firebase_admin import db

T = TypeVar('T')

class BaseService(Generic[T]):
    """Base service class for Firebase (can be extended as needed)"""
    def __init__(self, model_class: type[T]):
        self.model_class = model_class
        self.db = db.reference('/') 
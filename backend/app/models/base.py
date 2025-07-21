from typing import Optional
from pydantic import BaseModel, Field

class BaseResponse(BaseModel):
    """Base response model"""
    success: bool = True
    message: Optional[str] = None

class TimestampModel(BaseModel):
    """Base model with timestamp fields"""
    created_at: Optional[str] = None
    updated_at: Optional[str] = None 
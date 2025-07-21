from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class FileBase(BaseModel):
    """Base file model"""
    filename: str = Field(..., description="File name")
    content_type: str = Field(..., description="File content type")
    size: int = Field(..., description="File size in bytes")

class FileCreate(FileBase):
    """File creation model"""
    filepath: str = Field(..., description="Path to the file")

class File(FileBase):
    """File model"""
    url: str = Field(..., description="File URL")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True 
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class ResourceBase(BaseModel):
    """Base resource model"""
    title: str = Field(..., description="Resource title")
    description: str = Field(..., description="Resource description")
    type: str = Field(..., description="Resource type (e.g., video, document, link)")
    url: str = Field(..., description="Resource URL")
    tags: List[str] = Field(..., description="Resource tags")
    subject_id: str = Field(..., description="Associated subject ID")
    career_id: Optional[str] = Field(None, description="Associated career ID")

class ResourceCreate(ResourceBase):
    """Resource creation model"""
    pass

class ResourceUpdate(BaseModel):
    """Resource update model"""
    title: Optional[str] = Field(None, description="Resource title")
    description: Optional[str] = Field(None, description="Resource description")
    type: Optional[str] = Field(None, description="Resource type")
    url: Optional[str] = Field(None, description="Resource URL")
    tags: Optional[List[str]] = Field(None, description="Resource tags")
    subject_id: Optional[str] = Field(None, description="Associated subject ID")
    career_id: Optional[str] = Field(None, description="Associated career ID")

class Resource(ResourceBase):
    """Resource model"""
    id: str = Field(..., description="Resource ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True 
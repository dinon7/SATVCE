from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Resource(BaseModel):
    id: Optional[str]
    title: str
    url: str
    description: str
    tags: List[str]
    createdBy: Optional[str]
    createdAt: Optional[datetime]

class ResourceCreate(BaseModel):
    title: str
    url: str
    description: str
    tags: List[str]

class ResourceResponse(BaseModel):
    id: str
    title: str
    url: str
    description: str
    tags: List[str]
    createdBy: str
    createdAt: datetime 
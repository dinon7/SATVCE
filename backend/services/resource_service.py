from typing import List, Optional
from sqlalchemy.orm import Session
from ..db.models import Resource
from ..schemas.resource import ResourceCreate, ResourceResponse
from datetime import datetime

def get_resources(db: Session, tag: Optional[str] = None) -> List[ResourceResponse]:
    query = db.query(Resource)
    if tag:
        query = query.filter(Resource.tags.contains([tag]))
    resources = query.order_by(Resource.created_at.desc()).all()
    
    return [
        ResourceResponse(
            id=str(resource.id),
            title=resource.title,
            url=resource.url,
            description=resource.description,
            tags=resource.tags,
            createdBy=resource.created_by,
            createdAt=resource.created_at
        )
        for resource in resources
    ]

def create_resource(db: Session, resource: ResourceCreate, user_id: str) -> ResourceResponse:
    db_resource = Resource(
        title=resource.title,
        url=resource.url,
        description=resource.description,
        tags=resource.tags,
        created_by=user_id
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    return ResourceResponse(
        id=str(db_resource.id),
        title=db_resource.title,
        url=db_resource.url,
        description=db_resource.description,
        tags=db_resource.tags,
        createdBy=db_resource.created_by,
        createdAt=db_resource.created_at
    )

def delete_resource(db: Session, resource_id: str) -> bool:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        return False
    
    db.delete(resource)
    db.commit()
    return True

def get_resource_by_id(db: Session, resource_id: str) -> Optional[ResourceResponse]:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        return None
    
    return ResourceResponse(
        id=str(resource.id),
        title=resource.title,
        url=resource.url,
        description=resource.description,
        tags=resource.tags,
        createdBy=resource.created_by,
        createdAt=resource.created_at
    ) 
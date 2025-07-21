from typing import List, Dict, Any, Optional
from app.services.supabase_service import supabase_service

class ResourceService:
    """Service for resource operations using Supabase."""
    def __init__(self):
        self.supabase = supabase_service
        self.strTableName = 'resources'

    async def get_resources(self, intSkip: int = 0, intLimit: int = 100) -> List[Dict[str, Any]]:
        try:
            arrResources = await self.supabase.get_all_resources(skip=intSkip, limit=intLimit)
            return arrResources
        except Exception as objErr:
            raise Exception(f"Failed to get resources: {str(objErr)}")

    async def get_approved_resources(self, intSkip: int = 0, intLimit: int = 100) -> List[Dict[str, Any]]:
        try:
            arrResources = await self.supabase.get_all_resources(status='approved', skip=intSkip, limit=intLimit)
            return arrResources
        except Exception as objErr:
            raise Exception(f"Failed to get approved resources: {str(objErr)}")

    async def get_resource_by_id(self, strResourceId: str) -> Optional[Dict[str, Any]]:
        try:
            arrResources = await self.supabase.get_all_resources()
            for objResource in arrResources:
                if objResource.get('id') == strResourceId:
                    return objResource
            return None
        except Exception as objErr:
            raise Exception(f"Failed to get resource by id: {str(objErr)}")

    async def create_resource(self, strUserId: str, dictResource: Dict[str, Any]) -> Dict[str, Any]:
        try:
            objResource = await self.supabase.create_resource(dictResource, strUserId)
            return objResource
        except Exception as objErr:
            raise Exception(f"Failed to create resource: {str(objErr)}")

    async def update_resource(self, strResourceId: str, dictResource: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            objResource = await self.supabase.update_resource(strResourceId, dictResource)
            return objResource
        except Exception as objErr:
            raise Exception(f"Failed to update resource: {str(objErr)}")

    async def delete_resource(self, strResourceId: str) -> bool:
        try:
            blnDeleted = await self.supabase.delete_resource(strResourceId)
            return blnDeleted
        except Exception as objErr:
            raise Exception(f"Failed to delete resource: {str(objErr)}") 
from typing import List, Dict, Any, Optional
from .supabase_service import supabase_service
from .user_service import UserService
from .resource_service import ResourceService
from .subject_service import SubjectService
from .career_service import CareerService

class AdminService:
    """Service for admin operations."""
    def __init__(self):
        self.supabase = supabase_service
        self.user_service = UserService()
        self.resource_service = ResourceService()
        self.subject_service = SubjectService()
        self.career_service = CareerService()

    async def get_admin_stats(self) -> Dict[str, Any]:
        return await self.supabase.get_admin_stats()

    async def get_site_settings(self) -> Dict[str, Any]:
        return await self.supabase.get_site_settings()

    async def update_site_settings(self, strAdminUserId: str, dictSettings: Dict[str, Any]) -> Dict[str, Any]:
        return await self.supabase.update_site_settings(strAdminUserId, dictSettings)

    async def get_all_users(self, intSkip: int, intLimit: int) -> List[Dict[str, Any]]:
        return await self.supabase.get_all_users(intSkip, intLimit)

    async def get_user_by_id(self, strUserId: str) -> Optional[Dict[str, Any]]:
        return await self.supabase.get_user_by_id(strUserId)

    async def update_user(self, strUserId: str, dictUserData: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return await self.supabase.update_user(strUserId, dictUserData)

    async def delete_user(self, strUserId: str) -> bool:
        return await self.supabase.delete_user(strUserId)

    async def get_all_resources_for_admin(self, status: Optional[str], type: Optional[str], skip: int, limit: int) -> List[Dict[str, Any]]:
        return await self.supabase.get_all_resources(status, type, skip, limit)

    async def update_resource_status(self, strResourceId: str, strStatus: str, strAdminUserId: str) -> Optional[Dict[str, Any]]:
        return await self.supabase.update_resource_status(strResourceId, strStatus, strAdminUserId)

    async def get_admin_activity(self, intSkip: int, intLimit: int) -> List[Dict[str, Any]]:
        return await self.supabase.get_admin_activity(intSkip, intLimit)

    async def log_admin_activity(self, strAdminUserId: str, strAction: str, dictDetails: Optional[Dict[str, Any]]) -> None:
        await self.supabase.log_admin_activity(strAdminUserId, strAction, dictDetails)

    # Note: Subject, Career, etc. management should use their respective services.
    # This service is for admin-specific views or cross-cutting concerns. 
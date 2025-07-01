from typing import TypeVar, Generic, Optional, List, Dict, Any
from ..services.supabase_service import supabase_service

T = TypeVar('T')

class BaseService(Generic[T]):
    """Base service class for Supabase operations"""
    
    def __init__(self, model_class: type[T], table_name: str):
        self.model_class = model_class
        self.table_name = table_name
        self.supabase = supabase_service

    async def get_all(self) -> List[T]:
        """Get all records from the table"""
        try:
            response = self.supabase.client.table(self.table_name).select('*').execute()
            data = response.data if response.data else []
            return [self.model_class(**item) for item in data]
        except Exception as e:
            raise Exception(f"Failed to get all {self.table_name}: {str(e)}")

    async def get_by_id(self, record_id: str) -> Optional[T]:
        """Get a record by ID"""
        try:
            response = self.supabase.client.table(self.table_name).select('*').eq('id', record_id).single()
            if not response.data:
                return None
            return self.model_class(**response.data)
        except Exception as e:
            raise Exception(f"Failed to get {self.table_name} by ID: {str(e)}")

    async def create(self, data: Dict[str, Any]) -> T:
        """Create a new record"""
        try:
            response = self.supabase.client.table(self.table_name).insert(data).execute()
            if not response.data:
                raise Exception("Failed to create record")
            return self.model_class(**response.data[0])
        except Exception as e:
            raise Exception(f"Failed to create {self.table_name}: {str(e)}")

    async def update(self, record_id: str, data: Dict[str, Any]) -> Optional[T]:
        """Update a record"""
        try:
            response = self.supabase.client.table(self.table_name).update(data).eq('id', record_id).execute()
            if not response.data:
                return None
            return self.model_class(**response.data[0])
        except Exception as e:
            raise Exception(f"Failed to update {self.table_name}: {str(e)}")

    async def delete(self, record_id: str) -> bool:
        """Delete a record"""
        try:
            response = self.supabase.client.table(self.table_name).delete().eq('id', record_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            raise Exception(f"Failed to delete {self.table_name}: {str(e)}")

    async def query(self, column: str, operator: str, value: Any) -> List[T]:
        """Query records by column, operator, and value"""
        try:
            response = self.supabase.client.table(self.table_name).select('*').filter(column, operator, value).execute()
            data = response.data if response.data else []
            return [self.model_class(**item) for item in data]
        except Exception as e:
            raise Exception(f"Failed to query {self.table_name}: {str(e)}")

    async def count(self) -> int:
        """Get total count of records"""
        try:
            response = self.supabase.client.table(self.table_name).select('*', count='exact').execute()
            return response.count if response.count else 0
        except Exception as e:
            raise Exception(f"Failed to count {self.table_name}: {str(e)}") 
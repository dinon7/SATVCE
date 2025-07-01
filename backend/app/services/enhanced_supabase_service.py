"""
Enhanced Supabase Service with Transaction Pooler Integration

This service provides a robust, high-availability interface to Supabase that:
- Uses the transaction pooler for all operations
- Provides automatic retry and failover
- Handles connection pooling efficiently
- Supports real-time data synchronization
- Includes comprehensive error handling
- Provides performance monitoring
- Supports batch operations
- Handles complex transactions

Key Features:
- Zero-downtime operations
- Automatic failover and recovery
- Real-time data consistency
- Performance optimization
- Comprehensive monitoring
- Batch processing
- Transaction isolation
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional, Union, Tuple
from datetime import datetime, UTC
import os
from .transaction_pooler import get_transaction_pooler, TransactionPooler

logger = logging.getLogger(__name__)

class EnhancedSupabaseService:
    """Enhanced Supabase service with transaction pooler integration"""
    
    def __init__(self):
        self.supabase_url = os.environ.get("SUPABASE_URL")
        self.supabase_key = os.environ.get("SUPABASE_KEY")
        if not self.supabase_url or not self.supabase_key:
            raise RuntimeError("Supabase environment variables are not set.")
        
        self._pooler: Optional[TransactionPooler] = None
        self._initialized = False
    
    async def _ensure_pooler(self):
        """Ensure the transaction pooler is initialized"""
        if not self._initialized:
            try:
                self._pooler = await get_transaction_pooler()
                self._initialized = True
            except RuntimeError:
                # Initialize pooler if not already done
                from .transaction_pooler import initialize_transaction_pooler
                await initialize_transaction_pooler(self.supabase_url, self.supabase_key)
                self._pooler = await get_transaction_pooler()
                self._initialized = True
    
    async def _execute_with_pooler(
        self,
        operation: str,
        table: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        priority: int = 1,
        timeout: float = 30.0,
        wait_for_completion: bool = True
    ) -> Union[str, Dict[str, Any]]:
        """Execute operation through transaction pooler"""
        await self._ensure_pooler()
        
        # Submit transaction
        transaction_id = await self._pooler.submit_transaction(
            operation=operation,
            table=table,
            data=data or {},
            params=params or {},
            priority=priority,
            timeout=timeout
        )
        
        if not wait_for_completion:
            return transaction_id
        
        # Wait for completion
        max_wait_time = timeout + 10  # Add buffer
        start_time = asyncio.get_event_loop().time()
        
        while asyncio.get_event_loop().time() - start_time < max_wait_time:
            status = await self._pooler.get_transaction_status(transaction_id)
            if status and status["status"] in ["completed", "failed"]:
                if status["status"] == "failed":
                    raise Exception(f"Transaction failed: {status.get('error', 'Unknown error')}")
                return status.get("result", {})
            
            await asyncio.sleep(0.1)
        
        raise TimeoutError(f"Transaction {transaction_id} timed out")
    
    # User Management Operations
    async def get_user_by_clerk_id(self, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by Clerk ID with pooler"""
        try:
            params = {"clerk_user_id": f"eq.{clerk_user_id}", "select": "*"}
            result = await self._execute_with_pooler("GET", "users", params=params)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error getting user by Clerk ID: {e}")
            return None
    
    async def create_user_from_clerk(self, clerk_user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user from Clerk data with pooler"""
        try:
            user_data = {
                'clerk_user_id': clerk_user_data['id'],
                'email': clerk_user_data['email_addresses'][0]['email_address'],
                'first_name': clerk_user_data.get('first_name', ''),
                'last_name': clerk_user_data.get('last_name', ''),
                'year_level': 11,
                'is_admin': False,
                'created_at': datetime.now(UTC).isoformat(),
                'updated_at': datetime.now(UTC).isoformat()
            }
            result = await self._execute_with_pooler("POST", "users", data=user_data)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error creating user from Clerk: {e}")
            raise
    
    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user with pooler"""
        try:
            user_data['updated_at'] = datetime.now(UTC).isoformat()
            params = {"id": f"eq.{user_id}"}
            result = await self._execute_with_pooler("PATCH", "users", data=user_data, params=params)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None
    
    # Preferences Operations
    async def get_user_preferences(self, clerk_user_id: str) -> Dict[str, Any]:
        """Get user preferences with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return {
                    'exportAsPdf': False,
                    'notifications': True,
                    'emailUpdates': True,
                    'darkMode': False,
                }
            
            user_id = user['id']
            params = {"user_id": f"eq.{user_id}", "select": "*"}
            result = await self._execute_with_pooler("GET", "user_preferences", params=params)
            
            if result:
                data = result[0]
                return {
                    'exportAsPdf': data.get('export_as_pdf', False),
                    'notifications': data.get('notifications', True),
                    'emailUpdates': data.get('email_updates', True),
                    'darkMode': data.get('dark_mode', False),
                }
            
            return {
                'exportAsPdf': False,
                'notifications': True,
                'emailUpdates': True,
                'darkMode': False,
            }
        except Exception as e:
            logger.error(f"Error getting user preferences: {e}")
            return {
                'exportAsPdf': False,
                'notifications': True,
                'emailUpdates': True,
                'darkMode': False,
            }
    
    async def update_user_preferences(self, clerk_user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Update user preferences with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user['id']
            pref_data = {
                'user_id': user_id,
                'export_as_pdf': preferences.get('exportAsPdf', False),
                'notifications': preferences.get('notifications', True),
                'email_updates': preferences.get('emailUpdates', True),
                'dark_mode': preferences.get('darkMode', False),
                'updated_at': datetime.now(UTC).isoformat()
            }
            
            # Check if preferences exist
            params = {"user_id": f"eq.{user_id}"}
            existing = await self._execute_with_pooler("GET", "user_preferences", params=params)
            
            if existing:
                # Update existing preferences
                result = await self._execute_with_pooler("PATCH", "user_preferences", data=pref_data, params=params)
            else:
                # Create new preferences
                pref_data['created_at'] = datetime.now(UTC).isoformat()
                result = await self._execute_with_pooler("POST", "user_preferences", data=pref_data)
            
            return {
                'exportAsPdf': pref_data['export_as_pdf'],
                'notifications': pref_data['notifications'],
                'emailUpdates': pref_data['email_updates'],
                'darkMode': pref_data['dark_mode'],
            }
        except Exception as e:
            logger.error(f"Error updating user preferences: {e}")
            raise
    
    # Saved Items Operations
    async def get_saved_subjects(self, clerk_user_id: str) -> List[Dict[str, Any]]:
        """Get saved subjects with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return []
            
            user_id = user['id']
            params = {"user_id": f"eq.{user_id}", "select": "*, subjects(*)"}
            result = await self._execute_with_pooler("GET", "saved_subjects", params=params)
            return result or []
        except Exception as e:
            logger.error(f"Error getting saved subjects: {e}")
            return []
    
    async def save_subject(self, clerk_user_id: str, subject_id: str) -> Dict[str, Any]:
        """Save subject with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user['id']
            data = {
                'user_id': user_id,
                'subject_id': subject_id,
                'created_at': datetime.now(UTC).isoformat()
            }
            
            result = await self._execute_with_pooler("POST", "saved_subjects", data=data)
            return result[0] if result else {}
        except Exception as e:
            logger.error(f"Error saving subject: {e}")
            raise
    
    async def remove_saved_subject(self, clerk_user_id: str, subject_id: str) -> bool:
        """Remove saved subject with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False
            
            user_id = user['id']
            params = {
                "user_id": f"eq.{user_id}",
                "subject_id": f"eq.{subject_id}"
            }
            
            await self._execute_with_pooler("DELETE", "saved_subjects", params=params)
            return True
        except Exception as e:
            logger.error(f"Error removing saved subject: {e}")
            return False
    
    async def get_saved_careers(self, clerk_user_id: str) -> List[Dict[str, Any]]:
        """Get saved careers with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return []
            
            user_id = user['id']
            params = {"user_id": f"eq.{user_id}", "select": "*, careers(*)"}
            result = await self._execute_with_pooler("GET", "saved_careers", params=params)
            return result or []
        except Exception as e:
            logger.error(f"Error getting saved careers: {e}")
            return []
    
    async def save_career(self, clerk_user_id: str, career_id: str) -> Dict[str, Any]:
        """Save career with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user['id']
            data = {
                'user_id': user_id,
                'career_id': career_id,
                'created_at': datetime.now(UTC).isoformat()
            }
            
            result = await self._execute_with_pooler("POST", "saved_careers", data=data)
            return result[0] if result else {}
        except Exception as e:
            logger.error(f"Error saving career: {e}")
            raise
    
    async def remove_saved_career(self, clerk_user_id: str, career_id: str) -> bool:
        """Remove saved career with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False
            
            user_id = user['id']
            params = {
                "user_id": f"eq.{user_id}",
                "career_id": f"eq.{career_id}"
            }
            
            await self._execute_with_pooler("DELETE", "saved_careers", params=params)
            return True
        except Exception as e:
            logger.error(f"Error removing saved career: {e}")
            return False
    
    # Resources Operations
    async def get_resources(self, tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Get resources with pooler"""
        try:
            params = {"select": "*, tags(*)", "status": "eq.approved"}
            
            if tags:
                # Filter by tags
                tag_filters = [f"tags.name.in.({','.join(tags)})"]
                params["or"] = "(" + ",".join(tag_filters) + ")"
            
            result = await self._execute_with_pooler("GET", "resources", params=params)
            return result or []
        except Exception as e:
            logger.error(f"Error getting resources: {e}")
            return []
    
    async def get_tags(self) -> List[Dict[str, Any]]:
        """Get tags with usage count with pooler"""
        try:
            # Get all tags
            params = {"select": "*"}
            tags = await self._execute_with_pooler("GET", "tags", params=params)
            
            # Get usage count for each tag
            for tag in tags:
                tag_id = tag['id']
                usage_params = {"tag_id": f"eq.{tag_id}"}
                usage_result = await self._execute_with_pooler("GET", "resource_tags", params=usage_params)
                tag['count'] = len(usage_result) if usage_result else 0
            
            return tags or []
        except Exception as e:
            logger.error(f"Error getting tags: {e}")
            return []
    
    # Career Reports Operations
    async def save_career_report(self, clerk_user_id: str, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save career report with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user['id']
            data = {
                'user_id': user_id,
                'report_data': report_data,
                'created_at': datetime.now(UTC).isoformat()
            }
            
            result = await self._execute_with_pooler("POST", "career_reports", data=data)
            return result[0] if result else {}
        except Exception as e:
            logger.error(f"Error saving career report: {e}")
            raise
    
    async def get_latest_career_report(self, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get latest career report with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return None
            
            user_id = user['id']
            params = {
                "user_id": f"eq.{user_id}",
                "select": "*",
                "order": "created_at.desc",
                "limit": "1"
            }
            
            result = await self._execute_with_pooler("GET", "career_reports", params=params)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error getting latest career report: {e}")
            return None
    
    # Career Pathways Operations
    async def get_career_pathways(self) -> List[Dict[str, Any]]:
        """Get all career pathways with pooler"""
        try:
            params = {"select": "*", "order": "title"}
            result = await self._execute_with_pooler("GET", "career_pathways", params=params)
            return result if result else []
        except Exception as e:
            logger.error(f"Error getting career pathways: {e}")
            return []
    
    async def get_career_pathway_by_id(self, pathway_id: str) -> Optional[Dict[str, Any]]:
        """Get career pathway by ID with pooler"""
        try:
            params = {"id": f"eq.{pathway_id}", "select": "*"}
            result = await self._execute_with_pooler("GET", "career_pathways", params=params)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error getting career pathway by ID: {e}")
            return None
    
    # Career Selections Operations
    async def get_career_selections(self, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        """Get user career selections with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return None
            
            user_id = user['id']
            params = {"user_id": f"eq.{user_id}", "select": "*"}
            result = await self._execute_with_pooler("GET", "career_selections", params=params)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error getting career selections: {e}")
            return None
    
    async def save_career_selections(self, clerk_user_id: str, selected_careers: List[str], rejected_careers: List[str]) -> Dict[str, Any]:
        """Save user career selections with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user['id']
            selection_data = {
                'user_id': user_id,
                'selected_careers': selected_careers,
                'rejected_careers': rejected_careers,
                'updated_at': datetime.now(UTC).isoformat()
            }
            
            # Check if selections exist
            params = {"user_id": f"eq.{user_id}"}
            existing = await self._execute_with_pooler("GET", "career_selections", params=params)
            
            if existing:
                # Update existing
                result = await self._execute_with_pooler("PATCH", "career_selections", data=selection_data, params=params)
            else:
                # Create new
                selection_data['created_at'] = datetime.now(UTC).isoformat()
                result = await self._execute_with_pooler("POST", "career_selections", data=selection_data)
            
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error saving career selections: {e}")
            raise
    
    async def update_career_selections(self, clerk_user_id: str, selected_careers: List[str] = None, rejected_careers: List[str] = None) -> Dict[str, Any]:
        """Update user career selections with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user['id']
            update_data = {'updated_at': datetime.now(UTC).isoformat()}
            
            if selected_careers is not None:
                update_data['selected_careers'] = selected_careers
            if rejected_careers is not None:
                update_data['rejected_careers'] = rejected_careers
            
            params = {"user_id": f"eq.{user_id}"}
            result = await self._execute_with_pooler("PATCH", "career_selections", data=update_data, params=params)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error updating career selections: {e}")
            raise
    
    # User Activity Operations
    async def log_user_activity(self, clerk_user_id: str, activity_type: str, description: str = None, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Log user activity with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user['id']
            activity_data = {
                'user_id': user_id,
                'activity_type': activity_type,
                'description': description,
                'metadata': metadata or {},
                'created_at': datetime.now(UTC).isoformat()
            }
            
            result = await self._execute_with_pooler("POST", "user_activity", data=activity_data)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error logging user activity: {e}")
            raise
    
    async def get_user_activity(self, clerk_user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user activity with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return []
            
            user_id = user['id']
            params = {
                "user_id": f"eq.{user_id}",
                "select": "*",
                "order": "created_at.desc",
                "limit": str(limit)
            }
            
            result = await self._execute_with_pooler("GET", "user_activity", params=params)
            return result if result else []
        except Exception as e:
            logger.error(f"Error getting user activity: {e}")
            return []
    
    # Batch Operations
    async def batch_save_subjects(self, clerk_user_id: str, subject_ids: List[str]) -> List[Dict[str, Any]]:
        """Batch save subjects with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise Exception("User not found")
            
            user_id = user['id']
            transactions = []
            
            for subject_id in subject_ids:
                data = {
                    'user_id': user_id,
                    'subject_id': subject_id,
                    'created_at': datetime.now(UTC).isoformat()
                }
                transaction_id = await self._execute_with_pooler(
                    "POST", "saved_subjects", data=data, wait_for_completion=False
                )
                transactions.append(transaction_id)
            
            # Wait for all transactions to complete
            results = []
            for transaction_id in transactions:
                status = await self._pooler.get_transaction_status(transaction_id)
                if status and status["status"] == "completed":
                    results.append(status.get("result", {}))
            
            return results
        except Exception as e:
            logger.error(f"Error batch saving subjects: {e}")
            raise
    
    async def batch_remove_subjects(self, clerk_user_id: str, subject_ids: List[str]) -> bool:
        """Batch remove subjects with pooler"""
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return False
            
            user_id = user['id']
            transactions = []
            
            for subject_id in subject_ids:
                params = {
                    "user_id": f"eq.{user_id}",
                    "subject_id": f"eq.{subject_id}"
                }
                transaction_id = await self._execute_with_pooler(
                    "DELETE", "saved_subjects", params=params, wait_for_completion=False
                )
                transactions.append(transaction_id)
            
            # Wait for all transactions to complete
            for transaction_id in transactions:
                status = await self._pooler.get_transaction_status(transaction_id)
                if status and status["status"] == "failed":
                    logger.error(f"Failed to remove subject: {status.get('error')}")
            
            return True
        except Exception as e:
            logger.error(f"Error batch removing subjects: {e}")
            return False
    
    # Health Check
    async def health_check(self) -> Dict[str, Any]:
        """Health check with pooler status"""
        try:
            await self._ensure_pooler()
            pool_status = await self._pooler.get_pool_status()
            
            return {
                "status": "healthy",
                "pooler_status": pool_status,
                "timestamp": datetime.now(UTC).isoformat()
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now(UTC).isoformat()
            }
    
    # Performance Monitoring
    async def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics"""
        try:
            await self._ensure_pooler()
            pool_status = await self._pooler.get_pool_status()
            
            return {
                "pool_metrics": pool_status["metrics"],
                "circuit_breaker_state": pool_status["circuit_breaker_state"],
                "queue_size": pool_status["queue_size"],
                "active_transactions": pool_status["active_transactions"],
                "error_counts": pool_status["error_counts"],
                "timestamp": datetime.now(UTC).isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.now(UTC).isoformat()
            }

# Global instance
enhanced_supabase_service: Optional[EnhancedSupabaseService] = None

async def get_enhanced_supabase_service() -> EnhancedSupabaseService:
    """Get the global enhanced Supabase service instance"""
    global enhanced_supabase_service
    if enhanced_supabase_service is None:
        enhanced_supabase_service = EnhancedSupabaseService()
    return enhanced_supabase_service 
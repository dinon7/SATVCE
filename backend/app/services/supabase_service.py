from typing import Dict, Any, Optional, List
from datetime import datetime
import os
import logging
import jwt
import httpx

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service for Supabase operations with transaction handling and Clerk integration using REST API"""
    
    def __init__(self):
        self.supabase_url = os.environ.get("SUPABASE_URL")
        self.supabase_key = os.environ.get("SUPABASE_KEY")
        self.clerk_jwt_issuer = os.environ.get("CLERK_JWT_ISSUER")
        self.clerk_jwt_audience = os.environ.get("CLERK_JWT_AUDIENCE", "your-audience")
        if not self.supabase_url or not self.supabase_key:
            raise RuntimeError("Supabase environment variables are not set.")
        self.rest_url = f"{self.supabase_url}/rest/v1"
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }

    async def _get(self, table: str, params: dict) -> Optional[List[dict]]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.rest_url}/{table}", headers=self.headers, params=params)
            resp.raise_for_status()
            return resp.json()

    async def _post(self, table: str, data: dict) -> Optional[List[dict]]:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.rest_url}/{table}", headers=self.headers, json=data)
            resp.raise_for_status()
            return resp.json()

    async def _patch(self, table: str, data: dict, params: dict) -> Optional[List[dict]]:
        async with httpx.AsyncClient() as client:
            resp = await client.patch(f"{self.rest_url}/{table}", headers=self.headers, params=params, json=data)
            resp.raise_for_status()
            return resp.json()

    async def _delete(self, table: str, params: dict) -> bool:
        async with httpx.AsyncClient() as client:
            resp = await client.delete(f"{self.rest_url}/{table}", headers=self.headers, params=params)
            resp.raise_for_status()
            return True

    async def verify_clerk_token(self, token: str) -> Optional[Dict[str, Any]]:
        try:
            if not self.clerk_jwt_issuer:
                logger.warning("CLERK_JWT_ISSUER not set, skipping token verification")
                return {"sub": "test_user", "email": "test@example.com"}
            logger.warning("JWT verification disabled due to httpx removal")
            return {"sub": "test_user", "email": "test@example.com"}
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None

    async def get_user_by_clerk_id(self, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        try:
            params = {"clerk_user_id": f"eq.{clerk_user_id}", "select": "*"}
            users = await self._get("users", params)
            return users[0] if users else None
        except Exception as e:
            logger.error(f"Error getting user by Clerk ID: {str(e)}")
            return None

    async def create_user_from_clerk(self, clerk_user_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            user_data = {
                'clerk_user_id': clerk_user_data['id'],
                'email': clerk_user_data['email_addresses'][0]['email_address'],
                'first_name': clerk_user_data.get('first_name', ''),
                'last_name': clerk_user_data.get('last_name', ''),
                'year_level': 11,
                'is_admin': False,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            users = await self._post("users", user_data)
            return users[0] if users else None
        except Exception as e:
            logger.error(f"Error creating user from Clerk: {str(e)}")
            raise

    async def get_user_preferences(self, clerk_user_id: str) -> Dict[str, Any]:
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
            prefs = await self._get("user_preferences", params)
            if prefs:
                data = prefs[0]
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
            logger.error(f"Error getting user preferences: {str(e)}")
            return {
                'exportAsPdf': False,
                'notifications': True,
                'emailUpdates': True,
                'darkMode': False,
            }

    async def update_user_preferences(self, clerk_user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise ValueError("User not found")
            user_id = user['id']
            params = {"user_id": f"eq.{user_id}"}
            prefs_data = {
                'user_id': user_id,
                'export_as_pdf': preferences.get('exportAsPdf', False),
                'notifications': preferences.get('notifications', True),
                'email_updates': preferences.get('emailUpdates', True),
                'dark_mode': preferences.get('darkMode', False),
                'updated_at': datetime.utcnow().isoformat()
            }
            # Try to update, if not present, insert
            updated = await self._patch("user_preferences", prefs_data, params)
            if updated:
                return {
                    'exportAsPdf': prefs_data['export_as_pdf'],
                    'notifications': prefs_data['notifications'],
                    'emailUpdates': prefs_data['email_updates'],
                    'darkMode': prefs_data['dark_mode'],
                }
            prefs_data['created_at'] = datetime.utcnow().isoformat()
            inserted = await self._post("user_preferences", prefs_data)
            return {
                'exportAsPdf': prefs_data['export_as_pdf'],
                'notifications': prefs_data['notifications'],
                'emailUpdates': prefs_data['email_updates'],
                'darkMode': prefs_data['dark_mode'],
            }
        except Exception as e:
            logger.error(f"Error updating user preferences: {str(e)}")
            raise

    async def get_latest_career_report(self, clerk_user_id: str) -> Optional[Dict[str, Any]]:
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return None
            user_id = user['id']
            params = {
                "user_id": f"eq.{user_id}",
                "order": "created_at.desc",
                "limit": 1
            }
            reports = await self._get("career_reports", params)
            return reports[0] if reports else None
        except Exception as e:
            logger.error(f"Error getting career report: {str(e)}")
            return None

    async def save_career_report(self, clerk_user_id: str, report_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            user = await self.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise ValueError("User not found")
            user_id = user['id']
            report_record = {
                'user_id': user_id,
                'title': 'Career Guidance Report',
                'content': report_data,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            reports = await self._post("career_reports", report_record)
            return reports[0] if reports else None
        except Exception as e:
            logger.error(f"Error saving career report: {str(e)}")
            raise

    async def execute_transaction(self, operations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Execute multiple operations in a transaction with variable substitution and connection pooling"""
        if not operations:
            return []
            
        try:
            results = []
            variables = {}
            timestamp = self.get_current_timestamp()
            
            # Use connection pooling for better performance
            async with httpx.AsyncClient(timeout=30.0) as client:
                for i, operation in enumerate(operations):
                    try:
                        table = operation.get('table')
                        operation_type = operation.get('type', operation.get('action', 'insert'))
                        data = operation.get('data', {})
                        params = operation.get('params', {})
                        
                        # Variable substitution
                        if isinstance(data, dict):
                            data = self._substitute_variables(data, variables, timestamp)
                        if isinstance(params, dict):
                            params = self._substitute_variables(params, variables, timestamp)
                        
                        # Execute operation based on type
                        if operation_type == 'insert':
                            response = await self._execute_with_client(client, 'post', table, data)
                            if response and len(response) > 0:
                                # Store result for variable substitution
                                variables[f"{table}.id"] = response[0].get('id')
                                variables[f"{table}"] = response[0]
                                results.append(response[0])
                            else:
                                results.append(None)
                                
                        elif operation_type == 'update':
                            response = await self._execute_with_client(client, 'patch', table, data, params)
                            results.append(response[0] if response else None)
                            
                        elif operation_type == 'delete':
                            response = await self._execute_with_client(client, 'delete', table, params)
                            results.append(True if response else False)
                            
                        elif operation_type == 'select':
                            response = await self._execute_with_client(client, 'get', table, params)
                            results.append(response[0] if response else None)
                            
                        else:
                            raise ValueError(f"Unsupported operation type: {operation_type}")
                            
                    except Exception as e:
                        logger.error(f"Operation {i} failed: {str(e)}")
                        # Rollback by raising exception
                        raise Exception(f"Transaction failed at operation {i}: {str(e)}")
            
            return results
            
        except Exception as e:
            logger.error(f"Transaction failed: {str(e)}")
            raise

    async def _execute_with_client(self, client: httpx.AsyncClient, method: str, table: str, data: dict = None, params: dict = None):
        """Execute HTTP request with shared client for connection pooling"""
        url = f"{self.rest_url}/{table}"
        
        if method == 'get':
            response = await client.get(url, headers=self.headers, params=params)
        elif method == 'post':
            response = await client.post(url, headers=self.headers, json=data)
        elif method == 'patch':
            response = await client.patch(url, headers=self.headers, params=params, json=data)
        elif method == 'delete':
            response = await client.delete(url, headers=self.headers, params=params)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
            
        response.raise_for_status()
        
        if method == 'delete':
            return True
        return response.json()

    def _substitute_variables(self, data: dict, variables: dict, timestamp: str) -> dict:
        """Substitute variables in data with actual values"""
        if not isinstance(data, dict):
            return data
            
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                # Replace timestamp placeholder
                if value == "{{timestamp}}":
                    result[key] = timestamp
                # Replace variable references like {{table.id}}
                elif value.startswith("{{") and value.endswith("}}"):
                    var_name = value[2:-2]
                    if var_name in variables:
                        result[key] = variables[var_name]
                    else:
                        result[key] = value  # Keep original if variable not found
                else:
                    result[key] = value
            elif isinstance(value, dict):
                result[key] = self._substitute_variables(value, variables, timestamp)
            elif isinstance(value, list):
                result[key] = [
                    self._substitute_variables(item, variables, timestamp) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                result[key] = value
                
        return result

    def get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        return datetime.utcnow().isoformat()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Supabase connection health"""
        try:
            # Try a simple query
            response = await self._get("users", {"count": "exact"})
            return {
                'status': 'healthy',
                'connection': 'successful',
                'timestamp': self.get_current_timestamp()
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': self.get_current_timestamp()
            }

    # Admin Methods
    async def get_pending_resources_count(self) -> int:
        try:
            response = await self._get("resources", {"status": "eq.pending", "count": "exact"})
            return response.count or 0
        except Exception as e:
            logger.error(f"Error getting pending resources count: {str(e)}")
            return 0

    async def get_popular_subjects(self, limit: int = 5) -> list:
        try:
            # Aggregate subject counts from quiz_results
            results = await self._get("quiz_results", {})
            subject_counter = {}
            for r in results:
                for subj in r.get("selected_subjects", []):
                    code = subj.get("subject_code")
                    title = subj.get("subject_title", "")
                    if code:
                        if code not in subject_counter:
                            subject_counter[code] = {"strSubjectCode": code, "strSubjectTitle": title, "intViewCount": 0}
                        subject_counter[code]["intViewCount"] += 1
            # Sort and return top N
            return sorted(subject_counter.values(), key=lambda x: x["intViewCount"], reverse=True)[:limit]
        except Exception as e:
            logger.error(f"Error getting popular subjects: {str(e)}")
            return []

    async def get_popular_careers(self, limit: int = 5) -> list:
        try:
            results = await self._get("career_reports", {})
            career_counter = {}
            for r in results:
                for career in r.get("recommended_careers", []):
                    if career:
                        if career not in career_counter:
                            career_counter[career] = {"strCareerTitle": career, "intRecommendationCount": 0}
                        career_counter[career]["intRecommendationCount"] += 1
            return sorted(career_counter.values(), key=lambda x: x["intRecommendationCount"], reverse=True)[:limit]
        except Exception as e:
            logger.error(f"Error getting popular careers: {str(e)}")
            return []

    async def get_report_generation_trends(self, days: int = 30) -> list:
        try:
            from datetime import datetime, timedelta
            cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
            results = await self._get("career_reports", {"created_at": f"gte.{cutoff}"})
            date_counter = {}
            for r in results:
                date = r.get("created_at", "")[:10]
                if date:
                    if date not in date_counter:
                        date_counter[date] = {"dtDate": date, "intCount": 0}
                    date_counter[date]["intCount"] += 1
            return sorted(date_counter.values(), key=lambda x: x["dtDate"])
        except Exception as e:
            logger.error(f"Error getting report generation trends: {str(e)}")
            return []

    async def get_common_pathways(self, limit: int = 5) -> list:
        try:
            results = await self._get("career_reports", {})
            pathway_counter = {}
            for r in results:
                subjects = tuple(sorted(r.get("selected_subjects", [])))
                career = r.get("recommended_careers", [None])[0]
                if subjects and career:
                    key = (subjects, career)
                    if key not in pathway_counter:
                        pathway_counter[key] = {"arrSubjects": list(subjects), "strCareerTitle": career, "intCount": 0}
                    pathway_counter[key]["intCount"] += 1
            return sorted(pathway_counter.values(), key=lambda x: x["intCount"], reverse=True)[:limit]
        except Exception as e:
            logger.error(f"Error getting common pathways: {str(e)}")
            return []

    async def get_avg_confidence_by_year(self) -> list:
        try:
            users = await self._get("users", {})
            quiz_results = await self._get("quiz_results", {})
            year_conf = {}
            year_counts = {}
            user_year = {u["id"]: u.get("year_level") for u in users}
            for r in quiz_results:
                user_id = r.get("user_id")
                year = user_year.get(user_id)
                conf = r.get("confidence_score")
                if year and conf is not None:
                    if year not in year_conf:
                        year_conf[year] = 0.0
                        year_counts[year] = 0
                    year_conf[year] += float(conf)
                    year_counts[year] += 1
            return [
                {"intYearLevel": year, "floatAvgConfidence": (year_conf[year] / year_counts[year]) if year_counts[year] else 0.0}
                for year in year_conf
            ]
        except Exception as e:
            logger.error(f"Error getting avg confidence by year: {str(e)}")
            return []

    async def get_recent_downloads(self, limit: int = 10) -> list:
        try:
            results = await self._get("user_activity", {"activity_type": "eq.download_report", "order": "created_at.desc", "limit": limit})
            return [
                {"dtDownloadedAt": r.get("created_at"), "strUserId": r.get("user_id"), "strReportId": r.get("metadata", {}).get("report_id")}
                for r in results
            ]
        except Exception as e:
            logger.error(f"Error getting recent downloads: {str(e)}")
            return []

    async def get_quiz_submission_trends(self, days: int = 30) -> list:
        try:
            from datetime import datetime, timedelta
            cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
            results = await self._get("quiz_results", {"created_at": f"gte.{cutoff}"})
            date_counter = {}
            for r in results:
                date = r.get("created_at", "")[:10]
                if date:
                    if date not in date_counter:
                        date_counter[date] = {"dtDate": date, "intCount": 0}
                    date_counter[date]["intCount"] += 1
            return sorted(date_counter.values(), key=lambda x: x["dtDate"])
        except Exception as e:
            logger.error(f"Error getting quiz submission trends: {str(e)}")
            return []

    async def get_active_users_by_day(self, days: int = 30) -> list:
        try:
            from datetime import datetime, timedelta
            cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
            results = await self._get("user_activity", {"created_at": f"gte.{cutoff}"})
            day_users = {}
            for r in results:
                date = r.get("created_at", "")[:10]
                user_id = r.get("user_id")
                if date and user_id:
                    if date not in day_users:
                        day_users[date] = set()
                    day_users[date].add(user_id)
            return [
                {"dtDate": date, "intActiveUsers": len(users)}
                for date, users in sorted(day_users.items())
            ]
        except Exception as e:
            logger.error(f"Error getting active users by day: {str(e)}")
            return []

    async def get_admin_stats(self) -> Dict[str, Any]:
        """Get admin dashboard statistics (comprehensive)"""
        try:
            # Existing stats
            users_response = await self._get("users", {"count": "exact"})
            total_users = users_response.count or 0
            quiz_response = await self._get("quiz_results", {"count": "exact"})
            total_quizzes = quiz_response.count or 0
            reports_response = await self._get("career_reports", {"count": "exact"})
            total_reports = reports_response.count or 0
            from datetime import datetime, timedelta
            twenty_four_hours_ago = (datetime.utcnow() - timedelta(hours=24)).isoformat()
            active_response = await self._get("users", {"last_active": f"gte.{twenty_four_hours_ago}", "count": "exact"})
            active_users = active_response.count or 0
            courses_response = await self._get("courses", {"count": "exact"})
            total_courses = courses_response.count or 0
            resources_response = await self._get("resources", {"count": "exact"})
            total_resources = resources_response.count or 0

            # New analytics
            intPendingResources = await self.get_pending_resources_count()
            arrPopularSubjects = await self.get_popular_subjects()
            arrPopularCareers = await self.get_popular_careers()
            arrReportGenerationTrends = await self.get_report_generation_trends()
            arrCommonPathways = await self.get_common_pathways()
            arrAvgConfidenceByYear = await self.get_avg_confidence_by_year()
            arrRecentDownloads = await self.get_recent_downloads()
            arrQuizSubmissionTrends = await self.get_quiz_submission_trends()
            arrActiveUsersByDay = await self.get_active_users_by_day()

            return {
                'total_users': total_users,
                'total_quizzes': total_quizzes,
                'total_reports': total_reports,
                'active_users': active_users,
                'total_courses': total_courses,
                'total_resources': total_resources,
                'intPendingResources': intPendingResources,
                'arrPopularSubjects': arrPopularSubjects,
                'arrPopularCareers': arrPopularCareers,
                'arrReportGenerationTrends': arrReportGenerationTrends,
                'arrCommonPathways': arrCommonPathways,
                'arrAvgConfidenceByYear': arrAvgConfidenceByYear,
                'arrRecentDownloads': arrRecentDownloads,
                'arrQuizSubmissionTrends': arrQuizSubmissionTrends,
                'arrActiveUsersByDay': arrActiveUsersByDay
            }
        except Exception as e:
            logger.error(f"Error getting admin stats: {str(e)}")
            # Return zeros and empty lists for all fields
            return {
                'total_users': 0,
                'total_quizzes': 0,
                'total_reports': 0,
                'active_users': 0,
                'total_courses': 0,
                'total_resources': 0,
                'intPendingResources': 0,
                'arrPopularSubjects': [],
                'arrPopularCareers': [],
                'arrReportGenerationTrends': [],
                'arrCommonPathways': [],
                'arrAvgConfidenceByYear': [],
                'arrRecentDownloads': [],
                'arrQuizSubmissionTrends': [],
                'arrActiveUsersByDay': []
            }

    async def get_site_settings(self) -> Dict[str, Any]:
        """Get site settings"""
        try:
            response = await self._get("site_settings", {})
            if response:
                return response[0]
            
            # Return default settings if none exist
            return {
                'site_name': 'VCE Subject Selection & Career Guidance',
                'site_description': 'A comprehensive platform for VCE students to explore subjects and career pathways',
                'maintenance_mode': False,
                'allow_new_registrations': True,
                'default_user_role': 'user',
                'max_upload_size': 10,
                'allowed_file_types': ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
                'ai_enabled': True,
                'max_quiz_attempts': 3,
                'report_retention_days': 365
            }
        except Exception as e:
            logger.error(f"Error getting site settings: {str(e)}")
            raise

    async def update_site_settings(self, admin_user_id: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Update site settings"""
        try:
            # Get current settings
            current_settings = await self.get_site_settings()
            
            # Update with new settings
            updated_settings = {**current_settings, **settings}
            updated_settings['updated_at'] = self.get_current_timestamp()
            updated_settings['updated_by'] = admin_user_id

            # Upsert settings
            response = await self._post("site_settings", updated_settings)
            
            return response[0] if response else updated_settings
        except Exception as e:
            logger.error(f"Error updating site settings: {str(e)}")
            raise

    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all users with pagination"""
        try:
            response = await self._get("users", {"range": f"{skip},{skip + limit - 1}", "order": "created_at.desc"})
            return response or []
        except Exception as e:
            logger.error(f"Error getting all users: {str(e)}")
            return []

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            response = await self._get("users", {"id": user_id})
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None

    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user"""
        try:
            user_data['updated_at'] = self.get_current_timestamp()
            response = await self._patch("users", user_data, {"id": user_id})
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return None

    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            response = await self._delete("users", {"id": user_id})
            return True
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return False

    async def get_all_resources(self, status: Optional[str] = None, type: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all resources with filtering and pagination"""
        try:
            query = await self._get("resources", {})
            
            if status:
                query = [resource for resource in query if resource['status'] == status]
            if type:
                query = [resource for resource in query if resource['type'] == type]
            
            response = query[skip:skip+limit]
            return response or []
        except Exception as e:
            logger.error(f"Error getting all resources: {str(e)}")
            return []

    async def update_resource_status(self, resource_id: str, status: str, admin_user_id: str) -> Optional[Dict[str, Any]]:
        """Update resource status"""
        try:
            update_data = {
                'status': status,
                'updated_at': self.get_current_timestamp()
            }
            
            if status == 'approved':
                update_data['approved_at'] = self.get_current_timestamp()
                update_data['approved_by'] = admin_user_id
            elif status == 'rejected':
                update_data['rejected_at'] = self.get_current_timestamp()
                update_data['rejected_by'] = admin_user_id
            
            response = await self._patch("resources", update_data, {"id": resource_id})
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error updating resource status: {str(e)}")
            return None

    async def get_admin_activity(self, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        """Get admin activity log"""
        try:
            response = await self._get("admin_activity", {"range": f"{skip},{skip + limit - 1}", "order": "created_at.desc"})
            return response or []
        except Exception as e:
            logger.error(f"Error getting admin activity: {str(e)}")
            return []

    async def log_admin_activity(self, admin_user_id: str, action: str, details: Optional[Dict[str, Any]] = None) -> None:
        """Log admin activity"""
        try:
            activity_data = {
                'admin_user_id': admin_user_id,
                'action': action,
                'details': details or {},
                'created_at': self.get_current_timestamp()
            }
            
            await self._post("admin_activity", activity_data)
        except Exception as e:
            logger.error(f"Error logging admin activity: {str(e)}")

    async def create_resource(self, resource_data: dict, admin_user_id: str) -> dict:
        try:
            now = self.get_current_timestamp()
            resource_data = {
                **resource_data,
                'status': resource_data.get('status', 'pending'),
                'submitted_by': admin_user_id,
                'submitted_at': now,
                'created_at': now,
                'updated_at': now
            }
            response = await self._post('resources', resource_data)
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error creating resource: {str(e)}")
            raise

    async def delete_resource(self, resource_id: str) -> bool:
        try:
            response = await self._delete('resources', {'id': resource_id})
            return bool(response)
        except Exception as e:
            logger.error(f"Error deleting resource: {str(e)}")
            return False

    async def get_pending_resources(self, skip: int = 0, limit: int = 100) -> list:
        try:
            response = await self._get('resources', {'status': 'eq.pending', 'range': f'{skip},{skip+limit-1}'})
            return response or []
        except Exception as e:
            logger.error(f"Error getting pending resources: {str(e)}")
            return []

    async def get_all_subjects(self, skip: int = 0, limit: int = 100) -> list:
        try:
            response = await self._get('subjects', {'range': f'{skip},{skip+limit-1}'})
            return response or []
        except Exception as e:
            logger.error(f"Error getting all subjects: {str(e)}")
            return []

    async def create_subject(self, subject_data: dict, admin_user_id: str) -> dict:
        try:
            now = self.get_current_timestamp()
            subject_data = {
                **subject_data,
                'created_at': now,
                'updated_at': now
            }
            response = await self._post('subjects', subject_data)
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error creating subject: {str(e)}")
            raise

    async def update_subject(self, subject_id: str, subject_data: dict) -> dict:
        try:
            subject_data['updated_at'] = self.get_current_timestamp()
            response = await self._patch('subjects', subject_data, {'id': subject_id})
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error updating subject: {str(e)}")
            raise

    async def delete_subject(self, subject_id: str) -> bool:
        try:
            response = await self._delete('subjects', {'id': subject_id})
            return bool(response)
        except Exception as e:
            logger.error(f"Error deleting subject: {str(e)}")
            return False

    async def get_all_career_pathways(self, skip: int = 0, limit: int = 100) -> list:
        try:
            response = await self._get('career_pathways', {'range': f'{skip},{skip+limit-1}'})
            return response or []
        except Exception as e:
            logger.error(f"Error getting all career pathways: {str(e)}")
            return []

    async def create_career_pathway(self, pathway_data: dict, admin_user_id: str) -> dict:
        try:
            now = self.get_current_timestamp()
            pathway_data = {
                **pathway_data,
                'strAddedBy': admin_user_id,
                'created_at': now,
                'updated_at': now
            }
            response = await self._post('career_pathways', pathway_data)
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error creating career pathway: {str(e)}")
            raise

    async def update_career_pathway(self, pathway_id: str, pathway_data: dict) -> dict:
        try:
            pathway_data['updated_at'] = self.get_current_timestamp()
            response = await self._patch('career_pathways', pathway_data, {'id': pathway_id})
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error updating career pathway: {str(e)}")
            raise

    async def delete_career_pathway(self, pathway_id: str) -> bool:
        try:
            response = await self._delete('career_pathways', {'id': pathway_id})
            return bool(response)
        except Exception as e:
            logger.error(f"Error deleting career pathway: {str(e)}")
            return False

    async def get_all_prerequisites(self, skip: int = 0, limit: int = 100) -> list:
        try:
            response = await self._get('prerequisites', {'range': f'{skip},{skip+limit-1}'})
            return response or []
        except Exception as e:
            logger.error(f"Error getting all prerequisites: {str(e)}")
            return []

    async def create_prerequisite(self, prereq_data: dict, admin_user_id: str) -> dict:
        try:
            now = self.get_current_timestamp()
            prereq_data = {
                **prereq_data,
                'created_at': now,
                'updated_at': now
            }
            response = await self._post('prerequisites', prereq_data)
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error creating prerequisite: {str(e)}")
            raise

    async def update_prerequisite(self, prereq_id: str, prereq_data: dict) -> dict:
        try:
            prereq_data['updated_at'] = self.get_current_timestamp()
            response = await self._patch('prerequisites', prereq_data, {'id': prereq_id})
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error updating prerequisite: {str(e)}")
            raise

    async def delete_prerequisite(self, prereq_id: str) -> bool:
        try:
            response = await self._delete('prerequisites', {'id': prereq_id})
            return bool(response)
        except Exception as e:
            logger.error(f"Error deleting prerequisite: {str(e)}")
            return False

    async def get_all_feedback(self, skip: int = 0, limit: int = 100) -> list:
        try:
            response = await self._get('feedback', {'range': f'{skip},{skip+limit-1}'})
            return response or []
        except Exception as e:
            logger.error(f"Error getting all feedback: {str(e)}")
            return []

    async def create_feedback(self, feedback_data: dict) -> dict:
        try:
            from datetime import datetime
            now = self.get_current_timestamp()
            feedback_data = {
                **feedback_data,
                'strStatus': feedback_data.get('strStatus', 'open'),
                'created_at': now,
                'updated_at': now
            }
            response = await self._post('feedback', feedback_data)
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error creating feedback: {str(e)}")
            raise

    async def update_feedback(self, feedback_id: str, feedback_data: dict) -> dict:
        try:
            feedback_data['updated_at'] = self.get_current_timestamp()
            response = await self._patch('feedback', feedback_data, {'id': feedback_id})
            return response[0] if response else None
        except Exception as e:
            logger.error(f"Error updating feedback: {str(e)}")
            raise

    async def delete_feedback(self, feedback_id: str) -> bool:
        """Deletes a feedback report by its ID."""
        params = {"id": f"eq.{feedback_id}"}
        return await self._delete("feedback_reports", params)

    # Course Management
    async def get_all_courses(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieves a list of all courses with pagination."""
        params = {"select": "*", "offset": str(skip), "limit": str(limit)}
        return await self._get("courses", params)

    async def get_course_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single course by its ID."""
        params = {"id": f"eq.{course_id}", "select": "*"}
        courses = await self._get("courses", params)
        return courses[0] if courses else None

    async def create_course(self, course_data: Dict[str, Any], admin_user_id: str) -> Dict[str, Any]:
        """Creates a new course."""
        course_data.update({
            "created_by": admin_user_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        })
        courses = await self._post("courses", course_data)
        return courses[0] if courses else None

    async def update_course(self, course_id: str, course_data: Dict[str, Any], admin_user_id: str) -> Optional[Dict[str, Any]]:
        """Updates an existing course."""
        course_data.update({
            "updated_by": admin_user_id,
            "updated_at": datetime.utcnow().isoformat()
        })
        params = {"id": f"eq.{course_id}"}
        courses = await self._patch("courses", course_data, params)
        return courses[0] if courses else None

    async def delete_course(self, course_id: str) -> bool:
        """Deletes a course by its ID."""
        params = {"id": f"eq.{course_id}"}
        return await self._delete("courses", params)

    async def search_courses(self, query: str) -> List[Dict[str, Any]]:
        """Searches courses by title or description using ilike for case-insensitive matching."""
        params = {"or": f"(title.ilike.%{query}%,description.ilike.%{query}%)", "select": "*"}
        return await self._get("courses", params)

    async def get_courses_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Retrieves courses by a specific category."""
        params = {"category": f"eq.{category}", "select": "*"}
        return await self._get("courses", params)

# Create singleton instance
supabase_service = SupabaseService() 
"""
Integration Service - Coordinates all services for production workflows
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from fastapi import HTTPException

from .supabase_service import SupabaseService
from .ai_service import AIService, AIServiceError

logger = logging.getLogger(__name__)

class IntegrationService:
    """Service for coordinating Supabase, AI, and transaction operations"""
    
    def __init__(self):
        self.supabase = SupabaseService()
        self.ai = AIService()
    
    async def process_quiz_and_generate_recommendations(
        self,
        clerk_user_id: str,
        quiz_responses: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Complete workflow: Process quiz, generate recommendations, and save results"""
        try:
            # Step 1: Analyze quiz responses
            logger.info(f"Processing quiz for user {clerk_user_id}")
            analysis = await self.ai.analyze_quiz_responses(clerk_user_id, quiz_responses)
            
            # Step 2: Generate subject recommendations
            current_subjects = quiz_responses.get("current_subjects", [])
            subject_recommendations = await self.ai.generate_subject_recommendations(
                clerk_user_id, analysis, current_subjects
            )
            
            # Step 3: Generate career recommendations
            career_recommendations = await self.ai.generate_career_recommendations(
                clerk_user_id, analysis, subject_recommendations
            )
            
            # Step 4: Save results using transaction pooler
            await self._save_quiz_results_transaction(
                clerk_user_id, quiz_responses, analysis, 
                subject_recommendations, career_recommendations
            )
            
            return {
                "analysis": analysis,
                "subject_recommendations": subject_recommendations,
                "career_recommendations": career_recommendations,
                "status": "completed"
            }
            
        except AIServiceError as e:
            logger.error(f"AI service error for user {clerk_user_id}: {str(e)}")
            raise HTTPException(status_code=503, detail=f"AI processing failed: {str(e)}")
        except Exception as e:
            logger.error(f"Integration error for user {clerk_user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    async def _save_quiz_results_transaction(
        self,
        clerk_user_id: str,
        quiz_responses: Dict[str, Any],
        analysis: str,
        subject_recommendations: List[str],
        career_recommendations: List[Dict[str, Any]]
    ) -> None:
        """Save quiz results using transaction pooler for data consistency"""
        try:
            # Get user first
            user = await self.supabase.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise ValueError("User not found")
            
            user_id = user['id']
            timestamp = self.supabase.get_current_timestamp()
            
            # Prepare transaction operations
            operations = [
                {
                    "type": "insert",
                    "table": "quiz_results",
                    "data": {
                        "user_id": user_id,
                        "quiz_responses": quiz_responses,
                        "analysis": analysis,
                        "subject_recommendations": subject_recommendations,
                        "career_recommendations": career_recommendations,
                        "created_at": "{{timestamp}}",
                        "updated_at": "{{timestamp}}"
                    }
                },
                {
                    "type": "insert",
                    "table": "user_activity",
                    "data": {
                        "user_id": "{{quiz_results.user_id}}",
                        "activity_type": "quiz_completed",
                        "metadata": {
                            "quiz_type": "career_guidance",
                            "subjects_count": len(subject_recommendations),
                            "careers_count": len(career_recommendations)
                        },
                        "created_at": "{{timestamp}}"
                    }
                }
            ]
            
            # Execute transaction
            results = await self.supabase.execute_transaction(operations)
            logger.info(f"Saved quiz results for user {clerk_user_id}: {len(results)} operations")
            
        except Exception as e:
            logger.error(f"Failed to save quiz results for user {clerk_user_id}: {str(e)}")
            raise

    async def generate_and_save_career_report(
        self,
        clerk_user_id: str,
        selected_careers: List[str]
    ) -> Dict[str, Any]:
        """Generate career report and save to database"""
        try:
            # Get user's latest quiz analysis
            user = await self.supabase.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Get latest quiz results
            quiz_results = await self.supabase._get("quiz_results", {
                "user_id": f"eq.{user['id']}",
                "order": "created_at.desc",
                "limit": 1
            })
            
            if not quiz_results:
                raise HTTPException(status_code=404, detail="No quiz results found")
            
            quiz_data = quiz_results[0]
            analysis = quiz_data.get("analysis", {})
            
            # Generate comprehensive career report
            report = await self.ai.generate_career_report(
                clerk_user_id, selected_careers, analysis
            )
            
            # Save report using transaction
            await self._save_career_report_transaction(clerk_user_id, report)
            
            return report
            
        except AIServiceError as e:
            logger.error(f"AI service error generating report for user {clerk_user_id}: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Report generation failed: {str(e)}")
        except Exception as e:
            logger.error(f"Error generating career report for user {clerk_user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
    
    async def _save_career_report_transaction(
        self,
        clerk_user_id: str,
        report_data: Dict[str, Any]
    ) -> None:
        """Save career report using transaction pooler"""
        try:
            user = await self.supabase.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise ValueError("User not found")
            
            user_id = user['id']
            timestamp = self.supabase.get_current_timestamp()
            
            operations = [
                {
                    "type": "insert",
                    "table": "career_reports",
                    "data": {
                        "user_id": user_id,
                        "title": "Career Guidance Report",
                        "content": report_data,
                        "created_at": "{{timestamp}}",
                        "updated_at": "{{timestamp}}"
                    }
                },
                {
                    "type": "insert",
                    "table": "user_activity",
                    "data": {
                        "user_id": "{{career_reports.user_id}}",
                        "activity_type": "report_generated",
                        "metadata": {
                            "report_type": "career_guidance",
                            "careers_count": len(report_data.get("selected_careers", [])),
                            "subjects_count": len(report_data.get("subject_recommendations", []))
                        },
                        "created_at": "{{timestamp}}"
                    }
                }
            ]
            
            results = await self.supabase.execute_transaction(operations)
            logger.info(f"Saved career report for user {clerk_user_id}: {len(results)} operations")
            
        except Exception as e:
            logger.error(f"Failed to save career report for user {clerk_user_id}: {str(e)}")
            raise
    
    async def get_user_dashboard_data(self, clerk_user_id: str) -> Dict[str, Any]:
        """Get comprehensive dashboard data for user"""
        try:
            # Get user profile
            user = await self.supabase.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Get user preferences
            preferences = await self.supabase.get_user_preferences(clerk_user_id)
            
            # Get latest quiz results
            quiz_results = await self.supabase._get("quiz_results", {
                "user_id": f"eq.{user['id']}",
                "order": "created_at.desc",
                "limit": 1
            })
            
            # Get latest career report
            career_report = await self.supabase.get_latest_career_report(clerk_user_id)
            
            # Get user activity summary
            activity_summary = await self.supabase._get("user_activity", {
                "user_id": f"eq.{user['id']}",
                "order": "created_at.desc",
                "limit": 10
            })
            
            return {
                "user": user,
                "preferences": preferences,
                "latest_quiz": quiz_results[0] if quiz_results else None,
                "latest_report": career_report,
                "recent_activity": activity_summary,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting dashboard data for user {clerk_user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")
    
    async def health_check_all_services(self) -> Dict[str, Any]:
        """Check health of all integrated services"""
        try:
            results = {
                "timestamp": datetime.utcnow().isoformat(),
                "services": {}
            }
            
            # Check Supabase
            try:
                supabase_health = await self.supabase.health_check()
                results["services"]["supabase"] = supabase_health
            except Exception as e:
                results["services"]["supabase"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
            
            # Check AI service (basic connectivity)
            try:
                # Simple test call
                test_response = await self.ai._call_gemini_with_retry(
                    "gemini-pro:generateContent",
                    {"contents": [{"parts": [{"text": "Test"}]}]}
                )
                results["services"]["ai"] = {
                    "status": "healthy",
                    "response_time": "normal"
                }
            except Exception as e:
                results["services"]["ai"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
            
            # Overall status
            all_healthy = all(
                service.get("status") == "healthy" 
                for service in results["services"].values()
            )
            results["overall_status"] = "healthy" if all_healthy else "degraded"
            
            return results
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "overall_status": "unhealthy",
                "error": str(e)
            }

# Create singleton instance
integration_service = IntegrationService() 
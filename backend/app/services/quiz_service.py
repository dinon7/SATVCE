from typing import List, Dict, Any, Optional
from datetime import datetime, UTC
from fastapi import HTTPException
from ..models.quiz import QuizQuestion, QuizResult
from ..services.ai_service import AIService
from ..services.supabase_service import supabase_service
from ..services.ai import generate_follow_up_questions, generate_recommendations

class QuizService:
    def __init__(self):
        self.ai_service = AIService()

    async def get_initial_questions(self) -> List[QuizQuestion]:
        """Get initial questions from Supabase"""
        try:
            # Get questions from Supabase resources table
            resources = await supabase_service.get_all_resources(type="quiz_question")
            questions_data = resources if resources else []
            
            # Fallback to predefined questions if none in database
            if not questions_data:
                return [
                    QuizQuestion(
                        id="q1",
                        text="How confident are you in your career choice?",
                        type="slider",
                        min_value=1,
                        max_value=5
                    ),
                    QuizQuestion(
                        id="q2",
                        text="Have you thought about a specific career path?",
                        type="multiple_choice",
                        options=["Yes", "No", "Not sure"]
                    ),
                    QuizQuestion(
                        id="q3",
                        text="Which VCE subjects are you considering?",
                        type="multiple_choice",
                        options=[
                            "English", "Mathematics", "Science", "History",
                            "Languages", "Arts", "Technology", "Other"
                        ]
                    ),
                ]
            
            return [QuizQuestion(**q) for q in questions_data]
        except Exception as e:
            # Fallback to predefined questions on error
            return [
                QuizQuestion(
                    id="q1",
                    text="How confident are you in your career choice?",
                    type="slider",
                    min_value=1,
                    max_value=5
                ),
                QuizQuestion(
                    id="q2",
                    text="Have you thought about a specific career path?",
                    type="multiple_choice",
                    options=["Yes", "No", "Not sure"]
                ),
                QuizQuestion(
                    id="q3",
                    text="Which VCE subjects are you considering?",
                    type="multiple_choice",
                    options=[
                        "English", "Mathematics", "Science", "History",
                        "Languages", "Arts", "Technology", "Other"
                    ]
                ),
            ]

    async def get_question_by_id(self, question_id: str) -> Optional[QuizQuestion]:
        """Get a specific question by ID"""
        questions = await self.get_initial_questions()
        return next((q for q in questions if q.id == question_id), None)

    async def validate_answer(self, question_id: str, answer: Any) -> bool:
        """Validate an answer for a specific question"""
        question = await self.get_question_by_id(question_id)
        if not question:
            return False
        
        # Basic validation based on question type
        if question.type == "slider":
            return isinstance(answer, (int, float)) and question.min_value <= answer <= question.max_value
        elif question.type == "multiple_choice":
            return answer in question.options
        elif question.type == "text":
            return isinstance(answer, str) and len(answer.strip()) > 0
        
        return False

    async def save_initial_answers(self, clerk_user_id: str, answers: Dict[str, Any]) -> QuizResult:
        """Save initial answers and prepare for follow-up questions"""
        try:
            # Get user ID from Supabase
            user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise ValueError("User not found")
            
            user_id = user['id']
            
            # Save to Supabase quiz_results table
            quiz_data = {
                'user_id': user_id,
                'initial_answers': answers,
                'stage': 'initial',
                'created_at': datetime.now(UTC).isoformat(),
                'updated_at': datetime.now(UTC).isoformat()
            }
            
            await supabase_service._post("quiz_results", quiz_data)
        
            return QuizResult(
                user_id=clerk_user_id,
                initial_answers=answers,
                stage='initial'
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save initial answers: {str(e)}"
            )

    async def save_follow_up_answers(self, clerk_user_id: str, answers: Dict[str, Any]) -> QuizResult:
        """Save follow-up answers and prepare for recommendations"""
        try:
            # Get user ID from Supabase
            user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise ValueError("User not found")
            
            user_id = user['id']
            
            # Get initial answers from Supabase
            params = {"user_id": f"eq.{user_id}", "stage": "eq.initial", "order": "created_at.desc", "limit": 1}
            initial_response = await supabase_service._get("quiz_results", params)
            
            if not initial_response:
                raise ValueError("Initial answers not found")
        
            initial_data = initial_response[0]
            
            # Update with follow-up answers
            quiz_data = {
                'user_id': user_id,
                'initial_answers': initial_data['initial_answers'],
                'follow_up_answers': answers,
                'stage': 'follow_up',
                'updated_at': datetime.now(UTC).isoformat()
            }
            
            await supabase_service._patch("quiz_results", quiz_data, {"id": initial_data['id']})
        
            return QuizResult(
                user_id=clerk_user_id,
                initial_answers=initial_data['initial_answers'],
                follow_up_answers=answers,
                stage='follow_up'
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save follow-up answers: {str(e)}"
            )

    async def get_all_answers(self, clerk_user_id: str) -> Dict[str, Any]:
        """Get all answers for a user"""
        try:
            # Get user ID from Supabase
            user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return {}
            
            user_id = user['id']
            
            # Get quiz results from Supabase
            params = {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": 1}
            response = await supabase_service._get("quiz_results", params)
            
            if not response:
                return {}
        
            result = response[0]
            
            all_answers = {
                'initial': result.get('initial_answers', {}),
                'follow_up': result.get('follow_up_answers', {})
            }
        
            return all_answers
        except Exception as e:
            return {}

    async def get_quiz_results(self, clerk_user_id: str) -> Optional[QuizResult]:
        """Get complete quiz results including recommendations"""
        try:
            # Get user ID from Supabase
            user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return None
            
            user_id = user['id']
            
            # Get quiz results from Supabase
            params = {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": 1}
            response = await supabase_service._get("quiz_results", params)
            
            if not response:
                return None
        
            result = response[0]
            
            # Get recommendations from career_reports table
            career_params = {"user_id": f"eq.{user_id}", "order": "created_at.desc", "limit": 1}
            career_response = await supabase_service._get("career_reports", career_params)
            recommendations = career_response[0]['content'] if career_response else None
        
            return QuizResult(
                user_id=clerk_user_id,
                initial_answers=result.get('initial_answers', {}),
                follow_up_answers=result.get('follow_up_answers', {}),
                recommendations=recommendations,
                stage=result.get('stage', 'initial')
            )
        except Exception as e:
            return None

    async def save_recommendations(self, clerk_user_id: str, recommendations: Dict[str, Any]) -> None:
        """Save recommendations to Supabase"""
        try:
            await supabase_service.save_career_report(clerk_user_id, recommendations)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save recommendations: {str(e)}"
            )

    async def record_initial_answers(
        self,
        clerk_user_id: str,
        answers: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Record initial quiz answers and generate follow-up questions"""
        try:
            result = await self.save_initial_answers(clerk_user_id, answers)
            return answers
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to record initial answers: {str(e)}"
            )

    async def record_follow_up_answers(
        self,
        clerk_user_id: str,
        answers: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Record follow-up answers and generate recommendations"""
        try:
            # Get initial answers
            all_answers = await self.get_all_answers(clerk_user_id)
            if not all_answers.get('initial'):
                raise HTTPException(
                    status_code=404,
                    detail="No initial answers found for this user"
                )

            # Clear any existing cached recommendations
            await self.ai_service.clear_user_cache(clerk_user_id)

            # Generate recommendations using AI
            quiz_analysis = await self.ai_service.analyze_quiz_responses(
                clerk_user_id,
                {
                    "stage1": all_answers.get('initial', {}),
                    "stage2": answers
                }
            )

            subject_recommendations = await self.ai_service.generate_subject_recommendations(
                clerk_user_id,
                quiz_analysis,
                []  # Current subjects would come from user profile
            )

            career_recommendations = await self.ai_service.generate_career_recommendations(
                clerk_user_id,
                quiz_analysis,
                subject_recommendations
            )

            study_resources = await self.ai_service.generate_study_resources(
                clerk_user_id,
                subject_recommendations,
                [career["title"] for career in career_recommendations]
            )

            # Save all data to Supabase
            await self.save_follow_up_answers(clerk_user_id, answers)
            
            # Save recommendations
            report_data = {
                'recommended_subjects': subject_recommendations,
                'career_recommendations': career_recommendations,
                'study_resources': study_resources,
                'quiz_analysis': quiz_analysis
            }
            await self.save_recommendations(clerk_user_id, report_data)

            return {
                'follow_up_answers': answers,
                'recommended_subjects': subject_recommendations,
                'career_recommendations': career_recommendations,
                'study_resources': study_resources
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to record follow-up answers: {str(e)}"
            )

    @staticmethod
    async def save_quiz_result(clerk_user_id: str, answers: Dict[int, str], 
                             recommendations: List[str], score: Optional[float] = None) -> Dict[str, Any]:
        """Save quiz results for a user."""
        try:
            # Get user ID from Supabase
            user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise ValueError("User not found")
            
            user_id = user['id']
            
            result_data = {
                'user_id': user_id,
                'answers': answers,
                'recommendations': recommendations,
                'score': score,
                'created_at': datetime.utcnow().isoformat()
            }

            # Save to Supabase
            response = await supabase_service._post("quiz_results", result_data)
            
            return {**result_data, 'id': response[0]['id'] if response else None}

        except Exception as e:
            raise Exception(f"Failed to save quiz result: {str(e)}")

    @staticmethod
    async def get_user_results(clerk_user_id: str) -> List[Dict[str, Any]]:
        """Get all quiz results for a user."""
        try:
            # Get user ID from Supabase
            user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                return []
            
            user_id = user['id']
            
            # Get results from Supabase
            params = {"user_id": f"eq.{user_id}", "order": "created_at.desc"}
            response = await supabase_service._get("quiz_results", params)
            
            return response if response else []
            
        except Exception as e:
            raise Exception(f"Failed to get user results: {str(e)}")

    @staticmethod
    async def get_result(result_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific quiz result."""
        try:
            params = {"id": f"eq.{result_id}"}
            response = await supabase_service._get("quiz_results", params)
            return response[0] if response else None
        except Exception as e:
            raise Exception(f"Failed to get result: {str(e)}")

    @staticmethod
    async def delete_result(result_id: str) -> bool:
        """Delete a quiz result."""
        try:
            await supabase_service._delete("quiz_results", {"id": result_id})
            return True
        except Exception as e:
            raise Exception(f"Failed to delete result: {str(e)}")

    @staticmethod
    async def get_all_results() -> List[Dict[str, Any]]:
        """Get all quiz results."""
        try:
            response = await supabase_service._get("quiz_results", {})
            return response if response else []
        except Exception as e:
            raise Exception(f"Failed to get all results: {str(e)}")

    @staticmethod
    async def get_recommendations(answers: Dict[int, str]) -> List[str]:
        """Get recommendations based on quiz answers."""
        try:
            # This would typically call an AI service
            # For now, return placeholder recommendations
            return [
                "Consider exploring STEM subjects",
                "Look into business and economics",
                "Research healthcare careers"
            ]
        except Exception as e:
            raise Exception(f"Failed to get recommendations: {str(e)}") 
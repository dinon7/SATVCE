from typing import List, Dict, Any, Optional
from datetime import datetime, UTC
from fastapi import HTTPException
from firebase_admin import db
from app.models.quiz import QuizQuestion, QuizResult
from app.services.ai_service import AIService
from app.services.firebase_service import firebase_service
from app.services.ai import generate_follow_up_questions, generate_recommendations
from app.database.firestore import FirestoreClient

class QuizService:
    def __init__(self):
        self.ai_service = AIService()

    async def get_initial_questions(self) -> List[QuizQuestion]:
        """Get initial questions from Firebase"""
        questions_data = firebase_service.get_subjects().get('questions', [])
        return [QuizQuestion(**q) for q in questions_data]

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

    async def save_initial_answers(self, user_id: str, answers: Dict[str, Any]) -> QuizResult:
        """Save initial answers and prepare for follow-up questions"""
        # Save to Firebase
        firebase_service.save_quiz_results(user_id, {
            'initial_answers': answers,
            'stage': 'initial',
            'created_at': datetime.now(UTC).isoformat(),
            'updated_at': datetime.now(UTC).isoformat()
        })
        
        return QuizResult(
            user_id=user_id,
            initial_answers=answers,
            stage='initial'
        )

    async def save_follow_up_answers(self, user_id: str, answers: Dict[str, Any]) -> QuizResult:
        """Save follow-up answers and prepare for recommendations"""
        # Get initial answers
        initial_results = firebase_service.get_quiz_results(user_id)
        if not initial_results or 'initial_answers' not in initial_results:
            raise ValueError("Initial answers not found")
        
        # Save to Firebase
        firebase_service.save_quiz_results(user_id, {
            'initial_answers': initial_results['initial_answers'],
            'follow_up_answers': answers,
            'stage': 'follow_up',
            'updated_at': datetime.now(UTC).isoformat()
        })
        
        return QuizResult(
            user_id=user_id,
            initial_answers=initial_results['initial_answers'],
            follow_up_answers=answers,
            stage='follow_up'
        )

    async def get_all_answers(self, user_id: str) -> Dict[str, Any]:
        """Get all answers for a user"""
        results = firebase_service.get_quiz_results(user_id)
        if not results:
            return {}
        
        all_answers = {
            'initial': results.get('initial_answers', {}),
            'follow_up': results.get('follow_up_answers', {})
        }
        
        return all_answers

    async def get_quiz_results(self, user_id: str) -> Optional[QuizResult]:
        """Get complete quiz results including recommendations"""
        results = firebase_service.get_quiz_results(user_id)
        if not results:
            return None
        
        recommendations = firebase_service.get_recommendations(user_id)
        
        return QuizResult(
            user_id=user_id,
            initial_answers=results.get('initial_answers', {}),
            follow_up_answers=results.get('follow_up_answers', {}),
            recommendations=recommendations,
            stage=results.get('stage', 'initial')
        )

    async def save_recommendations(self, user_id: str, recommendations: Dict[str, Any]) -> None:
        """Save recommendations to Firebase"""
        firebase_service.save_recommendations(user_id, recommendations)

    async def record_initial_answers(
        self,
        user_id: str,
        answers: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Record initial quiz answers and generate follow-up questions"""
        try:
            # Save to Firebase
            firebase_service.save_quiz_results(user_id, {
                'initial_answers': answers,
                'stage': 'initial',
                'created_at': datetime.now(UTC).isoformat(),
                'updated_at': datetime.now(UTC).isoformat()
            })
            return answers
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to record initial answers: {str(e)}"
            )

    async def record_follow_up_answers(
        self,
        user_id: str,
        answers: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Record follow-up answers and generate recommendations"""
        try:
            # Get initial answers
            initial_results = firebase_service.get_quiz_results(user_id)
            if not initial_results:
                raise HTTPException(
                    status_code=404,
                    detail="No initial answers found for this user"
                )

            # Get user's current subjects
            user_data = firebase_service.get_user(user_id)
            current_subjects = user_data.get('quiz_results', {}).get('current_subjects', [])

            # Clear any existing cached recommendations
            await self.ai_service.clear_user_cache(user_id)

            # Generate recommendations using AI
            quiz_analysis = await self.ai_service.analyze_quiz_responses(
                user_id,
                {
                    "stage1": initial_results.get('initial_answers', {}),
                    "stage2": answers
                }
            )

            subject_recommendations = await self.ai_service.generate_subject_recommendations(
                user_id,
                quiz_analysis,
                current_subjects
            )

            career_recommendations = await self.ai_service.generate_career_recommendations(
                user_id,
                quiz_analysis,
                subject_recommendations
            )

            study_resources = await self.ai_service.generate_study_resources(
                user_id,
                subject_recommendations,
                [career["title"] for career in career_recommendations]
            )

            # Save all data to Firebase
            firebase_service.save_quiz_results(user_id, {
                'initial_answers': initial_results.get('initial_answers', {}),
                'follow_up_answers': answers,
                'stage': 'follow_up',
                'recommended_subjects': subject_recommendations,
                'career_recommendations': career_recommendations,
                'study_resources': study_resources,
                'updated_at': datetime.now(UTC).isoformat()
            })

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

    async def get_combined_quiz_data(self, user_id: str) -> Dict[str, Any]:
        """Get complete quiz data including recommendations"""
        try:
            quiz_response = firebase_service.get_quiz_results(user_id)

            if not quiz_response:
                raise HTTPException(
                    status_code=404,
                    detail="No quiz data found for this user"
                )

            return {
                "stage1_results": quiz_response.get('initial_answers', {}),
                "stage2_results": quiz_response.get('follow_up_answers', {}),
                "recommended_subjects": quiz_response.get('recommended_subjects', []),
                "recommended_careers": quiz_response.get('career_recommendations', []),
                "study_resources": quiz_response.get('study_resources', []),
                "is_complete": True
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to retrieve quiz data: {str(e)}"
            )

    @staticmethod
    async def save_quiz_result(user_id: str, answers: Dict[int, str], 
                             recommendations: List[str], score: Optional[float] = None) -> Dict[str, Any]:
        """Save quiz results for a user."""
        try:
            result_data = {
                'user_id': user_id,
                'answers': answers,
                'recommendations': recommendations,
                'score': score,
                'created_at': datetime.utcnow().isoformat()
            }

            # Generate a unique ID for the result
            result_id = f"{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
            
            await FirestoreClient.set_document('quiz_results', result_id, result_data)
            return {**result_data, 'id': result_id}

        except Exception as e:
            raise Exception(f"Failed to save quiz result: {str(e)}")

    @staticmethod
    async def get_user_results(user_id: str) -> List[Dict[str, Any]]:
        """Get all quiz results for a user."""
        try:
            results = await FirestoreClient.query_documents('quiz_results', 'user_id', '==', user_id)
            return sorted(results, key=lambda x: x['created_at'], reverse=True)
        except Exception as e:
            raise Exception(f"Failed to get user results: {str(e)}")

    @staticmethod
    async def get_result(result_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific quiz result."""
        try:
            result = await FirestoreClient.get_document('quiz_results', result_id)
            return {**result, 'id': result_id} if result else None
        except Exception as e:
            raise Exception(f"Failed to get result: {str(e)}")

    @staticmethod
    async def delete_result(result_id: str) -> bool:
        """Delete a quiz result."""
        try:
            return await FirestoreClient.delete_document('quiz_results', result_id)
        except Exception as e:
            raise Exception(f"Failed to delete result: {str(e)}")

    @staticmethod
    async def get_all_results() -> List[Dict[str, Any]]:
        """Get all quiz results (admin only)."""
        try:
            results = await FirestoreClient.query_documents('quiz_results', 'created_at', '!=', None)
            return sorted(results, key=lambda x: x['created_at'], reverse=True)
        except Exception as e:
            raise Exception(f"Failed to get all results: {str(e)}")

    @staticmethod
    async def get_recommendations(answers: Dict[int, str]) -> List[str]:
        """Generate career recommendations based on quiz answers."""
        try:
            # Get all careers
            careers = await FirestoreClient.query_documents('careers', 'active', '==', True)
            
            # Simple scoring system (can be enhanced)
            career_scores = {}
            for career in careers:
                score = 0
                for question_id, answer in answers.items():
                    if str(question_id) in career.get('matching_answers', {}):
                        if career['matching_answers'][str(question_id)] == answer:
                            score += 1
                career_scores[career['id']] = score
            
            # Get top 3 recommendations
            top_careers = sorted(career_scores.items(), key=lambda x: x[1], reverse=True)[:3]
            return [career['title'] for career in careers if career['id'] in [c[0] for c in top_careers]]
            
        except Exception as e:
            raise Exception(f"Failed to generate recommendations: {str(e)}") 
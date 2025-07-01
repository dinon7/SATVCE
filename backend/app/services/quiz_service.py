from typing import List, Dict, Any, Optional
from datetime import datetime, UTC
from fastapi import HTTPException
from ..models.quiz import QuizQuestion, QuizResult
from ..services.ai_service import AIService
from ..services.supabase_service import supabase_service
from ..services.ai import generate_recommendations
import logging

logger = logging.getLogger(__name__)

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

    async def save_all_answers(self, clerk_user_id: str, answers: Dict[str, Any]) -> QuizResult:
        """Save all answers (quiz + followup) and prepare for recommendations"""
        try:
            # Get user ID from Supabase
            user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
            if not user:
                raise ValueError("User not found")
            
            user_id = user['id']
            
            # Separate quiz answers from followup answers
            quiz_answers = {}
            followup_answers = {}
            
            for key, value in answers.items():
                if key.startswith('q'):
                    quiz_answers[key] = value
                else:
                    followup_answers[key] = value
            
            # Save to Supabase quiz_results table
            quiz_data = {
                'user_id': user_id,
                'initial_answers': quiz_answers,
                'follow_up_answers': followup_answers,
                'stage': 'completed',
                'created_at': datetime.now(UTC).isoformat(),
                'updated_at': datetime.now(UTC).isoformat()
            }
            
            await supabase_service._post("quiz_results", quiz_data)
        
            return QuizResult(
                user_id=clerk_user_id,
                initial_answers=quiz_answers,
                follow_up_answers=followup_answers,
                stage='completed'
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save all answers: {str(e)}"
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
                'created_at': datetime.now(UTC).isoformat()
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

    async def save_quiz_result(self, user_id: str, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save quiz result with improved datetime handling"""
        try:
            quiz_result = {
                'user_id': user_id,
                'quiz_data': quiz_data,
                'created_at': datetime.now(UTC).isoformat()
            }
            result = await supabase_service._post("quiz_results", quiz_result)
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error saving quiz result: {str(e)}")
            raise 

class QuizManager:
    """Quiz manager for handling initial questions, followup questions, and results"""
    
    def __init__(self):
        self.quiz_service = QuizService()
    
    async def fetch_initial_questions(self) -> List[QuizQuestion]:
        """Fetch the initial 25 quiz questions"""
        try:
            # Return the predefined 25 questions from schemas
            from ..schemas.quiz import INITIAL_QUESTIONS
            return INITIAL_QUESTIONS
        except Exception as e:
            logger.error(f"Error fetching initial questions: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch initial questions: {str(e)}"
            )
    
    async def record_initial_answers(self, student_id: str, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Record initial quiz answers"""
        try:
            # Save initial answers to database
            await self.quiz_service.save_initial_answers(student_id, answers)
            return answers
        except Exception as e:
            logger.error(f"Error recording initial answers: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to record initial answers: {str(e)}"
            )
    
    async def get_follow_up_questions(self, student_id: str) -> List[QuizQuestion]:
        """Generate followup questions based on initial answers"""
        try:
            # Get the initial answers for this student
            all_answers = await self.quiz_service.get_all_answers(student_id)
            initial_answers = all_answers.get('initial', {})
            
            # Generate followup questions based on initial answers
            followup_questions = await self._generate_followup_questions(initial_answers)
            
            return followup_questions
        except Exception as e:
            logger.error(f"Error getting followup questions: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get followup questions: {str(e)}"
            )
    
    async def _generate_followup_questions(self, initial_answers: Dict[str, Any]) -> List[QuizQuestion]:
        """Generate followup questions based on initial answers"""
        followup_questions = []
        
        # Analyze initial answers to determine followup questions
        subjects_mentioned = initial_answers.get('q15', [])  # VCE subjects
        career_confidence = initial_answers.get('q2', 3)  # Career confidence
        dream_job = initial_answers.get('q13', '')  # Dream job
        strongest_areas = initial_answers.get('q10', [])  # Strongest academic areas
        
        # Question 1: If they mentioned specific subjects, ask about depth
        if subjects_mentioned and len(subjects_mentioned) > 0:
            followup_questions.append(QuizQuestion(
                id="f1",
                text="How deeply have you researched the subjects you're considering for VCE?",
                type="multiple_choice",
                options=[
                    "I've done extensive research",
                    "I've done some research",
                    "I've done minimal research",
                    "I haven't researched yet"
                ]
            ))
        
        # Question 2: If they have a dream job, ask about steps
        if dream_job and dream_job.strip():
            followup_questions.append(QuizQuestion(
                id="f2",
                text=f"Regarding your dream job of '{dream_job}', what steps have you taken to learn more about it?",
                type="multiple_choice",
                options=[
                    "I've researched the requirements",
                    "I've talked to people in the field",
                    "I've done work experience",
                    "I've only thought about it"
                ]
            ))
        
        # Question 3: If they're not confident, ask about concerns
        if career_confidence < 3:
            followup_questions.append(QuizQuestion(
                id="f3",
                text="What are your main concerns about choosing a career path?",
                type="multiple_choice",
                options=[
                    "I don't know what I'm good at",
                    "I'm worried about job security",
                    "I'm not sure about the salary",
                    "I'm afraid of making the wrong choice",
                    "Other"
                ]
            ))
        
        # Question 4: If they mentioned STEM subjects, ask about specific interests
        stem_subjects = ['Mathematics', 'Further Mathematics', 'Mathematical Methods', 'Specialist Mathematics', 'Biology', 'Chemistry', 'Physics']
        if any(subject in subjects_mentioned for subject in stem_subjects):
            followup_questions.append(QuizQuestion(
                id="f4",
                text="Which area of STEM interests you the most?",
                type="multiple_choice",
                options=[
                    "Mathematics and statistics",
                    "Biology and life sciences",
                    "Chemistry and materials",
                    "Physics and engineering",
                    "Computer science and technology"
                ]
            ))
        
        # Question 5: If they mentioned business subjects, ask about career goals
        business_subjects = ['Business Management', 'Accounting', 'Economics']
        if any(subject in subjects_mentioned for subject in business_subjects):
            followup_questions.append(QuizQuestion(
                id="f5",
                text="What type of business career interests you?",
                type="multiple_choice",
                options=[
                    "Management and leadership",
                    "Finance and accounting",
                    "Marketing and sales",
                    "Entrepreneurship",
                    "Human resources"
                ]
            ))
        
        # Question 6: If they mentioned arts subjects, ask about creative interests
        arts_subjects = ['Art', 'Studio Arts', 'Media', 'Music']
        if any(subject in subjects_mentioned for subject in arts_subjects):
            followup_questions.append(QuizQuestion(
                id="f6",
                text="What type of creative work interests you?",
                type="multiple_choice",
                options=[
                    "Visual arts and design",
                    "Digital media and film",
                    "Music and performance",
                    "Writing and communication",
                    "Fashion and textiles"
                ]
            ))
        
        # Question 7: General question about work experience
        followup_questions.append(QuizQuestion(
            id="f7",
            text="Have you done any work experience or part-time work?",
            type="multiple_choice",
            options=[
                "Yes, in a field I'm interested in",
                "Yes, but not in my field of interest",
                "No, but I plan to",
                "No, and I don't plan to"
            ]
        ))
        
        return followup_questions
    
    async def get_combined_quiz_data(self, student_id: str) -> Dict[str, Any]:
        """Get combined quiz data including initial answers, followup answers, and results"""
        try:
            # Get all answers
            all_answers = await self.quiz_service.get_all_answers(student_id)
            
            # Get quiz results
            quiz_result = await self.quiz_service.get_quiz_results(student_id)
            
            # Generate recommendations if not already present
            recommendations = None
            if quiz_result and not quiz_result.recommendations:
                all_answers_combined = {**all_answers.get('initial', {}), **all_answers.get('follow_up', {})}
                recommendations = await generate_recommendations(all_answers_combined)
            
            return {
                'student_id': student_id,
                'initial_answers': all_answers.get('initial', {}),
                'followup_answers': all_answers.get('follow_up', {}),
                'recommendations': recommendations or (quiz_result.recommendations if quiz_result else None),
                'completed': bool(all_answers.get('initial') and all_answers.get('follow_up'))
            }
        except Exception as e:
            logger.error(f"Error getting combined quiz data: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get combined quiz data: {str(e)}"
            )
    
    async def submit_quiz(self, student_id: str) -> Dict[str, Any]:
        """Submit the complete quiz and generate final results"""
        try:
            # Get all answers
            all_answers = await self.quiz_service.get_all_answers(student_id)
            
            # Combine all answers
            combined_answers = {**all_answers.get('initial', {}), **all_answers.get('follow_up', {})}
            
            # Generate recommendations
            recommendations = await generate_recommendations(combined_answers)
            
            # Save all answers and recommendations
            result = await self.quiz_service.save_all_answers(student_id, combined_answers)
            await self.quiz_service.save_recommendations(student_id, recommendations)
            
            return {
                'student_id': student_id,
                'initial_answers': all_answers.get('initial', {}),
                'followup_answers': all_answers.get('follow_up', {}),
                'recommendations': recommendations,
                'completed': True
            }
        except Exception as e:
            logger.error(f"Error submitting quiz: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to submit quiz: {str(e)}"
            ) 
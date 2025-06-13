from typing import List, Dict, Any, Optional
from fastapi import HTTPException
import httpx
from app.services.ai import call_gemini_api
from app.services.cache_service import CacheService

class AIServiceError(Exception):
    """Base exception for AI service errors"""
    pass

class AIResponseError(AIServiceError):
    """Exception for invalid AI responses"""
    pass

class AIService:
    def __init__(self):
        self.cache = CacheService()

    async def _call_gemini_with_retry(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """Call Gemini API with retry logic"""
        for attempt in range(max_retries):
            try:
                response = await call_gemini_api(endpoint, payload)
                if not response or "error" in response:
                    raise AIResponseError(f"Invalid response from Gemini API: {response}")
                return response
            except (httpx.HTTPError, AIResponseError) as e:
                if attempt == max_retries - 1:
                    raise AIServiceError(f"Failed to call Gemini API after {max_retries} attempts: {str(e)}")
                continue

    async def analyze_quiz_responses(
        self,
        user_id: str,
        quiz_responses: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze quiz responses and generate insights"""
        # Try to get from cache first
        cache_key = self.cache.generate_key(user_id, "quiz_analysis")
        cached_result = await self.cache.get(cache_key)
        if cached_result:
            return cached_result

        prompt = f"""
        Analyze the following quiz responses and provide insights:
        {quiz_responses}
        
        Focus on:
        1. Subject preferences and strengths
        2. Career interests and motivations
        3. Learning style and work preferences
        4. Areas of uncertainty or concern
        """
        
        try:
            response = await self._call_gemini_with_retry(
                "gemini-pro:generateContent",
                {"contents": [{"parts": [{"text": prompt}]}]}
            )
            
            # Cache the result
            await self.cache.set(cache_key, response)
            return response
        except AIServiceError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to analyze quiz responses: {str(e)}"
            )

    async def generate_subject_recommendations(
        self,
        user_id: str,
        quiz_analysis: Dict[str, Any],
        current_subjects: List[str]
    ) -> List[str]:
        """Generate subject recommendations based on quiz analysis"""
        cache_key = self.cache.generate_key(user_id, "subject_recommendations")
        cached_result = await self.cache.get(cache_key)
        if cached_result:
            return cached_result

        prompt = f"""
        Based on the following analysis and current subjects:
        Analysis: {quiz_analysis}
        Current Subjects: {current_subjects}
        
        Recommend VCE subjects that would be a good fit, considering:
        1. Student's interests and strengths
        2. Career aspirations
        3. Prerequisites and subject combinations
        4. ATAR scaling and difficulty
        """
        
        try:
            response = await self._call_gemini_with_retry(
                "gemini-pro:generateContent",
                {"contents": [{"parts": [{"text": prompt}]}]}
            )
            
            await self.cache.set(cache_key, response)
            return response
        except AIServiceError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to generate subject recommendations: {str(e)}"
            )

    async def generate_career_recommendations(
        self,
        user_id: str,
        quiz_analysis: Dict[str, Any],
        subject_recommendations: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate career recommendations based on quiz analysis and subject recommendations"""
        cache_key = self.cache.generate_key(user_id, "career_recommendations")
        cached_result = await self.cache.get(cache_key)
        if cached_result:
            return cached_result

        prompt = f"""
        Based on the following analysis and recommended subjects:
        Analysis: {quiz_analysis}
        Recommended Subjects: {subject_recommendations}
        
        Recommend potential careers that would be a good fit, including:
        1. Career title and description
        2. Required skills and qualifications
        3. Job market outlook
        4. Potential career paths
        5. Salary expectations
        """
        
        try:
            response = await self._call_gemini_with_retry(
                "gemini-pro:generateContent",
                {"contents": [{"parts": [{"text": prompt}]}]}
            )
            
            await self.cache.set(cache_key, response)
            return response
        except AIServiceError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to generate career recommendations: {str(e)}"
            )

    async def generate_study_resources(
        self,
        user_id: str,
        recommended_subjects: List[str],
        career_paths: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate study resources based on recommended subjects and career paths"""
        cache_key = self.cache.generate_key(user_id, "study_resources")
        cached_result = await self.cache.get(cache_key)
        if cached_result:
            return cached_result

        prompt = f"""
        Based on the following subjects and career paths:
        Subjects: {recommended_subjects}
        Career Paths: {career_paths}
        
        Recommend study resources including:
        1. Online courses and tutorials
        2. Practice materials
        3. Books and reading materials
        4. Websites and tools
        5. Community resources
        """
        
        try:
            response = await self._call_gemini_with_retry(
                "gemini-pro:generateContent",
                {"contents": [{"parts": [{"text": prompt}]}]}
            )
            
            await self.cache.set(cache_key, response)
            return response
        except AIServiceError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to generate study resources: {str(e)}"
            )

    async def clear_user_cache(self, user_id: str) -> None:
        """Clear all cached recommendations for a user"""
        cache_keys = [
            self.cache.generate_key(user_id, "quiz_analysis"),
            self.cache.generate_key(user_id, "subject_recommendations"),
            self.cache.generate_key(user_id, "career_recommendations"),
            self.cache.generate_key(user_id, "study_resources")
        ]
        for key in cache_keys:
            await self.cache.delete(key) 
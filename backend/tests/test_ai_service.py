import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from app.services.ai_service import AIService, AIServiceError, AIResponseError


class TestAIService:
    """Test suite for AIService"""

    @pytest.fixture
    def ai_service(self):
        """Create an AIService instance with mocked cache"""
        with patch('app.services.ai_service.CacheService') as mock_cache:
            mock_cache_instance = AsyncMock()
            # Configure the cache methods to return proper values
            mock_cache_instance.get.return_value = None  # Default to no cached result
            mock_cache_instance.set.return_value = None
            mock_cache_instance.clear_user_cache.return_value = None
            mock_cache_instance.generate_key.return_value = "test_key"
            
            mock_cache.return_value = mock_cache_instance
            service = AIService()
            # Replace the cache instance with our mock
            service.cache = mock_cache_instance
            yield service

    @pytest.fixture
    def mock_cache_service(self):
        """Mock CacheService"""
        with patch('app.services.ai_service.CacheService') as mock_cache:
            mock_cache_instance = AsyncMock()
            mock_cache.return_value = mock_cache_instance
            yield mock_cache_instance

    @pytest.fixture
    def mock_gemini_api(self):
        """Mock the Gemini API call"""
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_api:
            yield mock_api

    @pytest.fixture
    def sample_quiz_responses(self):
        """Sample quiz responses for testing"""
        return {
            "interests": ["mathematics", "programming"],
            "strengths": ["problem-solving", "analytical thinking"],
            "career_goals": ["data science", "software engineering"],
            "learning_style": "visual",
            "work_preferences": ["remote", "flexible hours"]
        }

    @pytest.fixture
    def sample_gemini_response(self):
        """Sample Gemini API response"""
        return "Sample analysis text"

    @pytest.mark.asyncio
    async def test_init(self, ai_service):
        """Test AIService initialization"""
        assert ai_service is not None
        assert hasattr(ai_service, 'cache')

    @pytest.mark.asyncio
    async def test_call_gemini_with_retry_success(self, ai_service, mock_gemini_api):
        """Test successful Gemini API call with retry"""
        mock_gemini_api.return_value = "success"
        
        result = await ai_service._call_gemini_with_retry(
            "gemini-pro:generateContent",
            {"contents": [{"parts": [{"text": "test"}]}]}
        )
        
        expected = {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": "success"
                    }]
                }
            }]
        }
        assert result == expected
        mock_gemini_api.assert_called_once()

    @pytest.mark.asyncio
    async def test_call_gemini_with_retry_failure_then_success(self, ai_service, mock_gemini_api):
        """Test Gemini API call that fails once then succeeds"""
        mock_gemini_api.side_effect = [
            Exception("Temporary error"),
            "success"
        ]
        
        result = await ai_service._call_gemini_with_retry(
            "gemini-pro:generateContent",
            {"contents": [{"parts": [{"text": "test"}]}]}
        )
        
        expected = {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": "success"
                    }]
                }
            }]
        }
        assert result == expected
        assert mock_gemini_api.call_count == 2

    @pytest.mark.asyncio
    async def test_call_gemini_with_retry_all_failures(self, ai_service, mock_gemini_api):
        """Test Gemini API call that fails all retries"""
        mock_gemini_api.side_effect = Exception("Persistent error")
        
        with pytest.raises(AIServiceError, match="Failed to call Gemini API after 3 attempts"):
            await ai_service._call_gemini_with_retry(
                "gemini-pro:generateContent",
                {"contents": [{"parts": [{"text": "test"}]}]}
            )
        
        assert mock_gemini_api.call_count == 3

    @pytest.mark.asyncio
    async def test_call_gemini_with_retry_invalid_response(self, ai_service, mock_gemini_api):
        """Test Gemini API call with invalid response"""
        mock_gemini_api.return_value = ""
        
        with pytest.raises(AIServiceError, match="Failed to call Gemini API after 3 attempts"):
            await ai_service._call_gemini_with_retry(
                "gemini-pro:generateContent",
                {"contents": [{"parts": [{"text": "test"}]}]}
            )

    @pytest.mark.asyncio
    async def test_analyze_quiz_responses_cached(self, ai_service, sample_quiz_responses):
        """Test quiz analysis with cached result"""
        cached_result = "Cached analysis result"
        ai_service.cache.get.return_value = cached_result
        
        result = await ai_service.analyze_quiz_responses("user123", sample_quiz_responses)
        
        assert result == cached_result
        ai_service.cache.get.assert_called_once()
        # Should not call Gemini API when cached
        ai_service.cache.set.assert_not_called()

    @pytest.mark.asyncio
    async def test_analyze_quiz_responses_new_analysis(self, ai_service, sample_quiz_responses, sample_gemini_response):
        """Test quiz analysis with new Gemini API call"""
        # Set up cache to return None (no cached result)
        ai_service.cache.get.return_value = None
        # Set up Gemini API mock
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.return_value = sample_gemini_response
            
            result = await ai_service.analyze_quiz_responses("user123", sample_quiz_responses)
            
            assert result == "Sample analysis text"
            ai_service.cache.get.assert_called_once()
            ai_service.cache.set.assert_called_once()
            mock_gemini_api.assert_called_once()

    @pytest.mark.asyncio
    async def test_analyze_quiz_responses_api_error(self, ai_service, sample_quiz_responses):
        """Test quiz analysis with API error"""
        # Set up cache to return None (no cached result)
        ai_service.cache.get.return_value = None
        # Set up Gemini API mock to raise an error
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.side_effect = AIServiceError("API Error")
            
            with pytest.raises(HTTPException) as exc_info:
                await ai_service.analyze_quiz_responses("user123", sample_quiz_responses)
            
            assert exc_info.value.status_code == 503
            assert "Failed to analyze quiz responses" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_generate_subject_recommendations_cached(self, ai_service):
        """Test subject recommendations with cached result"""
        cached_result = ["Mathematics", "Physics", "Computer Science"]
        ai_service.cache.get.return_value = cached_result
        
        result = await ai_service.generate_subject_recommendations(
            "user123", 
            {"analysis": "test"}, 
            ["Math"]
        )
        
        assert result == cached_result
        ai_service.cache.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_subject_recommendations_new(self, ai_service, sample_gemini_response):
        """Test subject recommendations with new API call"""
        # Set up cache to return None (no cached result)
        ai_service.cache.get.return_value = None
        # Set up Gemini API mock
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.return_value = sample_gemini_response
            
            result = await ai_service.generate_subject_recommendations(
                "user123", 
                {"analysis": "test"}, 
                ["Math"]
            )
            
            assert result == "Sample analysis text"
            ai_service.cache.set.assert_called_once()
            mock_gemini_api.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_career_recommendations_cached(self, ai_service):
        """Test career recommendations with cached result"""
        cached_result = [
            {
                "title": "Data Scientist",
                "description": "Analyzes data",
                "requiredSkills": ["Python", "Statistics"],
                "jobOutlook": "Excellent",
                "salaryRange": "$80k-$120k",
                "educationRequirements": ["Bachelor's degree"],
                "confidence": 0.9
            }
        ]
        ai_service.cache.get.return_value = cached_result
        
        result = await ai_service.generate_career_recommendations(
            "user123", 
            {"analysis": "test"}, 
            ["Mathematics"]
        )
        
        assert result == cached_result
        ai_service.cache.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_career_recommendations_new_valid_json(self, ai_service, sample_gemini_response):
        ai_service.cache.get.return_value = None
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            json_response = [
                {
                    "title": "Data Scientist",
                    "description": "Analyzes data",
                    "requiredSkills": ["Python", "Statistics"],
                    "jobOutlook": "Excellent",
                    "salaryRange": "$80k-$120k",
                    "educationRequirements": ["Bachelor's degree"],
                    "confidence": 0.9
                }
            ]
            mock_gemini_api.return_value = f"Here are the recommendations: {json.dumps(json_response)}"
            result = await ai_service.generate_career_recommendations(
                "user123", {"analysis": "test"}, ["Mathematics"])
            assert len(result) == 1
            assert result[0]["title"] == "Data Scientist"
            assert result[0]["confidence"] == 0.9
            ai_service.cache.set.assert_called_once()
            mock_gemini_api.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_career_recommendations_invalid_json(self, ai_service):
        ai_service.cache.get.return_value = None
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.return_value = "This is not a JSON response"
            with pytest.raises(HTTPException) as exc_info:
                await ai_service.generate_career_recommendations(
                    "user123", {"analysis": "test"}, ["Mathematics"])
            assert exc_info.value.status_code == 503
            assert "Error parsing AI response" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_generate_career_recommendations_malformed_json(self, ai_service):
        ai_service.cache.get.return_value = None
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.return_value = "Here are the recommendations: [{invalid json}]"
            with pytest.raises(HTTPException) as exc_info:
                await ai_service.generate_career_recommendations(
                    "user123", {"analysis": "test"}, ["Mathematics"])
            assert exc_info.value.status_code == 503
            assert "Invalid JSON in AI response" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_generate_career_recommendations_cleans_data(self, ai_service):
        ai_service.cache.get.return_value = None
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            json_response = [
                {
                    "title": "Data Scientist",
                    "description": "Analyzes data",
                    "requiredSkills": ["Python", "Statistics"],
                    "jobOutlook": "Excellent",
                    "salaryRange": "$80k-$120k",
                    "educationRequirements": ["Bachelor's degree"],
                    "confidence": "0.9",  # String instead of float
                    "extraField": "should be ignored"
                }
            ]
            mock_gemini_api.return_value = f"Here are the recommendations: {json.dumps(json_response)}"
            result = await ai_service.generate_career_recommendations(
                "user123", {"analysis": "test"}, ["Mathematics"])
            assert len(result) == 1
            assert result[0]["title"] == "Data Scientist"
            assert result[0]["confidence"] == 0.9
            assert "extraField" not in result[0]
            ai_service.cache.set.assert_called_once()
            mock_gemini_api.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_study_resources_cached(self, ai_service):
        cached_result = [
            {"title": "Math Textbook", "url": "https://example.com/math"},
            {"title": "Physics Videos", "url": "https://example.com/physics"}
        ]
        ai_service.cache.get.return_value = cached_result
        result = await ai_service.generate_study_resources(
            "user123", ["Mathematics", "Physics"], ["Data Scientist"])
        assert result == cached_result
        ai_service.cache.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_study_resources_new(self, ai_service, sample_gemini_response):
        ai_service.cache.get.return_value = None
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.return_value = sample_gemini_response
            result = await ai_service.generate_study_resources(
                "user123", ["Mathematics", "Physics"], ["Data Scientist"])
            assert result == "Sample analysis text"
            ai_service.cache.set.assert_called_once()
            mock_gemini_api.assert_called_once()

    @pytest.mark.asyncio
    async def test_clear_user_cache(self, ai_service):
        ai_service.cache.clear_user_cache.return_value = None
        await ai_service.clear_user_cache("user123")
        ai_service.cache.clear_user_cache.assert_awaited_once_with("user123")

    @pytest.mark.asyncio
    async def test_generate_career_report(self, ai_service):
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.return_value = '{"report": "Comprehensive career report", "timestamp": "2024-01-01T00:00:00Z", "user_id": "user123"}'
            result = await ai_service.generate_career_report(
                "user123",
                ["Data Scientist", "Software Engineer"],
                {"analysis": "test analysis"}
            )
            assert "report" in result
            assert "timestamp" in result
            assert "user_id" in result
            assert result["user_id"] == "user123"
            mock_gemini_api.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_career_report_api_error(self, ai_service):
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.side_effect = AIServiceError("API Error")
            with pytest.raises(HTTPException) as exc_info:
                await ai_service.generate_career_report(
                    "user123",
                    ["Data Scientist", "Software Engineer"],
                    {"analysis": "test analysis"}
                )
            assert exc_info.value.status_code == 503
            assert "Failed to generate career report" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_cache_key_generation(self, ai_service):
        ai_service.cache.generate_key.return_value = "test_key"
        await ai_service.analyze_quiz_responses("user123", {"test": "data"})
        ai_service.cache.generate_key.assert_called_with("user123", "quiz_analysis")

    @pytest.mark.asyncio
    async def test_error_propagation(self, ai_service):
        ai_service.cache.get.side_effect = Exception("Cache error")
        with pytest.raises(Exception, match="Cache error"):
            await ai_service.analyze_quiz_responses("user123", {"test": "data"})

    @pytest.mark.asyncio
    async def test_empty_response_handling(self, ai_service):
        ai_service.cache.get.return_value = None
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.return_value = ""
            with pytest.raises(HTTPException) as exc_info:
                await ai_service.analyze_quiz_responses("user123", {"test": "data"})
            assert exc_info.value.status_code == 503
            assert "Failed to call Gemini API after 3 attempts" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_missing_content_handling(self, ai_service):
        ai_service.cache.get.return_value = None
        with patch('app.services.ai_service.call_gemini_api', new_callable=AsyncMock) as mock_gemini_api:
            mock_gemini_api.return_value = ""
            with pytest.raises(HTTPException) as exc_info:
                await ai_service.analyze_quiz_responses("user123", {"test": "data"})
            assert exc_info.value.status_code == 503
            assert "Failed to call Gemini API after 3 attempts" in str(exc_info.value.detail) 
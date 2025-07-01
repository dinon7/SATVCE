#!/usr/bin/env python3
"""
Direct service testing without FastAPI app import
Tests Supabase, AI, and transaction pooler functionality
"""

import os
import sys
import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, UTC
import httpx
import json

# Set environment variables
os.environ["SUPABASE_URL"] = "https://test.supabase.co"
os.environ["SUPABASE_KEY"] = "test-key"
os.environ["CLERK_JWT_ISSUER"] = "https://clerk.test.com"
os.environ["CLERK_JWT_AUDIENCE"] = "test-audience"
os.environ["GEMINI_API_KEY"] = "test-gemini-key"

# Add app to path
sys.path.insert(0, os.path.abspath('.'))

from backend.app.services.supabase_service import SupabaseService
from backend.app.services.ai_service import AIService, AIServiceError, AIResponseError


class TestSupabaseServiceDirect:
    """Direct tests for SupabaseService without FastAPI"""

    @pytest.mark.asyncio
    async def test_supabase_init(self):
        """Test SupabaseService initialization"""
        service = SupabaseService()
        assert service.supabase_url == "https://test.supabase.co"
        assert service.supabase_key == "test-key"
        assert service.rest_url == "https://test.supabase.co/rest/v1"

    @pytest.mark.asyncio
    async def test_supabase_health_check(self):
        """Test health check functionality"""
        service = SupabaseService()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value = mock_client.return_value
            mock_response = MagicMock()
            mock_response.json.return_value = {"status": "healthy"}
            mock_client.return_value.get.return_value = mock_response
            
            result = await service.health_check()
            assert result == {"status": "healthy"}

    @pytest.mark.asyncio
    async def test_supabase_user_operations(self):
        """Test user operations"""
        service = SupabaseService()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value = mock_client.return_value
            
            # Mock user retrieval
            user_response = MagicMock()
            user_response.json.return_value = [{"id": 1, "clerk_user_id": "clerk_123", "email": "test@example.com"}]
            mock_client.return_value.get.return_value = user_response
            
            user = await service.get_user_by_clerk_id("clerk_123")
            assert user["id"] == 1
            assert user["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_supabase_transaction_execution(self):
        """Test transaction execution"""
        service = SupabaseService()
        
        operations = [
            {"type": "insert", "table": "users", "data": {"name": "John"}},
            {"type": "update", "table": "users", "data": {"status": "active"}, "params": {"id": "eq.1"}}
        ]
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value = mock_client.return_value
            
            mock_responses = [
                MagicMock(json=lambda: [{"id": 1, "name": "John"}]),
                MagicMock(json=lambda: [{"id": 1, "status": "active"}])
            ]
            mock_client.return_value.post.side_effect = mock_responses[0]
            mock_client.return_value.patch.side_effect = mock_responses[1]
            
            results = await service.execute_transaction(operations)
            assert len(results) == 2


class TestAIServiceDirect:
    """Direct tests for AIService without FastAPI"""

    @pytest.mark.asyncio
    async def test_ai_service_init(self):
        """Test AIService initialization"""
        service = AIService()
        assert service is not None
        assert hasattr(service, 'cache')

    @pytest.mark.asyncio
    async def test_ai_service_gemini_call(self):
        """Test Gemini API call"""
        service = AIService()
        
        with patch('app.services.ai_service.call_gemini_api') as mock_api:
            mock_api.return_value = {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "Test response"
                        }]
                    }
                }]
            }
            
            result = await service._call_gemini_with_retry(
                "gemini-pro:generateContent",
                {"contents": [{"parts": [{"text": "test"}]}]}
            )
            
            assert "candidates" in result
            assert result["candidates"][0]["content"]["parts"][0]["text"] == "Test response"

    @pytest.mark.asyncio
    async def test_ai_service_quiz_analysis(self):
        """Test quiz analysis"""
        service = AIService()
        
        quiz_data = {
            "interests": ["mathematics", "programming"],
            "strengths": ["problem-solving", "analytical thinking"]
        }
        
        with patch('app.services.ai_service.call_gemini_api') as mock_api:
            mock_api.return_value = {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "Analysis shows strong analytical skills"
                        }]
                    }
                }]
            }
            
            result = await service.analyze_quiz_responses("user123", quiz_data)
            assert "analytical" in result.lower()

    @pytest.mark.asyncio
    async def test_ai_service_career_recommendations(self):
        """Test career recommendations"""
        service = AIService()
        
        with patch('app.services.ai_service.call_gemini_api') as mock_api:
            mock_api.return_value = {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": json.dumps([
                                {
                                    "title": "Data Scientist",
                                    "description": "Analyzes data",
                                    "requiredSkills": ["Python", "Statistics"],
                                    "jobOutlook": "Excellent",
                                    "salaryRange": "$80k-$120k",
                                    "educationRequirements": ["Bachelor's degree"],
                                    "confidence": 0.9
                                }
                            ])
                        }]
                    }
                }]
            }
            
            result = await service.generate_career_recommendations(
                "user123",
                {"analysis": "test"},
                ["Mathematics"]
            )
            
            assert len(result) == 1
            assert result[0]["title"] == "Data Scientist"
            assert result[0]["confidence"] == 0.9


class TestTransactionPoolerDirect:
    """Direct tests for transaction pooler"""

    @pytest.mark.asyncio
    async def test_transaction_pooler_concurrent_operations(self):
        """Test concurrent transaction operations"""
        service = SupabaseService()
        
        operations = [
            {"type": "insert", "table": "users", "data": {"name": f"User{i}"}}
            for i in range(5)
        ]
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value = mock_client.return_value
            
            mock_responses = [
                MagicMock(json=lambda: [{"id": i, "name": f"User{i}"}])
                for i in range(1, 6)
            ]
            mock_client.return_value.post.side_effect = mock_responses
            
            results = await service.execute_transaction(operations)
            assert len(results) == 5

    @pytest.mark.asyncio
    async def test_transaction_pooler_error_handling(self):
        """Test transaction error handling"""
        service = SupabaseService()
        
        operations = [{"type": "insert", "table": "users", "data": {"name": "John"}}]
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value = mock_client.return_value
            mock_client.return_value.post.side_effect = httpx.HTTPStatusError(
                "Database error", request=MagicMock(), response=MagicMock()
            )
            
            with pytest.raises(Exception):
                await service.execute_transaction(operations)


async def run_all_tests():
    """Run all direct tests"""
    print("🚀 Starting Direct Service Testing")
    print("=" * 50)
    
    # Test Supabase Service
    print("\n📊 Testing Supabase Service...")
    supabase_tests = TestSupabaseServiceDirect()
    
    await supabase_tests.test_supabase_init()
    print("✅ Supabase initialization test passed")
    
    await supabase_tests.test_supabase_health_check()
    print("✅ Supabase health check test passed")
    
    await supabase_tests.test_supabase_user_operations()
    print("✅ Supabase user operations test passed")
    
    await supabase_tests.test_supabase_transaction_execution()
    print("✅ Supabase transaction execution test passed")
    
    # Test AI Service
    print("\n🤖 Testing AI Service...")
    ai_tests = TestAIServiceDirect()
    
    await ai_tests.test_ai_service_init()
    print("✅ AI service initialization test passed")
    
    await ai_tests.test_ai_service_gemini_call()
    print("✅ AI service Gemini call test passed")
    
    await ai_tests.test_ai_service_quiz_analysis()
    print("✅ AI service quiz analysis test passed")
    
    await ai_tests.test_ai_service_career_recommendations()
    print("✅ AI service career recommendations test passed")
    
    # Test Transaction Pooler
    print("\n🔄 Testing Transaction Pooler...")
    pooler_tests = TestTransactionPoolerDirect()
    
    await pooler_tests.test_transaction_pooler_concurrent_operations()
    print("✅ Transaction pooler concurrent operations test passed")
    
    await pooler_tests.test_transaction_pooler_error_handling()
    print("✅ Transaction pooler error handling test passed")
    
    print("\n🎉 All direct service tests completed successfully!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(run_all_tests()) 
#!/usr/bin/env python3
"""
Simple tests for core functionality without app imports
"""

import os
import sys
import asyncio
import httpx
import json
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, UTC

# Set environment variables
os.environ["SUPABASE_URL"] = "https://test.supabase.co"
os.environ["SUPABASE_KEY"] = "test-key"
os.environ["CLERK_JWT_ISSUER"] = "https://clerk.test.com"
os.environ["CLERK_JWT_AUDIENCE"] = "test-audience"
os.environ["GEMINI_API_KEY"] = "test-gemini-key"

# Add app to path
sys.path.insert(0, os.path.abspath('.'))

# Import services directly
try:
    from backend.app.services.supabase_service import SupabaseService
    from backend.app.services.ai_service import AIService, AIServiceError, AIResponseError
    print("✅ Successfully imported services")
except Exception as e:
    print(f"❌ Failed to import services: {e}")
    sys.exit(1)


def make_async_response(json_value):
    mock = MagicMock()
    mock.json = MagicMock(return_value=json_value)
    return mock

async def test_supabase_service():
    """Test Supabase service functionality"""
    print("\n🔍 Testing Supabase Service...")
    
    try:
        # Test initialization
        service = SupabaseService()
        print("✅ SupabaseService initialized successfully")
        
        # Test health check
        with patch('httpx.AsyncClient', autospec=True) as mock_client_cls:
            mock_client = mock_client_cls.return_value
            mock_client.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(return_value=make_async_response([{"id": 1}]))
            result = await service.health_check()
            assert result["status"] == "healthy"
            print("✅ Health check test passed")
        
        # Test user operations
        with patch('httpx.AsyncClient', autospec=True) as mock_client_cls:
            mock_client = mock_client_cls.return_value
            mock_client.__aenter__.return_value = mock_client
            mock_client.get = AsyncMock(return_value=make_async_response([{"id": 1, "clerk_user_id": "clerk_123", "email": "test@example.com"}]))
            user = await service.get_user_by_clerk_id("clerk_123")
            assert user["id"] == 1
            assert user["email"] == "test@example.com"
            print("✅ User operations test passed")
        
        # Test transaction execution
        with patch('httpx.AsyncClient', autospec=True) as mock_client_cls:
            mock_client = mock_client_cls.return_value
            mock_client.__aenter__.return_value = mock_client
            mock_client.post = AsyncMock(side_effect=[make_async_response([{"id": 1, "name": "John"}]), make_async_response([{"id": 2, "user_id": 1}])])
            operations = [
                {"action": "insert", "table": "users", "data": {"name": "John"}},
                {"action": "insert", "table": "profiles", "data": {"user_id": "{{users.id}}"}}
            ]
            results = await service.execute_transaction(operations)
            assert len(results) == 2
            print("✅ Transaction execution test passed")
        
        print("🎉 All Supabase service tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Supabase service test failed: {e}")
        return False


async def test_ai_service():
    """Test AI service functionality"""
    print("\n🤖 Testing AI Service...")
    
    try:
        # Test initialization
        service = AIService()
        print("✅ AIService initialized successfully")
        
        # Test Gemini API call
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
            print("✅ Gemini API call test passed")
        
        # Test quiz analysis
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
            
            quiz_data = {
                "interests": ["mathematics", "programming"],
                "strengths": ["problem-solving", "analytical thinking"]
            }
            
            result = await service.analyze_quiz_responses("user123", quiz_data)
            assert "analytical" in result.lower()
            print("✅ Quiz analysis test passed")
        
        # Test career recommendations
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
            print("✅ Career recommendations test passed")
        
        print("🎉 All AI service tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ AI service test failed: {e}")
        return False


async def test_transaction_pooler():
    """Test transaction pooler functionality"""
    print("\n🔄 Testing Transaction Pooler...")
    
    try:
        service = SupabaseService()
        
        # Test concurrent operations
        with patch('httpx.AsyncClient', autospec=True) as mock_client_cls:
            mock_client = mock_client_cls.return_value
            mock_client.__aenter__.return_value = mock_client
            mock_client.post = AsyncMock(side_effect=[make_async_response([{"id": i, "name": f"User{i}"}]) for i in range(1, 6)])
            operations = [
                {"action": "insert", "table": "users", "data": {"name": f"User{i}"}}
                for i in range(1, 6)
            ]
            results = await service.execute_transaction(operations)
            assert len(results) == 5
            print("✅ Concurrent operations test passed")
        
        # Test error handling
        with patch('httpx.AsyncClient', autospec=True) as mock_client_cls:
            mock_client = mock_client_cls.return_value
            mock_client.__aenter__.return_value = mock_client
            mock_client.post = AsyncMock(side_effect=httpx.HTTPStatusError(
                "Database error", request=MagicMock(), response=MagicMock()
            ))
            operations = [{"action": "insert", "table": "users", "data": {"name": "John"}}]
            try:
                await service.execute_transaction(operations)
                assert False, "Should have raised an exception"
            except Exception:
                print("✅ Error handling test passed")
        
        print("🎉 All transaction pooler tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Transaction pooler test failed: {e}")
        return False


async def test_integration_workflow():
    """Test complete integration workflow"""
    print("\n🔗 Testing Integration Workflow...")
    
    try:
        supabase_service = SupabaseService()
        ai_service = AIService()
        
        # Patch the cache to always return None for get and do nothing for set
        ai_service.cache.get = AsyncMock(return_value=None)
        ai_service.cache.set = AsyncMock()
        
        # Mock all external dependencies
        with patch('httpx.AsyncClient', autospec=True) as mock_httpx_cls, \
             patch('app.services.ai_service.call_gemini_api') as mock_ai:
            mock_httpx = mock_httpx_cls.return_value
            mock_httpx.__aenter__.return_value = mock_httpx
            mock_httpx.get = AsyncMock(return_value=make_async_response([{"id": 1, "clerk_user_id": "clerk_123"}]))
            mock_httpx.post = AsyncMock(return_value=make_async_response([{"id": 1}]))
            
            # Mock AI responses with proper JSON format for career recommendations
            mock_ai.side_effect = [
                # Quiz analysis response
                {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": "Integration test response"
                            }]
                        }
                    }]
                },
                # Subject recommendations response
                {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": "Mathematics, Physics, Computer Science"
                            }]
                        }
                    }]
                },
                # Career recommendations response - must be valid JSON array as text, no prefix
                {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": '[{"title": "Data Scientist", "description": "Analyzes data", "requiredSkills": ["Python", "Statistics"], "jobOutlook": "Excellent", "salaryRange": "$80k-$120k", "educationRequirements": ["Bachelor\'s degree"], "confidence": 0.9}]'
                            }]
                        }
                    }]
                },
                # Study resources response
                {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": "Khan Academy, Coursera, edX"
                            }]
                        }
                    }]
                },
                # Career report response
                {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": "Comprehensive career guidance report"
                            }]
                        }
                    }]
                }
            ]
            
            # Test complete workflow
            # 1. Get user
            user = await supabase_service.get_user_by_clerk_id("clerk_123")
            assert user["id"] == 1
            
            # 2. Analyze quiz
            analysis = await ai_service.analyze_quiz_responses("clerk_123", {"test": "data"})
            assert "Integration test response" in analysis
            
            # 3. Generate subject recommendations (to consume the correct mock)
            subjects = await ai_service.generate_subject_recommendations(
                "clerk_123", {"analysis": analysis}, ["Mathematics"]
            )
            # 4. Generate career recommendations
            careers = await ai_service.generate_career_recommendations(
                "clerk_123", {"analysis": analysis}, subjects
            )
            
            assert len(careers) == 1
            assert careers[0]["title"] == "Data Scientist"
            
            print("✅ Integration workflow test passed")
        
        print("🎉 All integration workflow tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Integration workflow test failed: {e}")
        return False


async def main():
    """Run all tests"""
    print("🚀 Starting Phase One Testing - VCE Career Guidance App")
    print("=" * 60)
    
    results = []
    
    # Run individual service tests
    results.append(("Supabase Service", await test_supabase_service()))
    results.append(("AI Service", await test_ai_service()))
    results.append(("Transaction Pooler", await test_transaction_pooler()))
    results.append(("Integration Workflow", await test_integration_workflow()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name:<25} {status}")
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {passed + failed} test categories")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed! Phase One testing completed successfully.")
        return 0
    else:
        print(f"\n⚠️  {failed} test category(ies) failed. Please review the output above.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code) 
import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, UTC
import json
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.supabase_service import SupabaseService
from backend.app.services.ai_service import AIService


class TestIntegration:
    """Integration tests for the complete workflow"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    @pytest.fixture
    def supabase_service(self):
        """Create SupabaseService instance"""
        with patch.dict('os.environ', {
            'SUPABASE_URL': 'https://test.supabase.co',
            'SUPABASE_KEY': 'test-key',
            'CLERK_JWT_ISSUER': 'https://clerk.test.com',
            'CLERK_JWT_AUDIENCE': 'test-audience'
        }):
            return SupabaseService()

    @pytest.fixture
    def ai_service(self):
        """Create AIService instance"""
        return AIService()

    @pytest.fixture
    def mock_httpx_client(self):
        """Mock httpx.AsyncClient"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value = mock_client.return_value
            yield mock_client.return_value

    @pytest.fixture
    def sample_quiz_data(self):
        """Sample quiz data for testing"""
        return {
            "interests": ["mathematics", "programming", "data analysis"],
            "strengths": ["problem-solving", "analytical thinking", "attention to detail"],
            "career_goals": ["data scientist", "software engineer", "business analyst"],
            "learning_style": "visual",
            "work_preferences": ["remote", "flexible hours", "collaborative"],
            "subject_preferences": ["Mathematics", "Physics", "Computer Science"],
            "confidence_level": 0.8
        }

    @pytest.fixture
    def sample_career_recommendations(self):
        """Sample career recommendations"""
        return [
            {
                "title": "Data Scientist",
                "description": "Analyzes and interprets complex data sets",
                "requiredSkills": ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
                "jobOutlook": "Excellent growth potential with high demand",
                "salaryRange": "$80,000 - $150,000",
                "educationRequirements": ["Bachelor's in Computer Science", "Master's preferred", "Certifications"],
                "confidence": 0.9
            },
            {
                "title": "Software Engineer",
                "description": "Designs and develops software applications",
                "requiredSkills": ["Programming", "Problem Solving", "System Design", "Version Control", "Testing"],
                "jobOutlook": "Strong demand with good growth prospects",
                "salaryRange": "$70,000 - $130,000",
                "educationRequirements": ["Bachelor's in Computer Science", "Portfolio of projects"],
                "confidence": 0.85
            }
        ]

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_complete_career_guidance_workflow(self, supabase_service, ai_service, mock_httpx_client, sample_quiz_data, sample_career_recommendations):
        """Test the complete career guidance workflow from quiz to report generation"""
        
        # Mock Supabase responses
        user_response = MagicMock()
        user_response.json.return_value = [{"id": 1, "clerk_user_id": "clerk_123", "email": "test@example.com"}]
        
        prefs_response = MagicMock()
        prefs_response.json.return_value = [{
            "export_as_pdf": True,
            "notifications": True,
            "email_updates": True,
            "dark_mode": False
        }]
        
        report_response = MagicMock()
        report_response.json.return_value = [{"id": 1, "title": "Career Guidance Report"}]
        
        mock_httpx_client.get.side_effect = [user_response, prefs_response]
        mock_httpx_client.post.return_value = report_response
        
        # Mock AI service responses
        with patch.object(ai_service, '_call_gemini_with_retry') as mock_ai:
            mock_ai.side_effect = [
                # Quiz analysis response
                {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": "Analysis shows strong analytical and problem-solving skills"
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
                # Career recommendations response
                {
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": json.dumps(sample_career_recommendations)
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
            
            # Step 1: Get user preferences
            preferences = await supabase_service.get_user_preferences("clerk_123")
            assert preferences['exportAsPdf'] is True
            
            # Step 2: Analyze quiz responses
            analysis = await ai_service.analyze_quiz_responses("clerk_123", sample_quiz_data)
            assert "analytical" in analysis.lower()
            
            # Step 3: Generate subject recommendations
            subjects = await ai_service.generate_subject_recommendations(
                "clerk_123", 
                {"analysis": analysis}, 
                ["Mathematics"]
            )
            assert "Mathematics" in subjects
            
            # Step 4: Generate career recommendations
            careers = await ai_service.generate_career_recommendations(
                "clerk_123",
                {"analysis": analysis},
                subjects
            )
            assert len(careers) == 2
            assert careers[0]["title"] == "Data Scientist"
            
            # Step 5: Generate study resources
            resources = await ai_service.generate_study_resources(
                "clerk_123",
                subjects,
                [career["title"] for career in careers]
            )
            assert "Khan Academy" in resources
            
            # Step 6: Generate career report
            report = await ai_service.generate_career_report(
                "clerk_123",
                [career["title"] for career in careers],
                {"analysis": analysis}
            )
            assert "report" in report
            assert report["user_id"] == "clerk_123"
            
            # Step 7: Save report to database
            saved_report = await supabase_service.save_career_report("clerk_123", report)
            assert saved_report["title"] == "Career Guidance Report"

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_transaction_pooler_with_multiple_operations(self, supabase_service, mock_httpx_client):
        """Test transaction pooler with multiple related operations"""
        
        operations = [
            {
                "type": "insert",
                "table": "users",
                "data": {
                    "clerk_user_id": "clerk_456",
                    "email": "newuser@example.com",
                    "first_name": "Jane",
                    "last_name": "Doe"
                }
            },
            {
                "type": "insert",
                "table": "user_preferences",
                "data": {
                    "user_id": "{{users.id}}",
                    "export_as_pdf": True,
                    "notifications": True,
                    "email_updates": True,
                    "dark_mode": False
                }
            },
            {
                "type": "insert",
                "table": "quiz_sessions",
                "data": {
                    "user_id": "{{users.id}}",
                    "quiz_type": "career_guidance",
                    "status": "completed",
                    "created_at": "{{timestamp}}"
                }
            }
        ]
        
        # Mock responses for each operation
        mock_responses = [
            MagicMock(json=lambda: [{"id": 2, "clerk_user_id": "clerk_456"}]),
            MagicMock(json=lambda: [{"id": 3, "user_id": 2}]),
            MagicMock(json=lambda: [{"id": 4, "user_id": 2, "quiz_type": "career_guidance"}])
        ]
        mock_httpx_client.post.side_effect = mock_responses
        
        # Execute transaction
        results = await supabase_service.execute_transaction(operations)
        
        assert len(results) == 3
        assert results[0]["id"] == 2
        assert results[1]["user_id"] == 2
        assert results[2]["user_id"] == 2

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_ai_service_with_caching(self, ai_service):
        """Test AI service with caching functionality"""
        
        with patch.object(ai_service, '_call_gemini_with_retry') as mock_ai:
            mock_ai.return_value = {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "Cached analysis result"
                        }]
                    }
                }]
            }
            
            # First call should hit the API
            result1 = await ai_service.analyze_quiz_responses("user123", {"test": "data"})
            assert result1 == "Cached analysis result"
            assert mock_ai.call_count == 1
            
            # Second call should use cache
            result2 = await ai_service.analyze_quiz_responses("user123", {"test": "data"})
            assert result2 == "Cached analysis result"
            # Should still be 1 call since second should use cache
            assert mock_ai.call_count == 1

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_error_handling_and_recovery(self, supabase_service, ai_service, mock_httpx_client):
        """Test error handling and recovery in the integration"""
        
        # Mock Supabase to fail first, then succeed
        user_response = MagicMock()
        user_response.json.return_value = [{"id": 1, "clerk_user_id": "clerk_789"}]
        
        mock_httpx_client.get.side_effect = [
            httpx.HTTPStatusError("Temporary error", request=MagicMock(), response=MagicMock()),
            user_response
        ]
        
        # First call should fail
        with pytest.raises(httpx.HTTPStatusError):
            await supabase_service.get_user_by_clerk_id("clerk_789")
        
        # Second call should succeed
        user = await supabase_service.get_user_by_clerk_id("clerk_789")
        assert user["id"] == 1

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_concurrent_user_operations(self, supabase_service, mock_httpx_client):
        """Test concurrent operations for multiple users"""
        
        # Mock responses for multiple users
        user_responses = [
            MagicMock(json=lambda: [{"id": i, "clerk_user_id": f"clerk_{i}"}])
            for i in range(1, 6)
        ]
        mock_httpx_client.get.side_effect = user_responses
        
        # Create concurrent tasks
        async def get_user(user_id):
            return await supabase_service.get_user_by_clerk_id(user_id)
        
        tasks = [
            get_user(f"clerk_{i}")
            for i in range(1, 6)
        ]
        
        results = await asyncio.gather(*tasks)
        
        assert len(results) == 5
        for i, result in enumerate(results, 1):
            assert result["id"] == i
            assert result["clerk_user_id"] == f"clerk_{i}"

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_data_consistency_across_services(self, supabase_service, ai_service, mock_httpx_client):
        """Test data consistency across Supabase and AI services"""
        
        # Mock user data
        user_response = MagicMock()
        user_response.json.return_value = [{"id": 1, "clerk_user_id": "clerk_consistency", "email": "consistency@test.com"}]
        mock_httpx_client.get.return_value = user_response
        
        # Get user from Supabase
        user = await supabase_service.get_user_by_clerk_id("clerk_consistency")
        assert user["email"] == "consistency@test.com"
        
        # Use same user ID in AI service
        with patch.object(ai_service, '_call_gemini_with_retry') as mock_ai:
            mock_ai.return_value = {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "Consistent analysis"
                        }]
                    }
                }]
            }
            
            analysis = await ai_service.analyze_quiz_responses("clerk_consistency", {"test": "data"})
            assert "Consistent" in analysis

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_performance_under_load(self, supabase_service, mock_httpx_client):
        """Test performance under load with multiple concurrent operations"""
        
        # Mock responses for bulk operations
        mock_responses = [
            MagicMock(json=lambda: [{"id": i, "name": f"User{i}"}])
            for i in range(1, 101)
        ]
        mock_httpx_client.post.side_effect = mock_responses
        
        # Create 100 concurrent insert operations
        operations = [
            {
                "type": "insert",
                "table": "users",
                "data": {"name": f"User{i}", "email": f"user{i}@example.com"}
            }
            for i in range(1, 101)
        ]
        
        start_time = datetime.now(UTC)
        results = await supabase_service.execute_transaction(operations)
        end_time = datetime.now(UTC)
        
        execution_time = (end_time - start_time).total_seconds()
        
        assert len(results) == 100
        assert execution_time < 10.0  # Should complete within 10 seconds

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_memory_usage_optimization(self, supabase_service, mock_httpx_client):
        """Test memory usage optimization during large operations"""
        
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Create large dataset
        large_operations = [
            {
                "type": "insert",
                "table": "test_data",
                "data": {
                    "id": i,
                    "data": "x" * 1000,  # 1KB per record
                    "timestamp": "{{timestamp}}"
                }
            }
            for i in range(1, 1001)
        ]
        
        # Mock responses
        mock_responses = [
            MagicMock(json=lambda: [{"id": i, "status": "inserted"}])
            for i in range(1, 1001)
        ]
        mock_httpx_client.post.side_effect = mock_responses
        
        # Execute operations
        results = await supabase_service.execute_transaction(large_operations)
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        assert len(results) == 1000
        # Memory increase should be reasonable (less than 50MB for 1000 1KB records)
        assert memory_increase < 50 * 1024 * 1024

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_api_endpoint_integration(self, client):
        """Test API endpoints integration"""
        
        # Test health check endpoint
        response = client.get("/health")
        assert response.status_code == 200
        
        # Test preferences endpoint (with mocked auth)
        with patch('app.middleware.clerk_auth.verify_token') as mock_auth:
            mock_auth.return_value = {"sub": "test_user", "email": "test@example.com"}
            
            response = client.get("/api/preferences")
            assert response.status_code in [200, 404]  # 404 if user doesn't exist

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_error_propagation_across_services(self, supabase_service, ai_service, mock_httpx_client):
        """Test error propagation across services"""
        
        # Mock AI service to fail
        with patch.object(ai_service, '_call_gemini_with_retry') as mock_ai:
            mock_ai.side_effect = Exception("AI service unavailable")
            
            # Test that AI errors are properly handled
            with pytest.raises(Exception, match="AI service unavailable"):
                await ai_service.analyze_quiz_responses("user123", {"test": "data"})
        
        # Mock Supabase to fail
        mock_httpx_client.get.side_effect = httpx.HTTPStatusError(
            "Database connection failed", request=MagicMock(), response=MagicMock()
        )
        
        # Test that Supabase errors are properly handled
        with pytest.raises(httpx.HTTPStatusError):
            await supabase_service.get_user_by_clerk_id("user123")

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_data_validation_across_services(self, supabase_service, ai_service, mock_httpx_client):
        """Test data validation across services"""
        
        # Test invalid user ID
        mock_httpx_client.get.return_value = MagicMock(json=lambda: [])
        
        user = await supabase_service.get_user_by_clerk_id("invalid_user")
        assert user is None
        
        # Test invalid quiz data
        with patch.object(ai_service, '_call_gemini_with_retry') as mock_ai:
            mock_ai.return_value = {
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "Invalid JSON response"
                        }]
                    }
                }]
            }
            
            # This should handle the invalid response gracefully
            result = await ai_service.analyze_quiz_responses("user123", {})
            assert "Invalid JSON response" in result 
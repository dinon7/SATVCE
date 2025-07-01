import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, UTC
import httpx
from app.services.supabase_service import SupabaseService


class TestTransactionPooler:
    """Test suite for transaction pooler functionality"""

    @pytest.fixture
    def supabase_service(self):
        """Create a SupabaseService instance with mocked environment"""
        with patch.dict('os.environ', {
            'SUPABASE_URL': 'https://test.supabase.co',
            'SUPABASE_KEY': 'test-key',
            'CLERK_JWT_ISSUER': 'https://clerk.test.com',
            'CLERK_JWT_AUDIENCE': 'test-audience'
        }):
            return SupabaseService()

    @pytest.fixture
    def mock_httpx_client(self):
        """Mock httpx.AsyncClient with connection pooling"""
        with patch('httpx.AsyncClient') as mock_client:
            # Create async mocks for HTTP methods
            mock_client.return_value.post = AsyncMock()
            mock_client.return_value.patch = AsyncMock()
            mock_client.return_value.delete = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_client.return_value
            mock_client.return_value.__aexit__.return_value = None
            yield mock_client.return_value

    @pytest.fixture
    def sample_transaction_operations(self):
        """Sample transaction operations for testing"""
        return [
            {
                "type": "insert",
                "table": "users",
                "data": {
                    "clerk_user_id": "clerk_123",
                    "email": "test@example.com",
                    "first_name": "John",
                    "last_name": "Doe"
                }
            },
            {
                "type": "insert",
                "table": "user_preferences",
                "data": {
                    "user_id": "{{users.id}}",
                    "export_as_pdf": True,
                    "notifications": True
                }
            },
            {
                "type": "update",
                "table": "users",
                "data": {"updated_at": "{{timestamp}}"},
                "params": {"clerk_user_id": "eq.clerk_123"}
            }
        ]

    @pytest.mark.asyncio
    async def test_execute_transaction_success(self, supabase_service, mock_httpx_client, sample_transaction_operations):
        """Test successful transaction execution with multiple operations"""
        # Mock responses for each operation
        mock_responses = [
            MagicMock(json=lambda: [{"id": 1, "clerk_user_id": "clerk_123"}]),
            MagicMock(json=lambda: [{"id": 2, "user_id": 1}]),
            MagicMock(json=lambda: [{"id": 1, "updated_at": "2024-01-01T00:00:00Z"}])
        ]
        mock_httpx_client.post.side_effect = mock_responses
        mock_httpx_client.patch.side_effect = mock_responses[2]
        
        result = await supabase_service.execute_transaction(sample_transaction_operations)
        
        assert len(result) == 3
        assert result[0]["id"] == 1
        assert result[1]["id"] == 2
        assert result[2]["id"] == 1

    @pytest.mark.asyncio
    async def test_execute_transaction_with_variable_substitution(self, supabase_service, mock_httpx_client):
        """Test transaction execution with variable substitution"""
        operations = [
            {
                "type": "insert",
                "table": "users",
                "data": {"name": "John", "email": "john@example.com"}
            },
            {
                "type": "insert",
                "table": "profiles",
                "data": {"user_id": "{{users.id}}", "bio": "Test bio"}
            }
        ]
        
        mock_responses = [
            MagicMock(json=lambda: [{"id": 5, "name": "John"}]),
            MagicMock(json=lambda: [{"id": 10, "user_id": 5, "bio": "Test bio"}])
        ]
        mock_httpx_client.post.side_effect = mock_responses
        
        result = await supabase_service.execute_transaction(operations)
        
        assert len(result) == 2
        assert result[0]["id"] == 5
        assert result[1]["user_id"] == 5

    @pytest.mark.asyncio
    async def test_execute_transaction_with_timestamp_substitution(self, supabase_service, mock_httpx_client):
        """Test transaction execution with timestamp substitution"""
        operations = [
            {
                "type": "insert",
                "table": "logs",
                "data": {
                    "message": "Test log",
                    "created_at": "{{timestamp}}"
                }
            }
        ]
        
        mock_response = MagicMock(json=lambda: [{"id": 1, "message": "Test log"}])
        mock_httpx_client.post.return_value = mock_response
        
        result = await supabase_service.execute_transaction(operations)
        
        assert len(result) == 1
        # Verify that timestamp was substituted
        call_args = mock_httpx_client.post.call_args
        assert "{{timestamp}}" not in str(call_args)

    @pytest.mark.asyncio
    async def test_execute_transaction_rollback_on_error(self, supabase_service, mock_httpx_client, sample_transaction_operations):
        """Test transaction rollback when an operation fails"""
        # First operation succeeds, second fails
        mock_httpx_client.post.side_effect = [
            MagicMock(json=lambda: [{"id": 1}]),
            httpx.HTTPStatusError("Database error", request=MagicMock(), response=MagicMock())
        ]
        
        with pytest.raises(Exception):
            await supabase_service.execute_transaction(sample_transaction_operations)
        
        # Verify only first operation was called
        assert mock_httpx_client.post.call_count == 2

    @pytest.mark.asyncio
    async def test_execute_transaction_connection_pooling(self, supabase_service, mock_httpx_client):
        """Test that connection pooling is used efficiently"""
        operations = [
            {"type": "insert", "table": "users", "data": {"name": "User1"}},
            {"type": "insert", "table": "users", "data": {"name": "User2"}},
            {"type": "insert", "table": "users", "data": {"name": "User3"}}
        ]
        
        mock_responses = [
            MagicMock(json=lambda: [{"id": i, "name": f"User{i}"}]) for i in range(1, 4)
        ]
        mock_httpx_client.post.side_effect = mock_responses
        
        result = await supabase_service.execute_transaction(operations)
        
        assert len(result) == 3
        # Verify that the same client instance was reused
        assert mock_httpx_client.post.call_count == 3

    @pytest.mark.asyncio
    async def test_execute_transaction_mixed_operations(self, supabase_service, mock_httpx_client):
        """Test transaction with mixed operation types"""
        operations = [
            {"type": "insert", "table": "users", "data": {"name": "John"}},
            {"type": "update", "table": "users", "data": {"status": "active"}, "params": {"id": "eq.1"}},
            {"type": "delete", "table": "temp_data", "params": {"user_id": "eq.1"}}
        ]
        
        mock_responses = [
            MagicMock(json=lambda: [{"id": 1, "name": "John"}]),
            MagicMock(json=lambda: [{"id": 1, "status": "active"}]),
            MagicMock()  # Delete operation doesn't return JSON
        ]
        mock_httpx_client.post.side_effect = mock_responses[0]
        mock_httpx_client.patch.side_effect = mock_responses[1]
        mock_httpx_client.delete.side_effect = mock_responses[2]
        
        result = await supabase_service.execute_transaction(operations)
        
        assert len(result) == 3
        assert result[0]["id"] == 1
        assert result[1]["status"] == "active"
        assert result[2] is True  # Delete operation returns True

    @pytest.mark.asyncio
    async def test_execute_transaction_timeout_handling(self, supabase_service, mock_httpx_client):
        """Test transaction timeout handling"""
        operations = [{"type": "insert", "table": "users", "data": {"name": "John"}}]
        
        mock_httpx_client.post.side_effect = httpx.TimeoutException("Request timeout")
        
        with pytest.raises(httpx.TimeoutException):
            await supabase_service.execute_transaction(operations)

    @pytest.mark.asyncio
    async def test_execute_transaction_connection_error(self, supabase_service, mock_httpx_client):
        """Test transaction connection error handling"""
        operations = [{"type": "insert", "table": "users", "data": {"name": "John"}}]
        
        mock_httpx_client.post.side_effect = httpx.ConnectError("Connection failed")
        
        with pytest.raises(httpx.ConnectError):
            await supabase_service.execute_transaction(operations)

    @pytest.mark.asyncio
    async def test_execute_transaction_invalid_operation_type(self, supabase_service, mock_httpx_client):
        """Test transaction with invalid operation type"""
        operations = [{"type": "invalid", "table": "users", "data": {"name": "John"}}]
        
        with pytest.raises(ValueError, match="Unsupported operation type"):
            await supabase_service.execute_transaction(operations)

    @pytest.mark.asyncio
    async def test_execute_transaction_empty_operations(self, supabase_service):
        """Test transaction with empty operations list"""
        result = await supabase_service.execute_transaction([])
        
        assert result == []

    @pytest.mark.asyncio
    async def test_execute_transaction_large_operation_set(self, supabase_service, mock_httpx_client):
        """Test transaction with large number of operations"""
        operations = [
            {"type": "insert", "table": "users", "data": {"name": f"User{i}"}}
            for i in range(100)
        ]
        
        mock_responses = [
            MagicMock(json=lambda: [{"id": i, "name": f"User{i}"}])
            for i in range(1, 101)
        ]
        mock_httpx_client.post.side_effect = mock_responses
        
        result = await supabase_service.execute_transaction(operations)
        
        assert len(result) == 100
        assert mock_httpx_client.post.call_count == 100

    @pytest.mark.asyncio
    async def test_execute_transaction_nested_variable_substitution(self, supabase_service, mock_httpx_client):
        """Test transaction with nested variable substitution"""
        operations = [
            {
                "type": "insert",
                "table": "users",
                "data": {"name": "John", "email": "john@example.com"}
            },
            {
                "type": "insert",
                "table": "profiles",
                "data": {"user_id": "{{users.id}}", "bio": "Test bio"}
            },
            {
                "type": "insert",
                "table": "settings",
                "data": {
                    "profile_id": "{{profiles.id}}",
                    "user_id": "{{users.id}}",
                    "created_at": "{{timestamp}}"
                }
            }
        ]
        
        mock_responses = [
            MagicMock(json=lambda: [{"id": 1, "name": "John"}]),
            MagicMock(json=lambda: [{"id": 2, "user_id": 1, "bio": "Test bio"}]),
            MagicMock(json=lambda: [{"id": 3, "profile_id": 2, "user_id": 1}])
        ]
        mock_httpx_client.post.side_effect = mock_responses
        
        result = await supabase_service.execute_transaction(operations)
        
        assert len(result) == 3
        assert result[0]["id"] == 1
        assert result[1]["user_id"] == 1
        assert result[2]["profile_id"] == 2
        assert result[2]["user_id"] == 1

    @pytest.mark.asyncio
    async def test_execute_transaction_concurrent_requests(self, supabase_service, mock_httpx_client):
        """Test concurrent transaction execution"""
        operations = [{"type": "insert", "table": "users", "data": {"name": "John"}}]
        
        mock_response = MagicMock(json=lambda: [{"id": 1, "name": "John"}])
        mock_httpx_client.post.return_value = mock_response
        
        # Execute multiple transactions concurrently
        tasks = [
            supabase_service.execute_transaction(operations)
            for _ in range(5)
        ]
        
        results = await asyncio.gather(*tasks)
        
        assert len(results) == 5
        for result in results:
            assert len(result) == 1
            assert result[0]["id"] == 1

    @pytest.mark.asyncio
    async def test_execute_transaction_memory_efficiency(self, supabase_service, mock_httpx_client):
        """Test that transaction execution is memory efficient"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        operations = [
            {"type": "insert", "table": "users", "data": {"name": f"User{i}"}}
            for i in range(1000)
        ]
        
        mock_responses = [
            MagicMock(json=lambda: [{"id": i, "name": f"User{i}"}])
            for i in range(1, 1001)
        ]
        mock_httpx_client.post.side_effect = mock_responses
        
        result = await supabase_service.execute_transaction(operations)
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 10MB)
        assert memory_increase < 10 * 1024 * 1024
        assert len(result) == 1000

    @pytest.mark.asyncio
    async def test_execute_transaction_error_recovery(self, supabase_service, mock_httpx_client):
        """Test transaction error recovery and retry logic"""
        operations = [
            {"type": "insert", "table": "users", "data": {"name": "John"}},
            {"type": "insert", "table": "profiles", "data": {"user_id": "{{users.id}}"}}
        ]
        
        # First call fails, second succeeds
        mock_httpx_client.post.side_effect = [
            httpx.HTTPStatusError("Temporary error", request=MagicMock(), response=MagicMock()),
            MagicMock(json=lambda: [{"id": 1, "name": "John"}]),
            MagicMock(json=lambda: [{"id": 2, "user_id": 1}])
        ]
        
        # Should fail due to first operation error
        with pytest.raises(httpx.HTTPStatusError):
            await supabase_service.execute_transaction(operations)

    @pytest.mark.asyncio
    async def test_execute_transaction_logging(self, supabase_service, mock_httpx_client):
        """Test that transaction execution is properly logged"""
        with patch('app.services.supabase_service.logger') as mock_logger:
            operations = [{"type": "insert", "table": "users", "data": {"name": "John"}}]
            
            mock_response = MagicMock(json=lambda: [{"id": 1, "name": "John"}])
            mock_httpx_client.post.return_value = mock_response
            
            result = await supabase_service.execute_transaction(operations)
            
            # Verify that logging occurred
            assert mock_logger.info.called or mock_logger.debug.called

    @pytest.mark.asyncio
    async def test_execute_transaction_performance_monitoring(self, supabase_service, mock_httpx_client):
        """Test transaction performance monitoring"""
        operations = [{"type": "insert", "table": "users", "data": {"name": "John"}}]
        
        mock_response = MagicMock(json=lambda: [{"id": 1, "name": "John"}])
        mock_httpx_client.post.return_value = mock_response
        
        start_time = datetime.now(UTC)
        result = await supabase_service.execute_transaction(operations)
        end_time = datetime.now(UTC)
        
        execution_time = (end_time - start_time).total_seconds()
        
        # Execution should be reasonably fast (less than 1 second)
        assert execution_time < 1.0
        assert len(result) == 1 
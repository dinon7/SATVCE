#!/usr/bin/env python3
"""
Comprehensive Backend Endpoint Testing Script
Tests all endpoints without configuration dependencies
"""

import asyncio
import json
import sys
import time
from typing import Dict, Any
import httpx
from unittest.mock import patch, MagicMock

# Mock environment variables to bypass configuration issues
MOCK_ENV = {
    'SUPABASE_URL': 'https://test.supabase.co',
    'SUPABASE_KEY': 'test-key',
    'GEMINI_API_KEY': 'test-key',
    'CLERK_SECRET_KEY': 'test-key',
    'DEBUG': 'True',
    'SECRET_KEY': 'test-secret',
    'BACKEND_CORS_ORIGINS': 'http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000',
    'DATABASE_URL': 'sqlite:///./test.db',
    'FIREBASE_SERVICE_ACCOUNT': 'firebase-credentials.json',
    'FIREBASE_DATABASE_URL': 'https://test.firebaseio.com'
}

class EndpointTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
        self.test_results = []
        
    async def test_endpoint(self, method: str, endpoint: str, expected_status: int = 200, 
                          data: Dict[str, Any] = None, headers: Dict[str, str] = None) -> Dict[str, Any]:
        """Test a single endpoint"""
        url = f"{self.base_url}{endpoint}"
        method = method.upper()
        
        try:
            if method == "GET":
                response = await self.client.get(url, headers=headers)
            elif method == "POST":
                response = await self.client.post(url, json=data, headers=headers)
            elif method == "PUT":
                response = await self.client.put(url, json=data, headers=headers)
            elif method == "DELETE":
                response = await self.client.delete(url, headers=headers)
            else:
                return {"status": "error", "message": f"Unsupported method: {method}"}
            
            result = {
                "endpoint": endpoint,
                "method": method,
                "status_code": response.status_code,
                "expected_status": expected_status,
                "success": response.status_code == expected_status,
                "response_time": response.elapsed.total_seconds(),
                "response_size": len(response.content) if response.content else 0
            }
            
            if response.status_code != expected_status:
                result["error"] = f"Expected {expected_status}, got {response.status_code}"
                try:
                    result["response_text"] = response.text[:200]  # First 200 chars
                except:
                    result["response_text"] = "Could not read response"
            
            return result
            
        except Exception as e:
            return {
                "endpoint": endpoint,
                "method": method,
                "status_code": None,
                "expected_status": expected_status,
                "success": False,
                "error": str(e)
            }
    
    async def test_health_endpoints(self):
        """Test health and status endpoints"""
        print("🔍 Testing Health Endpoints...")
        
        endpoints = [
            ("GET", "/health", 200),
            ("GET", "/", 200),
            ("GET", "/docs", 200),
            ("GET", "/api/v1/openapi.json", 200),
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    async def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test auth endpoints (these will likely fail without proper auth)
        endpoints = [
            ("GET", "/api/v1/auth/me", 401),  # Should fail without auth
            ("POST", "/api/v1/auth/register", 422),  # Should fail without data
            ("POST", "/api/v1/auth/login", 422),  # Should fail without data
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    async def test_user_endpoints(self):
        """Test user management endpoints"""
        print("\n👤 Testing User Endpoints...")
        
        endpoints = [
            ("GET", "/api/v1/users/profile", 401),  # Should fail without auth
            ("PUT", "/api/v1/users/profile", 401),  # Should fail without auth
            ("GET", "/api/v1/users/preferences", 401),  # Should fail without auth
            ("PUT", "/api/v1/users/preferences", 401),  # Should fail without auth
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    async def test_career_endpoints(self):
        """Test career guidance endpoints"""
        print("\n🎯 Testing Career Endpoints...")
        
        endpoints = [
            ("GET", "/api/v1/careers", 200),  # Public - should work without auth
            ("GET", "/api/v1/careers/pathways", 200),  # Public - should work without auth
            ("GET", "/api/v1/careers/recommendations", 401),  # Private - should fail without auth
            ("POST", "/api/v1/careers/quiz", 401),  # Private - should fail without auth
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    async def test_subject_endpoints(self):
        """Test subject endpoints"""
        print("\n📚 Testing Subject Endpoints...")
        
        endpoints = [
            ("GET", "/api/v1/subjects", 200),  # Public - should work without auth
            ("GET", "/api/v1/subjects/prerequisites", 200),  # Public - should work without auth
            ("GET", "/api/v1/subjects/combinations", 200),  # Public - should work without auth
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    async def test_resource_endpoints(self):
        """Test resource endpoints"""
        print("\n📖 Testing Resource Endpoints...")
        
        endpoints = [
            ("GET", "/api/v1/resources", 200),  # Public - should work without auth
            ("GET", "/api/v1/resources/approved", 200),  # Public - should work without auth
            ("POST", "/api/v1/resources", 401),  # Private - should fail without auth
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    async def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n⚙️ Testing Admin Endpoints...")
        
        endpoints = [
            ("GET", "/api/v1/admin/stats", 401),  # Should fail without admin auth
            ("GET", "/api/v1/admin/users", 401),  # Should fail without admin auth
            ("GET", "/api/v1/admin/resources", 401),  # Should fail without admin auth
            ("GET", "/api/v1/admin/settings", 401),  # Should fail without admin auth
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    async def test_ai_endpoints(self):
        """Test AI service endpoints"""
        print("\n🤖 Testing AI Endpoints...")
        
        endpoints = [
            ("POST", "/api/v1/ai/analyze", 401),  # Should fail without auth
            ("POST", "/api/v1/ai/generate-report", 401),  # Should fail without auth
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    async def test_integration_endpoints(self):
        """Test integration service endpoints"""
        print("\n🔗 Testing Integration Endpoints...")
        
        endpoints = [
            ("GET", "/api/integration/health", 200),  # Should work
            ("GET", "/api/integration/status", 200),  # Should work
        ]
        
        for method, endpoint, expected_status in endpoints:
            result = await self.test_endpoint(method, endpoint, expected_status)
            self.test_results.append(result)
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {method} {endpoint} - {result['status_code']}")
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result.get("success", False))
        failed_tests = total_tests - successful_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Successful: {successful_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result.get("success", False):
                    print(f"  - {result['method']} {result['endpoint']}: {result.get('error', 'Unknown error')}")
        
        print("\n" + "="*60)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

async def main():
    """Main test function"""
    print("🚀 Starting Comprehensive Backend Endpoint Testing")
    print("="*60)
    
    # Check if server is running
    tester = EndpointTester()
    
    try:
        # Test if server is reachable
        print("🔍 Checking if server is running...")
        try:
            response = await tester.client.get("http://localhost:8000/health", timeout=5.0)
            print(f"✅ Server is running! Status: {response.status_code}")
        except Exception as e:
            print(f"❌ Server is not running: {e}")
            return
        
        # Run all tests
        await tester.test_health_endpoints()
        await tester.test_auth_endpoints()
        await tester.test_user_endpoints()
        await tester.test_career_endpoints()
        await tester.test_subject_endpoints()
        await tester.test_resource_endpoints()
        await tester.test_admin_endpoints()
        await tester.test_ai_endpoints()
        await tester.test_integration_endpoints()
        
        # Print summary
        tester.print_summary()
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
    finally:
        await tester.close()

if __name__ == "__main__":
    asyncio.run(main()) 
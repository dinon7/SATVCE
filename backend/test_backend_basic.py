#!/usr/bin/env python3
"""
Basic Backend Testing Script
Tests core functionality without external dependencies
"""

import sys
import os
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

TEST_RESULTS = []

def log_test(test_name, status, details=""):
    """Log test results"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    result = "✅ PASS" if status else "❌ FAIL"
    print(f"[{timestamp}] {test_name}: {result}")
    if details:
        print(f"    Details: {details}")
    TEST_RESULTS.append((test_name, status, details))

def test_imports():
    """Test if all required modules can be imported"""
    print("\n🔍 Testing Module Imports...")
    
    # Test core imports
    try:
        from app.core.config import settings
        log_test("Settings Import", True, f"Project: {settings.PROJECT_NAME}")
    except Exception as e:
        log_test("Settings Import", False, f"Error: {str(e)}")
    
    # Test database models
    try:
        from db.models import User, CareerReport, UserPreference, Subject, Resource, Suggestion
        log_test("Database Models Import", True, "All models imported successfully")
    except Exception as e:
        log_test("Database Models Import", False, f"Error: {str(e)}")
    
    # Test services
    services = [
        'supabase_service',
        'ai_service', 
        'integration_service',
        'auth',
        'user_service'
    ]
    
    for service in services:
        try:
            module = __import__(f'app.services.{service}', fromlist=['*'])
            log_test(f"Service Import: {service}", True, "Imported successfully")
        except Exception as e:
            log_test(f"Service Import: {service}", False, f"Error: {str(e)}")

def test_database_connection():
    """Test database connection"""
    print("\n🔍 Testing Database Connection...")
    
    try:
        from db.database import engine, SessionLocal
        log_test("Database Engine", True, "Engine created successfully")
        
        # Test if we can create a session
        try:
            db = SessionLocal()
            db.close()
            log_test("Database Session", True, "Session created and closed successfully")
        except Exception as e:
            log_test("Database Session", False, f"Error: {str(e)}")
            
    except Exception as e:
        log_test("Database Engine", False, f"Error: {str(e)}")

def test_environment_variables():
    """Test environment variables"""
    print("\n🔍 Testing Environment Variables...")
    
    required_vars = [
        'DATABASE_URL',
        'SECRET_KEY',
        'AI_API_KEY',
        'SUPABASE_URL',
        'SUPABASE_KEY'
    ]
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'KEY' in var or 'SECRET' in var:
                masked_value = value[:8] + "..." if len(value) > 8 else "***"
                log_test(f"Env Var: {var}", True, f"Present: {masked_value}")
            else:
                log_test(f"Env Var: {var}", True, f"Present: {value}")
        else:
            log_test(f"Env Var: {var}", False, "Missing")

def test_fastapi_app():
    """Test FastAPI app creation"""
    print("\n🔍 Testing FastAPI App...")
    
    try:
        from app.main import app
        log_test("FastAPI App Import", True, f"App title: {app.title}")
        
        # Check if app has expected attributes
        if hasattr(app, 'routes'):
            log_test("FastAPI Routes", True, f"Found {len(app.routes)} routes")
        else:
            log_test("FastAPI Routes", False, "No routes found")
            
    except Exception as e:
        log_test("FastAPI App Import", False, f"Error: {str(e)}")

def test_endpoint_definitions():
    """Test if key endpoints are defined"""
    print("\n🔍 Testing Endpoint Definitions...")
    
    try:
        from app.main import app
        
        # Check for key endpoints
        expected_endpoints = [
            '/',
            '/health',
            '/api/health',
            '/docs'
        ]
        
        routes = [route.path for route in app.routes]
        
        for endpoint in expected_endpoints:
            if endpoint in routes:
                log_test(f"Endpoint: {endpoint}", True, "Found")
            else:
                log_test(f"Endpoint: {endpoint}", False, "Not found")
                
    except Exception as e:
        log_test("Endpoint Definitions", False, f"Error: {str(e)}")

def test_configuration():
    """Test configuration settings"""
    print("\n🔍 Testing Configuration...")
    
    try:
        from app.core.config import settings
        
        # Check required settings
        required_settings = [
            'PROJECT_NAME',
            'API_V1_STR',
            'DATABASE_URL',
            'SECRET_KEY'
        ]
        
        for setting in required_settings:
            if hasattr(settings, setting):
                value = getattr(settings, setting)
                if 'KEY' in setting or 'SECRET' in setting:
                    masked_value = value[:8] + "..." if len(value) > 8 else "***"
                    log_test(f"Setting: {setting}", True, f"Present: {masked_value}")
                else:
                    log_test(f"Setting: {setting}", True, f"Value: {value}")
            else:
                log_test(f"Setting: {setting}", False, "Missing")
                
    except Exception as e:
        log_test("Configuration", False, f"Error: {str(e)}")

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("📊 BACKEND TEST SUMMARY")
    print("="*60)
    
    total_tests = len(TEST_RESULTS)
    passed_tests = sum(1 for _, status, _ in TEST_RESULTS if status)
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if failed_tests > 0:
        print("\n❌ Failed Tests:")
        for test_name, status, details in TEST_RESULTS:
            if not status:
                print(f"  - {test_name}: {details}")
    
    print("\n" + "="*60)

def main():
    """Main test function"""
    print("🚀 Starting Basic Backend Testing...")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    test_imports()
    test_database_connection()
    test_environment_variables()
    test_fastapi_app()
    test_endpoint_definitions()
    test_configuration()
    
    # Print summary
    print_summary()
    
    # Exit with appropriate code
    failed_tests = sum(1 for _, status, _ in TEST_RESULTS if not status)
    if failed_tests > 0:
        print(f"\n⚠️  {failed_tests} tests failed. Please check the issues above.")
        sys.exit(1)
    else:
        print("\n🎉 All tests passed! Backend is ready.")
        sys.exit(0)

if __name__ == "__main__":
    main() 
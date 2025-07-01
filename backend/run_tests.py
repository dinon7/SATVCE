#!/usr/bin/env python3
"""
Test runner for Phase One testing of VCE Career Guidance App
Tests Supabase functionality, AI functionality, and transaction pooler
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def setup_test_environment():
    """Setup test environment variables"""
    test_env = {
        'SUPABASE_URL': 'https://test.supabase.co',
        'SUPABASE_KEY': 'test-key',
        'CLERK_JWT_ISSUER': 'https://clerk.test.com',
        'CLERK_JWT_AUDIENCE': 'test-audience',
        'GOOGLE_APPLICATION_CREDENTIALS': 'test-credentials.json',
        'GEMINI_API_KEY': 'test-gemini-key',
        'DATABASE_URL': 'sqlite:///./test.db',
        'SECRET_KEY': 'test-secret-key',
        'BACKEND_CORS_ORIGINS': '["http://localhost:3000","http://localhost:8000"]',
        'PYTHONPATH': str(Path(__file__).parent)
    }
    
    for key, value in test_env.items():
        os.environ[key] = value
    
    return test_env

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(cmd)}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✅ SUCCESS")
        if result.stdout:
            print("Output:")
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print("❌ FAILED")
        print(f"Error code: {e.returncode}")
        if e.stdout:
            print("Stdout:")
            print(e.stdout)
        if e.stderr:
            print("Stderr:")
            print(e.stderr)
        return False

def install_test_dependencies():
    """Install test dependencies"""
    cmd = [sys.executable, '-m', 'pip', 'install', '-r', 'tests/requirements-test.txt']
    return run_command(cmd, "Installing test dependencies")

def run_unit_tests():
    """Run unit tests"""
    cmd = [
        sys.executable, '-m', 'pytest',
        'tests/test_supabase_service.py',
        'tests/test_ai_service.py',
        'tests/test_transaction_pooler.py',
        '--tb=short',
        '--cov=app/services',
        '--cov-report=term-missing',
        '--cov-report=html:htmlcov',
        '--cov-report=xml:coverage.xml'
    ]
    return run_command(cmd, "Running unit tests")

def run_integration_tests():
    """Run integration tests"""
    cmd = [
        sys.executable, '-m', 'pytest',
        'tests/test_supabase_service.py',
        'tests/test_ai_service.py',
        'tests/test_transaction_pooler.py',
        '--tb=short'
    ]
    return run_command(cmd, "Running integration tests")

def run_performance_tests():
    """Run performance tests"""
    cmd = [
        sys.executable, '-m', 'pytest',
        'tests/test_transaction_pooler.py',
        '--benchmark-only',
        '--benchmark-sort=mean'
    ]
    return run_command(cmd, "Running performance tests")

def run_supabase_tests():
    """Run Supabase-specific tests"""
    cmd = [
        sys.executable, '-m', 'pytest',
        'tests/test_supabase_service.py',
        '--tb=short',
        '-v'
    ]
    return run_command(cmd, "Running Supabase functionality tests")

def run_ai_tests():
    """Run AI-specific tests"""
    cmd = [
        sys.executable, '-m', 'pytest',
        'tests/test_ai_service.py',
        '--tb=short',
        '-v'
    ]
    return run_command(cmd, "Running AI functionality tests")

def run_transaction_tests():
    """Run transaction pooler tests"""
    cmd = [
        sys.executable, '-m', 'pytest',
        'tests/test_transaction_pooler.py',
        '--tb=short',
        '-v'
    ]
    return run_command(cmd, "Running transaction pooler tests")

def run_coverage_report():
    """Generate coverage report"""
    cmd = [
        sys.executable, '-m', 'coverage', 'report',
        '--show-missing',
        '--fail-under=80'
    ]
    return run_command(cmd, "Generating coverage report")

def run_lint_checks():
    """Run linting checks"""
    try:
        import flake8
        cmd = [sys.executable, '-m', 'flake8', 'app/', 'tests/', '--max-line-length=100']
        return run_command(cmd, "Running linting checks")
    except ImportError:
        print("⚠️  flake8 not installed, skipping linting")
        return True

def main():
    """Main test runner"""
    parser = argparse.ArgumentParser(description='Phase One Test Runner')
    parser.add_argument('--unit', action='store_true', help='Run unit tests only')
    parser.add_argument('--integration', action='store_true', help='Run integration tests only')
    parser.add_argument('--performance', action='store_true', help='Run performance tests only')
    parser.add_argument('--supabase', action='store_true', help='Run Supabase tests only')
    parser.add_argument('--ai', action='store_true', help='Run AI tests only')
    parser.add_argument('--transaction', action='store_true', help='Run transaction tests only')
    parser.add_argument('--all', action='store_true', help='Run all tests (default)')
    parser.add_argument('--no-deps', action='store_true', help='Skip dependency installation')
    parser.add_argument('--no-lint', action='store_true', help='Skip linting checks')
    
    args = parser.parse_args()
    
    print("🚀 Starting Phase One Testing - VCE Career Guidance App")
    print("=" * 60)
    
    # Setup environment
    setup_test_environment()
    
    # Track test results
    results = []
    
    # Install dependencies
    if not args.no_deps:
        results.append(("Dependencies", install_test_dependencies()))
    
    # Run linting
    if not args.no_lint:
        results.append(("Linting", run_lint_checks()))
    
    # Run specific test categories
    if args.unit:
        results.append(("Unit Tests", run_unit_tests()))
    elif args.integration:
        results.append(("Integration Tests", run_integration_tests()))
    elif args.performance:
        results.append(("Performance Tests", run_performance_tests()))
    elif args.supabase:
        results.append(("Supabase Tests", run_supabase_tests()))
    elif args.ai:
        results.append(("AI Tests", run_ai_tests()))
    elif args.transaction:
        results.append(("Transaction Tests", run_transaction_tests()))
    else:
        # Run all tests
        results.extend([
            ("Unit Tests", run_unit_tests()),
            ("Integration Tests", run_integration_tests()),
            ("Performance Tests", run_performance_tests()),
            ("Supabase Tests", run_supabase_tests()),
            ("AI Tests", run_ai_tests()),
            ("Transaction Tests", run_transaction_tests()),
        ])
    
    # Generate coverage report
    results.append(("Coverage Report", run_coverage_report()))
    
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
    
    print(f"\nTotal: {passed + failed} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed! Phase One testing completed successfully.")
        return 0
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please review the output above.")
        return 1

if __name__ == '__main__':
    sys.exit(main()) 
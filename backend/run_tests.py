import os
import sys
import pytest
from pathlib import Path

def main():
    """Run the test suite with coverage reporting"""
    # Get the project root directory
    project_root = Path(__file__).parent
    
    # Add the project root to Python path
    sys.path.insert(0, str(project_root))
    
    # Set testing environment variable
    os.environ["TESTING"] = "true"
    
    # Configure pytest arguments
    pytest_args = [
        "--cov=app",
        "--cov-report=term-missing",
        "--cov-report=html",
        "--cov-fail-under=80",
        "-v",
        str(project_root / "tests")  # Use absolute path to tests directory
    ]
    
    # Run the tests
    exit_code = pytest.main(pytest_args)
    sys.exit(exit_code)

if __name__ == "__main__":
    main() 
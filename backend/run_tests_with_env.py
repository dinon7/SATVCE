#!/usr/bin/env python3
import os
import sys
import subprocess

# Set environment variables for testing
os.environ["BACKEND_CORS_ORIGINS"] = "http://localhost:3000,http://localhost:8000"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Run pytest
result = subprocess.run([sys.executable, "-m", "pytest", "--maxfail=3", "--disable-warnings", "-q"], cwd=os.getcwd())
sys.exit(result.returncode) 
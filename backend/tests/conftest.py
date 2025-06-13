import pytest
import os
from datetime import datetime, UTC
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
from app.core.config import settings

# Set test environment variables
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://localhost:8000"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Mock Firestore client
@pytest.fixture
def mock_firestore_client():
    with patch('firebase_admin.firestore.client') as mock:
        mock_client = MagicMock()
        mock.return_value = mock_client
        yield mock_client

# Test client fixture
@pytest.fixture
def client():
    return TestClient(app)

# Test user data
@pytest.fixture
def test_user():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "name": "Test User",
        "is_admin": False
    }

# Test admin data
@pytest.fixture
def test_admin():
    return {
        "email": "admin@example.com",
        "password": "adminpassword123",
        "name": "Admin User",
        "is_admin": True
    }

# Mock authentication
@pytest.fixture
def mock_auth():
    with patch('firebase_admin.auth') as mock:
        mock.verify_id_token.return_value = {
            "uid": "test-uid",
            "email": "test@example.com"
        }
        yield mock

# Update CORS settings for testing
settings.CORS_ORIGINS = ["http://localhost:3000", "http://localhost:8000"]

@pytest.fixture(scope="session")
def test_app():
    """Create test FastAPI application"""
    return app

@pytest.fixture(scope="session")
def test_client(test_app):
    """Create test client"""
    return TestClient(test_app)

@pytest.fixture(scope="session")
def test_user():
    """Create test user data"""
    return {
        "strUserID": "test_user",
        "strEmail": "test@example.com",
        "strFirstName": "Test",
        "strLastName": "User",
        "intYearLevel": 11,
        "boolIsActive": True,
        "boolIsAdmin": False,
        "dtmCreated": datetime.now(UTC),
        "dtmUpdated": datetime.now(UTC)
    }

@pytest.fixture(scope="session")
def test_quiz_data():
    """Create test quiz data"""
    return {
        "strStudentID": "test_student",
        "dictInitialAnswers": {
            "q1": 4,
            "q2": "Yes",
            "q3": ["Mathematics", "Science"]
        },
        "arrFollowUpQuestions": [
            {"id": "f1", "text": "How interested are you in problem-solving?"},
            {"id": "f2", "text": "Do you enjoy working with numbers and data?"}
        ],
        "arrFollowUpAnswers": {
            "f1": 5,
            "f2": "Yes"
        },
        "boolQuizCompleted": True,
        "dtmCreated": datetime.now(UTC),
        "dtmUpdated": datetime.now(UTC)
    }

@pytest.fixture(scope="session")
def test_subject_data():
    """Create test subject data"""
    return {
        "strSubjectID": "test_subject",
        "strTitle": "Mathematics",
        "strDescription": "Advanced mathematics course",
        "fltATARScaling": 1.2,
        "intDifficultyRating": 4,
        "arrRelatedCareers": ["Data Scientist", "Engineer"],
        "fltPopularityScore": 0.8,
        "arrPrerequisites": ["Basic Mathematics"],
        "arrRecommendedSubjects": ["Physics", "Computer Science"],
        "dtmCreated": datetime.now(UTC),
        "dtmUpdated": datetime.now(UTC)
    }

@pytest.fixture(scope="session")
def test_career_data():
    """Create test career data"""
    return {
        "strCareerID": "test_career",
        "strTitle": "Data Scientist",
        "strDescription": "Analyzes and interprets complex data sets",
        "arrRelatedSubjects": ["Mathematics", "Computer Science"],
        "dictJobMarketData": {
            "strDemandLevel": "High",
            "strSalaryRange": "100k-150k",
            "strGrowthRate": "15%"
        },
        "fltPopularityScore": 0.9,
        "arrRequiredSkills": ["Python", "Statistics", "Machine Learning"],
        "arrCareerPath": ["Junior Data Scientist", "Senior Data Scientist", "Lead Data Scientist"],
        "dtmCreated": datetime.now(UTC),
        "dtmUpdated": datetime.now(UTC)
    } 
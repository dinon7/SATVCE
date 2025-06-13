import pytest
from unittest.mock import Mock, patch
from datetime import datetime

from app.services.career_service import CareerService
from app.schemas.career import Career, CareerCreate, CareerUpdate

@pytest.fixture
def mock_firestore_client():
    """Mock Firestore client"""
    return Mock()

@pytest.fixture
def career_service(mock_firestore_client):
    """Create CareerService instance with mocked client"""
    with patch('firebase_admin.firestore.client', return_value=mock_firestore_client):
        return CareerService()

@pytest.fixture
def test_career_data():
    """Test career data fixture"""
    return {
        "id": "test_career",
        "title": "Data Scientist",
        "description": "Analyzes and interprets complex data sets",
        "required_skills": ["Python", "Statistics", "Machine Learning"],
        "salary_range": "100k-150k",
        "demand_level": "High",
        "education_requirements": ["Bachelor's in Computer Science", "Master's in Data Science"],
        "industry": "Technology",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

@pytest.mark.asyncio
async def test_get_careers(career_service, mock_firestore_client, test_career_data):
    """Test getting all careers"""
    # Mock Firestore collection
    mock_collection = Mock()
    mock_doc = Mock()
    mock_doc.to_dict.return_value = test_career_data
    mock_collection.stream.return_value = [mock_doc]
    mock_firestore_client.collection.return_value = mock_collection
    
    careers = await career_service.get_careers()
    assert len(careers) == 1
    assert careers[0].title == test_career_data["title"]

@pytest.mark.asyncio
async def test_get_career(career_service, mock_firestore_client, test_career_data):
    """Test getting career by ID"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = test_career_data
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    career = await career_service.get_career("test_career")
    assert career.id == test_career_data["id"]
    assert career.title == test_career_data["title"]

@pytest.mark.asyncio
async def test_get_career_not_found(career_service, mock_firestore_client):
    """Test getting non-existent career"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = False
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    career = await career_service.get_career("nonexistent_career")
    assert career is None

@pytest.mark.asyncio
async def test_create_career(career_service, mock_firestore_client, test_career_data):
    """Test creating new career"""
    # Mock Firestore document reference
    mock_doc = Mock()
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    career_create = CareerCreate(
        title=test_career_data["title"],
        description=test_career_data["description"],
        required_skills=test_career_data["required_skills"],
        salary_range=test_career_data["salary_range"],
        demand_level=test_career_data["demand_level"],
        education_requirements=test_career_data["education_requirements"],
        industry=test_career_data["industry"]
    )
    
    career = await career_service.create_career(career_create)
    assert career.title == test_career_data["title"]
    assert career.description == test_career_data["description"]

@pytest.mark.asyncio
async def test_update_career(career_service, mock_firestore_client, test_career_data):
    """Test updating career"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = test_career_data
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    update_data = CareerUpdate(
        title="Senior Data Scientist",
        salary_range="150k-200k"
    )
    
    career = await career_service.update_career("test_career", update_data)
    assert career.title == "Senior Data Scientist"
    assert career.salary_range == "150k-200k"

@pytest.mark.asyncio
async def test_delete_career(career_service, mock_firestore_client):
    """Test deleting career"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = True
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    result = await career_service.delete_career("test_career")
    assert result is True

@pytest.mark.asyncio
async def test_delete_nonexistent_career(career_service, mock_firestore_client):
    """Test deleting non-existent career"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = False
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    result = await career_service.delete_career("nonexistent_career")
    assert result is False

@pytest.mark.asyncio
async def test_search_careers(career_service, mock_firestore_client, test_career_data):
    """Test searching careers"""
    # Mock Firestore collection
    mock_collection = Mock()
    mock_doc = Mock()
    mock_doc.to_dict.return_value = test_career_data
    mock_collection.stream.return_value = [mock_doc]
    mock_firestore_client.collection.return_value = mock_collection
    
    careers = await career_service.search_careers(
        query="Data",
        min_salary=80000,
        required_skills=["Python"]
    )
    assert len(careers) == 1
    assert careers[0]["strTitle"] == test_career_data["title"]

@pytest.mark.asyncio
async def test_get_career_recommendations(career_service, mock_firestore_client, test_career_data):
    """Test getting career recommendations based on subjects"""
    # Mock Firestore collection
    mock_collection = Mock()
    mock_doc = Mock()
    mock_doc.to_dict.return_value = test_career_data
    mock_collection.stream.return_value = [mock_doc]
    mock_firestore_client.collection.return_value = mock_collection
    
    subjects = ["Mathematics", "Computer Science"]
    recommendations = await career_service.get_career_recommendations(subjects)
    assert len(recommendations) == 1
    assert recommendations[0]["strTitle"] == test_career_data["title"]
    assert all(subject in recommendations[0]["arrRelatedSubjects"] for subject in subjects) 
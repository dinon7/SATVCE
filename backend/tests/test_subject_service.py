import pytest
from unittest.mock import Mock, patch
from datetime import datetime

from backend.app.services.subject_service import SubjectService
from backend.app.schemas.subject import Subject, SubjectCreate, SubjectUpdate

@pytest.fixture
def mock_firestore_client():
    """Mock Firestore client"""
    return Mock()

@pytest.fixture
def subject_service(mock_firestore_client):
    """Create SubjectService instance with mocked client"""
    with patch('firebase_admin.firestore.client', return_value=mock_firestore_client):
        return SubjectService()

@pytest.fixture
def test_subject_data():
    """Test subject data fixture"""
    return {
        "id": "test_subject",
        "name": "Mathematics",
        "description": "Advanced mathematics course",
        "year_level": 11,
        "prerequisites": ["Basic Mathematics"],
        "career_paths": ["Data Scientist", "Engineer"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

@pytest.mark.asyncio
async def test_get_subjects(subject_service, mock_firestore_client, test_subject_data):
    """Test getting all subjects"""
    # Mock Firestore collection
    mock_collection = Mock()
    mock_doc = Mock()
    mock_doc.to_dict.return_value = test_subject_data
    mock_collection.stream.return_value = [mock_doc]
    mock_firestore_client.collection.return_value = mock_collection
    
    subjects = await subject_service.get_subjects()
    assert len(subjects) == 1
    assert subjects[0].name == test_subject_data["name"]

@pytest.mark.asyncio
async def test_get_subject(subject_service, mock_firestore_client, test_subject_data):
    """Test getting subject by ID"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = test_subject_data
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    subject = await subject_service.get_subject("test_subject")
    assert subject.id == test_subject_data["id"]
    assert subject.name == test_subject_data["name"]

@pytest.mark.asyncio
async def test_get_subject_not_found(subject_service, mock_firestore_client):
    """Test getting non-existent subject"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = False
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    subject = await subject_service.get_subject("nonexistent_subject")
    assert subject is None

@pytest.mark.asyncio
async def test_create_subject(subject_service, mock_firestore_client, test_subject_data):
    """Test creating new subject"""
    # Mock Firestore document reference
    mock_doc = Mock()
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    subject_create = SubjectCreate(
        name=test_subject_data["name"],
        description=test_subject_data["description"],
        year_level=test_subject_data["year_level"],
        prerequisites=test_subject_data["prerequisites"],
        career_paths=test_subject_data["career_paths"]
    )
    
    subject = await subject_service.create_subject(subject_create)
    assert subject.name == test_subject_data["name"]
    assert subject.description == test_subject_data["description"]

@pytest.mark.asyncio
async def test_update_subject(subject_service, mock_firestore_client, test_subject_data):
    """Test updating subject"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = test_subject_data
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    update_data = SubjectUpdate(
        name="Updated Mathematics",
        year_level=12
    )
    
    subject = await subject_service.update_subject("test_subject", update_data)
    assert subject.name == "Updated Mathematics"
    assert subject.year_level == 12

@pytest.mark.asyncio
async def test_delete_subject(subject_service, mock_firestore_client):
    """Test deleting subject"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = True
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    result = await subject_service.delete_subject("test_subject")
    assert result is True

@pytest.mark.asyncio
async def test_delete_nonexistent_subject(subject_service, mock_firestore_client):
    """Test deleting non-existent subject"""
    # Mock Firestore document
    mock_doc = Mock()
    mock_doc.exists = False
    mock_firestore_client.collection.return_value.document.return_value = mock_doc
    
    result = await subject_service.delete_subject("nonexistent_subject")
    assert result is False 
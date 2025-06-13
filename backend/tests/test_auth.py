from datetime import datetime, UTC
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.models import User
from app.database.database import get_db, Base, engine
from sqlalchemy.orm import Session

# Create test database tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture
def db():
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    }

@pytest.fixture
def test_user(db: Session, test_user_data):
    user = User(**test_user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_create_user(test_user_data):
    response = client.post("/api/users/", json=test_user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_data["email"]
    assert data["full_name"] == test_user_data["full_name"]
    assert "id" in data

def test_get_user(test_user):
    response = client.get(f"/api/users/{test_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name

def test_update_user(test_user):
    update_data = {"full_name": "Updated Name"}
    response = client.put(f"/api/users/{test_user.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == update_data["full_name"]

def test_delete_user(test_user):
    response = client.delete(f"/api/users/{test_user.id}")
    assert response.status_code == 200
    response = client.get(f"/api/users/{test_user.id}")
    assert response.status_code == 404 
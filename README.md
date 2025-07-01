# NameTask API

A FastAPI-based backend service for managing courses and related data.

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd nametask
```

2. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up the database:
```bash
# Create a PostgreSQL database named 'nametask'
createdb nametask

# Run database migrations
alembic upgrade head
```

5. Configure environment variables:
Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nametask
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Swagger UI documentation: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## API Endpoints

### Courses

- `POST /courses/` - Create a new course
- `GET /courses/` - List all courses
- `GET /courses/{course_id}` - Get a specific course
- `PUT /courses/{course_id}` - Update a course
- `DELETE /courses/{course_id}` - Delete a course

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

To create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

To apply migrations:
```bash
alembic upgrade head
```

To rollback migrations:
```bash
alembic downgrade -1
``` "# VCECareerChooser" 

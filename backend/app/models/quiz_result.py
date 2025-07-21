from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class QuizResultBase(BaseModel):
    user_id: str
    answers: Dict[int, str]
    recommendations: List[str]
    score: Optional[float] = None

class QuizResultCreate(QuizResultBase):
    pass

class QuizResultUpdate(BaseModel):
    answers: Optional[Dict[int, str]] = None
    recommendations: Optional[List[str]] = None
    score: Optional[float] = None

class QuizResultInDB(QuizResultBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class QuizResult(QuizResultInDB):
    pass

async def create_quiz_result(quiz_data: QuizResultCreate) -> QuizResult:
    """Create a new quiz result."""
    try:
        from app.database.firestore import quiz_results_collection
        
        quiz_doc = {
            'user_id': quiz_data.user_id,
            'answers': quiz_data.answers,
            'recommendations': quiz_data.recommendations,
            'score': quiz_data.score,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        doc_ref = quiz_results_collection.add(quiz_doc)
        quiz_doc['id'] = doc_ref[1].id
        
        return QuizResult(**quiz_doc)
    except Exception as e:
        raise Exception(f"Failed to create quiz result: {str(e)}")

async def get_quiz_result(result_id: str) -> Optional[QuizResult]:
    """Get a quiz result by ID."""
    try:
        from app.database.firestore import quiz_results_collection
        result_doc = quiz_results_collection.document(result_id).get()
        if result_doc.exists:
            return QuizResult(**{**result_doc.to_dict(), 'id': result_doc.id})
        return None
    except Exception as e:
        raise Exception(f"Failed to get quiz result: {str(e)}")

async def get_user_quiz_results(user_id: str) -> List[QuizResult]:
    """Get all quiz results for a user."""
    try:
        from app.database.firestore import quiz_results_collection
        results = quiz_results_collection.where('user_id', '==', user_id).get()
        return [QuizResult(**{**doc.to_dict(), 'id': doc.id}) for doc in results]
    except Exception as e:
        raise Exception(f"Failed to get user quiz results: {str(e)}")

async def update_quiz_result(result_id: str, quiz_data: QuizResultUpdate) -> Optional[QuizResult]:
    """Update a quiz result."""
    try:
        from app.database.firestore import quiz_results_collection
        result_ref = quiz_results_collection.document(result_id)
        
        update_data = quiz_data.dict(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        result_ref.update(update_data)
        result_doc = result_ref.get()
        
        if result_doc.exists:
            return QuizResult(**{**result_doc.to_dict(), 'id': result_doc.id})
        return None
    except Exception as e:
        raise Exception(f"Failed to update quiz result: {str(e)}")

async def delete_quiz_result(result_id: str) -> bool:
    """Delete a quiz result."""
    try:
        from app.database.firestore import quiz_results_collection
        quiz_results_collection.document(result_id).delete()
        return True
    except Exception as e:
        raise Exception(f"Failed to delete quiz result: {str(e)}") 
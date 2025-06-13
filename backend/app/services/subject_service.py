from typing import List, Optional
from firebase_admin import db
from app.schemas.subject import Subject, SubjectCreate, SubjectUpdate

class SubjectService:
    def __init__(self):
        self.subjects_ref = db.reference('subjects')

    async def get_subjects(self) -> List[Subject]:
        """Get all subjects"""
        subjects_data = self.subjects_ref.get()
        if not subjects_data:
            return []
        return [Subject(**data) for data in subjects_data.values()]

    async def get_subject(self, subject_id: str) -> Optional[Subject]:
        """Get a specific subject by ID"""
        subject_data = self.subjects_ref.child(subject_id).get()
        if not subject_data:
            return None
        return Subject(**subject_data)

    async def create_subject(self, subject: SubjectCreate) -> Subject:
        """Create a new subject"""
        subject_data = subject.dict()
        result = self.subjects_ref.push(subject_data)
        subject_data['id'] = result.key
        return Subject(**subject_data)

    async def update_subject(self, subject_id: str, subject: SubjectUpdate) -> Optional[Subject]:
        """Update an existing subject"""
        subject_ref = self.subjects_ref.child(subject_id)
        subject_data = subject_ref.get()
        if not subject_data:
            return None
        update_data = subject.dict(exclude_unset=True)
        subject_ref.update(update_data)
        return Subject(**{**subject_data, **update_data})

    async def delete_subject(self, subject_id: str) -> bool:
        """Delete a subject"""
        subject_ref = self.subjects_ref.child(subject_id)
        subject_data = subject_ref.get()
        if not subject_data:
            return False
        subject_ref.delete()
        return True 
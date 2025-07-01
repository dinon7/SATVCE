from typing import List, Optional, Dict, Any
from ..schemas.subject import Subject, SubjectCreate, SubjectUpdate
from .supabase_service import supabase_service

class SubjectService:
    """Service for subject operations using Supabase."""
    
    def __init__(self):
        self.supabase = supabase_service
        self.strTableName = 'subjects'

    async def get_subjects(self) -> List[Subject]:
        """Get all subjects"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').execute()
            arrSubjects = objResponse.data if objResponse.data else []
            return [Subject(**objSubject) for objSubject in arrSubjects]
        except Exception as objErr:
            raise Exception(f"Failed to get subjects: {str(objErr)}")

    async def get_subject(self, strSubjectId: str) -> Optional[Subject]:
        """Get a specific subject by ID"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').eq('id', strSubjectId).single().execute()
            if not objResponse.data:
                return None
            return Subject(**objResponse.data)
        except Exception as objErr:
            raise Exception(f"Failed to get subject: {str(objErr)}")

    async def get_subject_by_name(self, strName: str) -> Optional[Subject]:
        """Get a specific subject by name"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').eq('name', strName).single().execute()
            if not objResponse.data:
                return None
            return Subject(**objResponse.data)
        except Exception as objErr:
            raise Exception(f"Failed to get subject by name: {str(objErr)}")

    async def create_subject(self, objSubjectCreate: SubjectCreate) -> Subject:
        """Create a new subject"""
        try:
            dictSubject = objSubjectCreate.model_dump()
            objResponse = await self.supabase.client.table(self.strTableName).insert(dictSubject).execute()
            if not objResponse.data:
                raise Exception("Failed to create subject")
            return Subject(**objResponse.data[0])
        except Exception as objErr:
            raise Exception(f"Failed to create subject: {str(objErr)}")

    async def update_subject(self, strSubjectId: str, objSubjectUpdate: SubjectUpdate) -> Optional[Subject]:
        """Update an existing subject"""
        try:
            dictUpdate = objSubjectUpdate.model_dump(exclude_unset=True)
            objResponse = await self.supabase.client.table(self.strTableName).update(dictUpdate).eq('id', strSubjectId).execute()
            if not objResponse.data:
                return None
            return Subject(**objResponse.data[0])
        except Exception as objErr:
            raise Exception(f"Failed to update subject: {str(objErr)}")

    async def delete_subject(self, strSubjectId: str) -> bool:
        """Delete a subject"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).delete().eq('id', strSubjectId).execute()
            return bool(objResponse.data)
        except Exception as objErr:
            raise Exception(f"Failed to delete subject: {str(objErr)}")

    async def get_subjects_by_category(self, strCategory: str) -> List[Subject]:
        """Get subjects by category"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').eq('category', strCategory).execute()
            arrSubjects = objResponse.data if objResponse.data else []
            return [Subject(**objSubject) for objSubject in arrSubjects]
        except Exception as objErr:
            raise Exception(f"Failed to get subjects by category: {str(objErr)}")

    async def get_subjects_by_level(self, strLevel: str) -> List[Subject]:
        """Get subjects by level (e.g., 'Unit 1/2', 'Unit 3/4')"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').eq('level', strLevel).execute()
            arrSubjects = objResponse.data if objResponse.data else []
            return [Subject(**objSubject) for objSubject in arrSubjects]
        except Exception as objErr:
            raise Exception(f"Failed to get subjects by level: {str(objErr)}")

    async def search_subjects(self, strQuery: str) -> List[Subject]:
        """Search subjects by name or description"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').execute()
            arrSubjects = objResponse.data if objResponse.data else []
            strQueryLower = strQuery.lower()
            return [Subject(**objSubject) for objSubject in arrSubjects if strQueryLower in objSubject.get('name', '').lower() or strQueryLower in objSubject.get('description', '').lower()]
        except Exception as objErr:
            raise Exception(f"Failed to search subjects: {str(objErr)}")

    async def get_subjects_by_prerequisites(self, prerequisites: List[str]) -> List[Subject]:
        """Get subjects that have specific prerequisites"""
        try:
            # Get all subjects and filter by prerequisites
            objResponse = await self.supabase.client.table(self.strTableName).select('*').execute()
            arrSubjects = objResponse.data if objResponse.data else []
            subjects = [Subject(**objSubject) for objSubject in arrSubjects]
            return [subject for subject in subjects if 
                   any(prereq in subject.prerequisites for prereq in prerequisites)]
        except Exception as objErr:
            raise Exception(f"Failed to get subjects by prerequisites: {str(objErr)}")

    async def get_subjects_by_credits(self, credits: int) -> List[Subject]:
        """Get subjects by credit value"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').eq('credits', credits).execute()
            arrSubjects = objResponse.data if objResponse.data else []
            return [Subject(**objSubject) for objSubject in arrSubjects]
        except Exception as objErr:
            raise Exception(f"Failed to get subjects by credits: {str(objErr)}")

    async def get_subjects_by_difficulty(self, difficulty: str) -> List[Subject]:
        """Get subjects by difficulty level"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').eq('difficulty', difficulty).execute()
            arrSubjects = objResponse.data if objResponse.data else []
            return [Subject(**objSubject) for objSubject in arrSubjects]
        except Exception as objErr:
            raise Exception(f"Failed to get subjects by difficulty: {str(objErr)}")

    async def get_subject_recommendations(self, interests: List[str], current_subjects: List[str]) -> List[Subject]:
        """Get subject recommendations based on interests and current subjects"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').execute()
            arrSubjects = objResponse.data if objResponse.data else []
            subjects = [Subject(**objSubject) for objSubject in arrSubjects]
            
            # Filter out subjects the user is already taking
            available_subjects = [subject for subject in subjects if subject.name not in current_subjects]
            
            # Score subjects based on interests
            scored_subjects = []
            for subject in available_subjects:
                score = 0
                for interest in interests:
                    if interest.lower() in subject.description.lower():
                        score += 1
                    if interest.lower() in subject.name.lower():
                        score += 2
                scored_subjects.append((subject, score))
            
            # Sort by score and return top recommendations
            scored_subjects.sort(key=lambda x: x[1], reverse=True)
            return [subject for subject, score in scored_subjects[:10]]  # Top 10 recommendations
        except Exception as objErr:
            raise Exception(f"Failed to get subject recommendations: {str(objErr)}")

    async def get_subject_statistics(self) -> Dict[str, Any]:
        """Get statistics about subjects"""
        try:
            objResponse = await self.supabase.client.table(self.strTableName).select('*').execute()
            arrSubjects = objResponse.data if objResponse.data else []
            subjects = [Subject(**objSubject) for objSubject in arrSubjects]
            
            total_subjects = len(subjects)
            categories = {}
            levels = {}
            difficulties = {}
            
            for subject in subjects:
                # Count by category
                category = subject.category or 'Uncategorized'
                categories[category] = categories.get(category, 0) + 1
                
                # Count by level
                level = subject.level or 'Unknown'
                levels[level] = levels.get(level, 0) + 1
                
                # Count by difficulty
                difficulty = subject.difficulty or 'Unknown'
                difficulties[difficulty] = difficulties.get(difficulty, 0) + 1
            
            return {
                'total_subjects': total_subjects,
                'categories': categories,
                'levels': levels,
                'difficulties': difficulties
            }
        except Exception as objErr:
            raise Exception(f"Failed to get subject statistics: {str(objErr)}") 
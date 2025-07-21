from typing import List, Dict, Any
from datetime import datetime
import logging
from firebase_admin import firestore

logger = logging.getLogger(__name__)

class DatabaseMigration:
    def __init__(self):
        self.db = firestore.client()

    async def create_index(self, collection: str, fields: List[str]) -> bool:
        """Create a composite index for a collection."""
        try:
            index = {
                'collectionGroup': collection,
                'queryScope': 'COLLECTION',
                'fields': [{'fieldPath': field, 'order': 'ASCENDING'} for field in fields]
            }
            
            # Create index using Firestore API
            self.db.collection('_indexes').add(index)
            logger.info(f"Created index for {collection} on fields {fields}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create index: {str(e)}")
            return False

    async def update_schema(self, collection: str, schema: Dict[str, Any]) -> bool:
        """Update collection schema."""
        try:
            # Get all documents in collection
            docs = self.db.collection(collection).stream()
            
            # Update each document with new schema
            batch = self.db.batch()
            for doc in docs:
                data = doc.to_dict()
                updated_data = self._apply_schema(data, schema)
                batch.update(doc.reference, updated_data)
            
            batch.commit()
            logger.info(f"Updated schema for collection {collection}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update schema: {str(e)}")
            return False

    def _apply_schema(self, data: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        """Apply schema changes to document data."""
        updated_data = data.copy()
        
        for field, value in schema.items():
            if field not in data:
                updated_data[field] = value
            elif isinstance(value, dict) and isinstance(data[field], dict):
                updated_data[field] = self._apply_schema(data[field], value)
                
        return updated_data

    async def migrate_data(self, source_collection: str, target_collection: str, 
                          transform_func: callable = None) -> bool:
        """Migrate data from one collection to another."""
        try:
            # Get source documents
            source_docs = self.db.collection(source_collection).stream()
            
            # Create batch for target collection
            batch = self.db.batch()
            
            for doc in source_docs:
                data = doc.to_dict()
                
                # Apply transformation if provided
                if transform_func:
                    data = transform_func(data)
                
                # Create new document in target collection
                target_ref = self.db.collection(target_collection).document()
                batch.set(target_ref, data)
            
            batch.commit()
            logger.info(f"Migrated data from {source_collection} to {target_collection}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to migrate data: {str(e)}")
            return False

    async def cleanup_old_data(self, collection: str, 
                              field: str, 
                              older_than: datetime) -> bool:
        """Clean up old data from a collection."""
        try:
            # Query for old documents
            old_docs = self.db.collection(collection)\
                .where(field, '<', older_than)\
                .stream()
            
            # Delete in batches
            batch = self.db.batch()
            count = 0
            
            for doc in old_docs:
                batch.delete(doc.reference)
                count += 1
                
                if count >= 500:  # Firestore batch limit
                    batch.commit()
                    batch = self.db.batch()
                    count = 0
            
            if count > 0:
                batch.commit()
                
            logger.info(f"Cleaned up {count} old documents from {collection}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to cleanup old data: {str(e)}")
            return False 
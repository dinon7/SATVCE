import os
import json
from datetime import datetime, UTC
from typing import Dict, List, Any
from google.cloud import storage
import logging

logger = logging.getLogger(__name__)

# NOTE: This file is deprecated and not used in production. All backups should use Supabase/Postgres.

class DatabaseBackup:
    """Database backup service with improved datetime handling"""
    
    def __init__(self, bucket_name: str = None, backup_dir: str = "backups"):
        self.bucket_name = bucket_name or os.getenv('BACKUP_BUCKET_NAME')
        self.storage_client = storage.Client()
        self.bucket = self.storage_client.bucket(self.bucket_name)
        self.backup_dir = backup_dir
        os.makedirs(backup_dir, exist_ok=True)

    def create_backup_metadata(self, tables: List[str]) -> Dict[str, Any]:
        """Create backup metadata with improved datetime handling"""
        return {
            'backup_date': datetime.now(UTC).isoformat(),
            'tables': tables,
            'version': '1.0',
            'timestamp': datetime.now(UTC).isoformat(),
        }

    def generate_backup_filename(self) -> str:
        """Generate backup filename with improved datetime handling"""
        timestamp = datetime.now(UTC).strftime('%Y%m%d_%H%M%S')
        return f"backup_{timestamp}.json"

    def save_backup(self, data: Dict[str, Any], filename: str = None) -> str:
        """Save backup data with improved error handling"""
        try:
            if not filename:
                filename = self.generate_backup_filename()
            
            filepath = os.path.join(self.backup_dir, filename)
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            
            logger.info(f"Backup saved successfully: {filepath}")
            return filepath
        except Exception as e:
            logger.error(f"Error saving backup: {str(e)}")
            raise

    def load_backup(self, filename: str) -> Dict[str, Any]:
        """Load backup data with improved error handling"""
        try:
            filepath = os.path.join(self.backup_dir, filename)
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            logger.info(f"Backup loaded successfully: {filepath}")
            return data
        except Exception as e:
            logger.error(f"Error loading backup: {str(e)}")
            raise

    async def backup_collection(self, collection_name: str) -> str:
        """Backup a single collection to GCS."""
        try:
            # REMOVED: db = firestore.client()
            collection = db.collection(collection_name)
            docs = collection.stream()
            
            # Prepare backup data
            backup_data = {
                'collection': collection_name,
                'timestamp': datetime.utcnow().isoformat(),
                'documents': [doc.to_dict() for doc in docs]
            }
            
            # Create backup file name
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            backup_file = f'backups/{collection_name}/{timestamp}.json'
            
            # Upload to GCS
            blob = self.bucket.blob(backup_file)
            blob.upload_from_string(
                json.dumps(backup_data, indent=2),
                content_type='application/json'
            )
            
            logger.info(f"Backed up collection {collection_name} to {backup_file}")
            return backup_file
            
        except Exception as e:
            logger.error(f"Failed to backup collection {collection_name}: {str(e)}")
            raise

    async def backup_all_collections(self) -> Dict[str, str]:
        """Backup all collections to GCS."""
        collections = ['users', 'subjects', 'careers', 'quiz_results']
        results = {}
        
        for collection in collections:
            try:
                backup_file = await self.backup_collection(collection)
                results[collection] = backup_file
            except Exception as e:
                logger.error(f"Failed to backup {collection}: {str(e)}")
                results[collection] = None
                
        return results

    async def restore_collection(self, backup_file: str) -> bool:
        """Restore a collection from backup."""
        try:
            # Download backup file
            blob = self.bucket.blob(backup_file)
            backup_data = json.loads(blob.download_as_string())
            
            # Get collection name and documents
            collection_name = backup_data['collection']
            documents = backup_data['documents']
            
            # Restore documents
            # REMOVED: db = firestore.client()
            collection = db.collection(collection_name)
            
            batch = db.batch()
            for doc in documents:
                doc_ref = collection.document()
                batch.set(doc_ref, doc)
            
            batch.commit()
            
            logger.info(f"Restored collection {collection_name} from {backup_file}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to restore from {backup_file}: {str(e)}")
            return False

    async def list_backups(self, collection_name: str = None) -> List[str]:
        """List available backups for a collection or all collections."""
        try:
            prefix = f'backups/{collection_name}/' if collection_name else 'backups/'
            blobs = self.bucket.list_blobs(prefix=prefix)
            
            return [blob.name for blob in blobs]
            
        except Exception as e:
            logger.error(f"Failed to list backups: {str(e)}")
            return []

    async def delete_backup(self, backup_file: str) -> bool:
        """Delete a backup file."""
        try:
            blob = self.bucket.blob(backup_file)
            blob.delete()
            
            logger.info(f"Deleted backup {backup_file}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete backup {backup_file}: {str(e)}")
            return False 
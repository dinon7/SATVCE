import os
import json
from datetime import datetime
from typing import Dict, List
from firebase_admin import firestore
from google.cloud import storage
import logging

logger = logging.getLogger(__name__)

class DatabaseBackup:
    def __init__(self, bucket_name: str = None):
        self.bucket_name = bucket_name or os.getenv('BACKUP_BUCKET_NAME')
        self.storage_client = storage.Client()
        self.bucket = self.storage_client.bucket(self.bucket_name)

    async def backup_collection(self, collection_name: str) -> str:
        """Backup a single collection to GCS."""
        try:
            db = firestore.client()
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
            db = firestore.client()
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
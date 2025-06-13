from typing import Any, Optional
import json
from datetime import timedelta
import redis
from app.config import settings

class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=0,
            decode_responses=True
        )
        self.default_ttl = timedelta(hours=24)  # Cache recommendations for 24 hours

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = self.redis_client.get(key)
            return json.loads(value) if value else None
        except (redis.RedisError, json.JSONDecodeError):
            return None

    async def set(self, key: str, value: Any, ttl: Optional[timedelta] = None) -> bool:
        """Set value in cache"""
        try:
            ttl = ttl or self.default_ttl
            return self.redis_client.setex(
                key,
                int(ttl.total_seconds()),
                json.dumps(value)
            )
        except (redis.RedisError, TypeError):
            return False

    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            return bool(self.redis_client.delete(key))
        except redis.RedisError:
            return False

    def generate_key(self, user_id: str, recommendation_type: str) -> str:
        """Generate cache key for recommendations"""
        return f"recommendations:{user_id}:{recommendation_type}" 
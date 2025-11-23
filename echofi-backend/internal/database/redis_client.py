# internal/database/redis_client.py

import redis
from configs.config import settings
import logging

log = logging.getLogger(__name__)

# Global Redis client instance
redis_client: redis.Redis = None

def get_redis_client() -> redis.Redis:
    """Returns the initialized Redis client instance (dependency utility)."""
    if redis_client is None:
        # In a real app, you might raise an HTTPException here if used as a dependency
        raise ConnectionError("Redis client not initialized.")
    return redis_client

def init_redis():
    """Initializes the connection to the Redis cache server."""
    global redis_client
    
    try:
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=0,
            decode_responses=True # Important: Decodes keys/values to Python strings
        )
        # Ping the server to check the connection
        redis_client.ping()
        log.info(f"Successfully connected to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT}")
    except Exception as e:
        log.error(f"FATAL: Could not connect to Redis: {e}")
        raise e
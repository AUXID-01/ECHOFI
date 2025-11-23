# security/rate_limiter.py
import time
import logging
from typing import Optional
from os import environ

logger = logging.getLogger("security.rate")

REDIS_URL = environ.get("REDIS_URL", "")
USE_REDIS = bool(REDIS_URL)

# Fallback in-memory store
_rate_store = {}
_WINDOW = int(environ.get("RATE_WINDOW", "10"))  # seconds
_POINTS = int(environ.get("RATE_POINTS", "10"))  # tokens per window

# Lazy import redis if configured
_redis_client = None
if USE_REDIS:
    try:
        import redis
        _redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    except Exception as e:
        logger.exception("Unable to connect to Redis, falling back to in-memory: %s", e)
        _redis_client = None
        USE_REDIS = False


def _inmem_check(key: str, points: int = _POINTS, window: int = _WINDOW):
    """
    Simple in-memory fixed-window rate limiter.
    Not suitable for multi-instance production.
    """
    now = int(time.time())
    entry = _rate_store.get(key)
    if not entry or now - entry["start"] >= window:
        _rate_store[key] = {"start": now, "points": points - 1}
        return True
    if entry["points"] <= 0:
        return False
    entry["points"] -= 1
    return True


def redis_allow(key: str, points: int = _POINTS, window: int = _WINDOW) -> bool:
    """
    Redis-based fixed-window rate limiting (atomic).
    Uses INCR + EXPIRE.
    """
    if not _redis_client:
        return _inmem_check(key, points, window)
    try:
        cur = _redis_client.incr(key)
        if cur == 1:
            _redis_client.expire(key, window)
        if cur > points:
            return False
        return True
    except Exception as e:
        logger.exception("Redis rate-limit error: %s", e)
        # fallback allow to avoid blocking on redis failures
        return True


def allow_request(user_id: Optional[str], route_key: str = "stt", points: int = _POINTS, window: int = _WINDOW) -> bool:
    """
    Must be called at request entry. Key by user_id or route_key/ip.
    """
    key_base = user_id or route_key
    key = f"rate:{route_key}:{key_base}"
    if USE_REDIS:
        return redis_allow(key, points=points, window=window)
    else:
        return _inmem_check(key, points=points, window=window)

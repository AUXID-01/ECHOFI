# internal/middleware/rate_limiter.py

from fastapi import Depends, HTTPException, status, Request
from internal.database.redis_client import get_redis_client
import time
import redis

# Configuration
RATE_LIMIT_MAX_CALLS = 100
RATE_LIMIT_WINDOW = 60  # seconds

# Routes that should NOT be rate-limited
RATE_LIMIT_WHITELIST = [
    "/api/v1/auth/login",
    "/api/v1/auth/send-otp",
    "/api/v1/auth/verify-otp",
    "/api/v1/auth/register",
    "/api/v1/auth/me",
    "/api/v1/health",
    "/api/v1/bank",  # <── ADD THIS
]



def rate_limit(request: Request) -> bool:
    """Simple IP-based rate limiter with a whitelist."""
    
    # Skip rate limit for safe routes
    path = request.url.path
    for safe in RATE_LIMIT_WHITELIST:
        if path.startswith(safe):
            return True

    try:
        r = get_redis_client()
    except ConnectionError:
        print("WARNING: Redis down → skipping rate limit")
        return True

    ip_addr = request.client.host if request.client else "unknown"
    key = f"rate_limit:{ip_addr}"

    pipe = r.pipeline()
    pipe.incr(key)
    pipe.expire(key, RATE_LIMIT_WINDOW, nx=True)
    current_calls, _ = pipe.execute()

    if current_calls > RATE_LIMIT_MAX_CALLS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {RATE_LIMIT_WINDOW} seconds."
        )
    return True

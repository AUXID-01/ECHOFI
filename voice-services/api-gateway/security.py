# # api-gateway/security.py
# """
# Gateway-level security adapter.

# This file provides a FastAPI dependency `verify_jwt` that:
# - verifies Authorization: Bearer <token>
# - optionally imports your shared security.jwt_validator.validate_jwt if present
# - applies a minimal in-memory rate-limit as a fallback

# Replace or extend with your production jwt validator and redis-backed rate limiter.
# """
# import logging
# from fastapi import HTTPException, Header, Request
# from typing import Dict, Any
# import time

# logger = logging.getLogger("gateway.security")

# # try to import shared validator if present in repo root `security/`
# try:
#     # this import will work if you have a top-level package `security` (e.g., ../security/jwt_validator.py)
#     from security.jwt_validator import validate_jwt as shared_validate_jwt
#     logger.info("Using shared security.jwt_validator.validate_jwt")
#     shared_validator_available = True
# except Exception:
#     shared_validator_available = False
#     logger.info("Shared JWT validator not found; using local fallback")

# # Simple in-memory rate limiter (fallback). For production, use Redis.
# _rate_store: Dict[str, Dict[str, Any]] = {}
# RATE_LIMIT_POINTS = 10
# RATE_LIMIT_WINDOW = 10  # seconds

# def _inmem_rate_check(sub: str):
#     now = time.time()
#     entry = _rate_store.get(sub)
#     if not entry or now - entry["start"] > RATE_LIMIT_WINDOW:
#         _rate_store[sub] = {"points": RATE_LIMIT_POINTS - 1, "start": now}
#         return
#     if entry["points"] <= 0:
#         raise HTTPException(status_code=429, detail="Rate limit exceeded")
#     entry["points"] -= 1
#     _rate_store[sub] = entry

# def verify_jwt(authorization: str = Header(None)) -> Dict[str, Any]:
#     if not authorization:
#         raise HTTPException(status_code=401, detail="Authorization header missing")
#     parts = authorization.split()
#     if len(parts) != 2 or parts[0].lower() != "bearer":
#         raise HTTPException(status_code=401, detail="Invalid Authorization header")

#     token = parts[1]
#     # use shared validator if available
#     if shared_validator_available:
#         try:
#             payload = shared_validate_jwt(token)
#         except Exception as e:
#             logger.exception("Shared JWT validation failed: %s", e)
#             raise HTTPException(status_code=401, detail="Invalid token")
#     else:
#         # fallback: accept tokens like dev-token-<user>
#         if token.startswith("dev-token-"):
#             payload = {"sub": token[len("dev-token-"):], "dev": True}
#         else:
#             raise HTTPException(status_code=401, detail="Invalid token (no shared validator)")

#     # apply fallback rate limiting
#     try:
#         _inmem_rate_check(payload.get("sub", "anon"))
#     except HTTPException:
#         raise

#     return payload


# api-gateway/security.py
"""
TEMPORARY DEVELOPMENT VERSION
--------------------------------
JWT + Rate Limiting are DISABLED.

This allows the gateway to forward requests to STT/TTS
without requiring any Authorization headers.

Use this ONLY for local testing.
"""

from fastapi import Header

def verify_jwt(authorization: str = Header(None)):
    """
    Mock authentication: always accept.

    Returns a dummy user payload so dependency works.
    """
    return {"sub": "dev-user", "auth": "disabled"}

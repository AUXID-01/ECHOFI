# security/jwt_validator.py
import time
import json
import logging
from typing import Optional, Dict, Any

import jwt
import requests
from jwt import PyJWKClient, InvalidTokenError, ExpiredSignatureError

from fastapi import HTTPException
from os import environ

logger = logging.getLogger("security.jwt")

# Config via env
JWT_SHARED_SECRET = environ.get("JWT_SHARED_SECRET", "dev-secret")
JWT_ALGO = environ.get("JWT_ALGO", "HS256")
JWT_AUDIENCE = environ.get("JWT_AUDIENCE", None)  # optional
JWT_ISSUER = environ.get("JWT_ISSUER", None)      # optional
JWKS_URL = environ.get("JWKS_URL", None)          # optional (if using RSA/EC tokens)

# JWKS client cache
_jwks_client: Optional[PyJWKClient] = None
_jwks_last_fetch = 0
_JWKS_CACHE_SEC = 300


def _get_jwks_client():
    global _jwks_client, _jwks_last_fetch
    if not JWKS_URL:
        return None
    now = time.time()
    if _jwks_client is None or now - _jwks_last_fetch > _JWKS_CACHE_SEC:
        try:
            _jwks_client = PyJWKClient(JWKS_URL)
            _jwks_last_fetch = now
        except Exception as e:
            logger.exception("Failed to create JWKS client: %s", e)
            _jwks_client = None
    return _jwks_client


def validate_jwt(token: str, audience: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate a JWT token. Supports:
     - HS256 HMAC (shared secret) if JWKS_URL not provided
     - RS256/ES256 via JWKS_URL if provided

    Returns decoded payload on success, raises HTTPException(401) on failure.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    # Try JWKS if configured (prefer public-key)
    jwks_client = _get_jwks_client()
    try:
        if jwks_client:
            signing_key = jwks_client.get_signing_key_from_jwt(token).key
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256", "RS384", "RS512", "ES256", "ES384", "ES512"],
                audience=(audience or JWT_AUDIENCE),
                issuer=JWT_ISSUER or None,
            )
            return payload
        else:
            # fallback to HMAC
            payload = jwt.decode(
                token,
                JWT_SHARED_SECRET,
                algorithms=[JWT_ALGO],
                audience=(audience or JWT_AUDIENCE) if (audience or JWT_AUDIENCE) else None,
                issuer=JWT_ISSUER or None,
            )
            return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError as e:
        logger.debug("Invalid token: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.exception("JWT validation failure: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token")

# pkg/utils/security.py

import hashlib
from passlib.context import CryptContext
from passlib.handlers.bcrypt import bcrypt # Necessary import for passlib backend detection

# Setup CryptContext for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Password Hashing ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hash."""
    # Verification is handled by passlib automatically
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Returns the bcrypt hash of a password, truncated to 72 bytes."""
    # 💥 CRITICAL FIX: Truncation is required to prevent the ValueError 
    # when the underlying C-library is initialized or run internally.
    safe_password = password[:72] 
    return pwd_context.hash(safe_password)

def hash_for_lookup(data: str) -> str:
    """Creates a non-reversible SHA-256 hash for database lookups (tokenization)."""
    # Used for fields that must be queried but shouldn't be plaintext (e.g., in a search index)
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

# --- JWT Token Generation (Handled in jwt_handler.py) ---
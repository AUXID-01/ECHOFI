# pkg/utils/encryption_handler.py

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

from configs.config import settings

# --- PIVOT: Using Fernet for simplicity and better handling of padding/IV ---
# Fernet uses AES 128 in CBC mode, plus a MAC for authenticated encryption.
# We derive the key from the longer ENCRYPTION_KEY for Fernet compatibility.

def get_fernet_key(salt: bytes = b'echofibank') -> bytes:
    """Derives a Fernet-compatible key from the secure ENCRYPTION_KEY."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000, # Recommended high iteration count
    )
    # Use the first 32 bytes of the ENCRYPTION_KEY as the password input
    key_input = settings.ENCRYPTION_KEY[:32].encode() 
    
    # Fernet key needs to be URL-safe base64 encoded
    return base64.urlsafe_b64encode(kdf.derive(key_input))

# Initialize Fernet object globally once
_FERNET_KEY = get_fernet_key()
_FERNET = Fernet(_FERNET_KEY)

def encrypt_data(data: str) -> str:
    """Encrypts plaintext data using Fernet."""
    if not data:
        return ""
    # Data must be bytes before encryption
    encrypted_bytes = _FERNET.encrypt(data.encode())
    return encrypted_bytes.decode() # Return as string

def decrypt_data(encrypted_data: str) -> str:
    """Decrypts Fernet encrypted data."""
    if not encrypted_data:
        return ""
    try:
        # Data must be bytes before decryption
        decrypted_bytes = _FERNET.decrypt(encrypted_data.encode())
        return decrypted_bytes.decode()
    except Exception as e:
        # Handle exceptions like InvalidToken (wrong key, corrupted data)
        print(f"Decryption Error: {e}")
        return "[ENCRYPTION_ERROR]"
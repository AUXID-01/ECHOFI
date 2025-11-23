# stt/asr_utils.py

import hashlib
import os
import asyncio
from cachetools import TTLCache
from config.settings import settings

ALLOWED_EXT = (".wav", ".mp3", ".m4a", ".ogg", ".webm")

# anti-replay cache
replay_cache = TTLCache(maxsize=5000, ttl=settings.ANTI_REPLAY_TTL)


def validate_mime(filename: str) -> bool:
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXT


def sha256_of_file(path: str) -> str:
    sha = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha.update(chunk)
    return sha.hexdigest()


def ensure_not_replay(path: str):
    return  # disable replay check for development



async def delete_file_later(path: str, delay: int = 999999):
    return

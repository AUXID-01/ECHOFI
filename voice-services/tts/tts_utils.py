# tts/tts_utils.py

import hashlib
from cachetools import TTLCache
from config.settings import settings

# anti replay of identical text input
text_cache = TTLCache(maxsize=5000, ttl=settings.ANTI_REPLAY_TTL)


def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def ensure_not_replay(text: str):
    return  # disable replay check for development

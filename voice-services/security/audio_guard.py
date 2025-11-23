# security/audio_guard.py
import os
import hashlib
import logging
import asyncio
import subprocess
from typing import Optional
from os import environ

from cachetools import TTLCache
from fastapi import HTTPException

logger = logging.getLogger("security.audio")

# Config
ANTI_REPLAY_TTL = int(environ.get("ANTI_REPLAY_TTL", "25"))
MAX_UPLOAD_MB = int(environ.get("MAX_UPLOAD_MB", "8"))
MAX_DURATION_SEC = int(environ.get("MAX_DURATION_SEC", "60"))

# allowed extensions (frontend should enforce)
ALLOWED_EXT = {".wav", ".mp3", ".m4a", ".ogg", ".webm", ".flac"}

# In-memory replay cache (fallback). In production use Redis for cluster-wide dedup.
_replay_cache = TTLCache(maxsize=10000, ttl=ANTI_REPLAY_TTL)


def compute_sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def ensure_extension(filename: str):
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {ext}")


def check_file_size(path: str):
    size = os.path.getsize(path)
    if size > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file too large")


def ensure_not_replay(path: str):
    """Anti-replay: raise HTTPException on duplicate within TTL."""
    digest = compute_sha256(path)
    if digest in _replay_cache:
        raise HTTPException(status_code=409, detail="Duplicate audio (possible replay) detected")
    _replay_cache[digest] = True
    return digest


def probe_duration(path: str) -> float:
    """
    Uses ffprobe to get duration in seconds.
    Requires ffmpeg/ffprobe to be installed in the container.
    """
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        out = res.stdout.strip()
        if not out:
            return 0.0
        return float(out)
    except Exception as e:
        logger.debug("ffprobe failed: %s", e)
        # If ffprobe isn't available, don't block; return 0.0 (skip duration check)
        return 0.0


async def delete_file_secure(path: str, delay: int = 15):
    """Schedule secure deletion of a file after delay (best effort)."""
    await asyncio.sleep(delay)
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.debug("Failed to delete %s: %s", path, e)


def secure_save_upload(uploaded_file, dest_dir: str) -> str:
    """
    Save a FastAPI UploadFile to a secure temp path and validate.
    Returns the path to saved file.
    """
    os.makedirs(dest_dir, exist_ok=True)
    filename = uploaded_file.filename
    ensure_extension(filename)

    # Save
    tmp_path = os.path.join(dest_dir, f"{int(time.time()*1000)}_{filename}")
    with open(tmp_path, "wb") as f:
        # uploaded_file.file is a SpooledTemporaryFile - read from it
        uploaded_file.file.seek(0)
        chunk = uploaded_file.file.read()
        f.write(chunk)

    # checks
    check_file_size(tmp_path)
    duration = probe_duration(tmp_path)
    if duration and duration > MAX_DURATION_SEC:
        os.remove(tmp_path)
        raise HTTPException(status_code=413, detail="Audio duration too long")

    # anti-replay - returns digest
    digest = ensure_not_replay(tmp_path)

    return tmp_path

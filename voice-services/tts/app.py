# tts/app.py

import os
import uuid
import logging.config
import base64
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config.settings import settings
from tts_engine import synthesize
from tts_utils import ensure_not_replay

logging.config.fileConfig(settings.LOG_CONFIG_PATH)
log = logging.getLogger("tts")

app = FastAPI(title="TTS Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure output dir exists
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)

# Serve audio files as static
app.mount("/audio", StaticFiles(directory=settings.OUTPUT_DIR), name="audio")


@app.post("/tts")
async def text_to_speech(payload: dict):
    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Anti replay (optional)
    # try:
    #     ensure_not_replay(text)
    # except ValueError:
    #     raise HTTPException(status_code=409, detail="Replay blocked")

    # Generate audio file
    file_id = uuid.uuid4().hex
    output_path = os.path.join(settings.OUTPUT_DIR, f"{file_id}.{settings.AUDIO_FORMAT}")

    synthesize(text, file_id)  # generates output_path

    # Return SHORT output (URL only)
    audio_url = f"/audio/{file_id}.{settings.AUDIO_FORMAT}"

    return {
        "audio_url": audio_url,
        "format": settings.AUDIO_FORMAT
    }

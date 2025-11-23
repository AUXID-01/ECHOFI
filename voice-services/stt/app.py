# stt/app.py

import os
import uuid
import logging.config
import subprocess
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from whisper_model import load_whisper
from asr_utils import validate_mime, delete_file_later
from config.settings import settings

import aiofiles
import asyncio

logging.config.fileConfig(settings.LOG_CONFIG_PATH)
log = logging.getLogger("stt")

app = FastAPI(title="STT Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Convert webm → wav
# --------------------------
def convert_to_wav(src, dst):
    try:
        cmd = [
            "ffmpeg",
            "-y",
            "-i", src,
            "-ac", "1",
            "-ar", "16000",
            dst
        ]

        log.info(f"FFmpeg cmd: {' '.join(cmd)}")
        subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
    except Exception as e:
        raise RuntimeError(f"FFmpeg conversion failed: {str(e)}")


# --------------------------
# 🚀 Speech-to-text endpoint
# --------------------------
@app.post("/asr")
async def transcribe(audio: UploadFile = File(...)):
    log.info(f"STT received: {audio.filename}")

    if not validate_mime(audio.filename):
        raise HTTPException(status_code=400, detail="Unsupported audio format (expected webm)")

    os.makedirs(settings.TEMP_DIR, exist_ok=True)

    raw_path = os.path.join(settings.TEMP_DIR, f"{uuid.uuid4().hex}_raw.webm")
    wav_path = raw_path.replace("_raw.webm", ".wav")

    # Save raw webm
    async with aiofiles.open(raw_path, "wb") as f:
        await f.write(await audio.read())

    # 🔥 Convert to WAV BEFORE giving to Whisper
    try:
        convert_to_wav(raw_path, wav_path)
    except Exception as e:
        log.error(f"FFmpeg failed: {e}")
        raise HTTPException(status_code=500, detail="Audio conversion failed")

    # 🔥 Whisper transcription
    try:
        model = load_whisper()
        result = model.transcribe(wav_path)
        text = result["text"].strip()
        log.info(f"STT TRANSCRIBED TEXT → '{text}'")
    except Exception as e:
        log.error(f"Whisper error: {e}")
        raise HTTPException(status_code=500, detail="Whisper failed")

    # Clean up after 10 sece
    asyncio.create_task(delete_file_later(raw_path))
    asyncio.create_task(delete_file_later(wav_path))

    return {"text": text}

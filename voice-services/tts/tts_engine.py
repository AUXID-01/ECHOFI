# tts/tts_engine.py

from TTS.api import TTS
import os
from config.settings import settings

_tts = None


def load_tts():
    global _tts
    if _tts is None:
        print(f"Loading TTS model: {settings.TTS_MODEL}")
        _tts = TTS(model_name=settings.TTS_MODEL)
        os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
    return _tts


def synthesize(text: str, filename: str) -> str:
    """Generate TTS audio and return file path."""
    tts = load_tts()
    path = f"{settings.OUTPUT_DIR}/{filename}.{settings.AUDIO_FORMAT}"
    tts.tts_to_file(text=text, file_path=path)
    return path

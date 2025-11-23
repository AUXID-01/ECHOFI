# stt/whisper_model.py

import whisper
from config.settings import settings

_whisper_model = None


def load_whisper():
    """Loads Whisper once (singleton)"""
    global _whisper_model
    if _whisper_model is None:
        print(f"Loading Whisper model: {settings.WHISPER_MODEL}")
        _whisper_model = whisper.load_model(settings.WHISPER_MODEL)
    return _whisper_model

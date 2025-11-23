# tts/config/settings.py
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Base directory of the TTS service
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # → tts/

    # TTS Model
    TTS_MODEL: str = "tts_models/en/ljspeech/tacotron2-DDC"

    # Correct absolute output path
    OUTPUT_DIR: str = os.path.join(BASE_DIR, "data", "out")
    AUDIO_FORMAT: str = "wav"

    # Security
    JWT_SECRET: str = "change-this"
    JWT_ALGO: str = "HS256"
    JWT_AUDIENCE: str = "voice-service"

    ANTI_REPLAY_TTL: int = 25

    # Logging
    LOG_CONFIG_PATH: str = os.path.join(BASE_DIR, "config", "logging.conf")

    class Config:
        env_file = ".env"


settings = Settings()

# Debug print
print("🔊 TTS OUTPUT DIR:", settings.OUTPUT_DIR)

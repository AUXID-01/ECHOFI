# api-gateway/config/settings.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Internal service URLs
    STT_URL: str = "http://localhost:8001/asr"   # LOCAL testing (change in docker)
    TTS_URL: str = "http://localhost:8002/tts"
    NLP_URL: str = "http://localhost:8081/dialogue"
    TTS_BASE_URL: str = "http://localhost:8002"


    # JWT Shared Security
    JWT_SECRET: str = "change-this"
    JWT_ALGO: str = "HS256"
    JWT_AUDIENCE: str = "voice-service"   # <<< SAME FOR ALL SERVICES

    # CORS
    CORS_ALLOW_ORIGINS: List[str] = ["http://localhost:5173"]

    # Logging
    LOG_CONFIG_PATH: str = "config/logging.conf"

    class Config:
        env_file = ".env"

settings = Settings()

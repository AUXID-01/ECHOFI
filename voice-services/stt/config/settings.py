# stt/config/settings.py
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Whisper model
    WHISPER_MODEL: str = "base"
    COMPUTE_TYPE: str = "int8"  

    # Audio limits
    MAX_UPLOAD_MB: int = 8
    MAX_DURATION_SEC: int = 30
    TEMP_DIR: str = "data/tmp"

    # Security
    JWT_SECRET: str = "change-this"
    JWT_ALGO: str = "HS256"
    JWT_AUDIENCE: str = "voice-service"

    ANTI_REPLAY_TTL: int = 25 

    # Logging
    LOG_CONFIG_PATH: str = "config/logging.conf"

    class Config:
        env_file = ".env"


settings = Settings()

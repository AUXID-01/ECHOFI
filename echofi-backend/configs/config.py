from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Path to the .env file in the project root
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    # Model configuration for loading
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    # Server Settings
    UVICORN_HOST: str = "0.0.0.0"
    UVICORN_PORT: int = 8000
    ENVIRONMENT: str = "development"

    # Database Settings
    DB_HOST: str
    DB_PORT: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # Security Settings
    SECRET_KEY: str
    ALGORITHM: str
    ENCRYPTION_KEY: str  # <-- ADDED: From Step 8 Encryption Implementation

    # Twilio Settings (NEW)
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_VERIFY_SERVICE_SID: str
    
    # Redis Settings
    REDIS_HOST: str
    REDIS_PORT: int

    @property
    def DATABASE_URL(self) -> str:
        """Constructs the SQLAlchemy database URL."""
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

# Global settings instance
settings = Settings()
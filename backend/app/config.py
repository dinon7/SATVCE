from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, SecretStr, ConfigDict
import secrets
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "VCE Career Chooser"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS]
    
    # Firebase Settings
    FIREBASE_SERVICE_ACCOUNT: str = "firebase-credentials.json"
    FIREBASE_DATABASE_URL: str = "https://vce-career-chooser-default-rtdb.firebaseio.com"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./vce_guidance.db"
    
    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: SecretStr = SecretStr("")
    REDIS_DB: int = 0
    
    # Security Settings
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI API Settings
    AI_API_KEY: SecretStr = SecretStr("AIzaSyBIzbK2A-MmEpyz9opsacvin_BCDh1rfH0")
    AI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    
    # Gemini API Settings
    GEMINI_API_KEY: str = ""

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        env_file_encoding="utf-8",
        extra="allow"
    )

settings = Settings() 
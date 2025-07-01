from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import SecretStr, ConfigDict, field_validator

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "VCE Subject Selection & Career Guidance"
    APP_NAME: str = "Career Quiz API"
    DEBUG: bool = True
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: str | List[str] | None) -> List[str]:
        if v is None or v == "":
            return ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"]
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v
    
    # Firebase Settings
    FIREBASE_SERVICE_ACCOUNT: str = "firebase-credentials.json"
    FIREBASE_DATABASE_URL: str = "https://vce-career-chooser-default-rtdb.firebaseio.com"
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_CLIENT_ID: Optional[str] = None
    FIREBASE_CLIENT_CERT_URL: Optional[str] = None
    
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
    AI_API_KEY: SecretStr = SecretStr("")
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
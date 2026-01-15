"""
Configuration management for the application
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral"
    OLLAMA_TIMEOUT: int = 3000
    
    # Google Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # MongoDB Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "linkedin_post_generator"
    
    # JWT Configuration (NEW - for authentication)
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    # Application Settings
    MAX_INPUT_LENGTH: int = 5000
    MAX_OUTPUT_LENGTH: int = 3000
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
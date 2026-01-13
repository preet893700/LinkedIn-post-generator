"""
Configuration management for the application
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral"
    OLLAMA_TIMEOUT: int = 3000  # in seconds
    
    # Google Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # MongoDB Configuration (optional)
    MONGODB_URL: Optional[str] = None
    MONGODB_DB_NAME: str = "linkedin_post_generator"
    
    # Application Settings
    MAX_INPUT_LENGTH: int = 5000
    MAX_OUTPUT_LENGTH: int = 3000
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
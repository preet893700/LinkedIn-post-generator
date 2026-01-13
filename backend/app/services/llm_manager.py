"""
LLM Manager - Unified interface with automatic fallback
Tries Ollama first, falls back to Gemini if Ollama fails
"""
import logging
from typing import Optional, Tuple
from app.services.ollama_client import ollama_client
from app.services.gemini_client import gemini_client

logger = logging.getLogger(__name__)

class LLMManager:
    async def generate(self, prompt: str, system: Optional[str] = None) -> Tuple[Optional[str], str]:
        """
        Generate text using available LLM providers
        Returns: (generated_text, provider_used)
        Provider can be: "ollama", "gemini", or "none"
        """
        
        # Try Ollama first
        logger.info("Attempting generation with Ollama...")
        result = await ollama_client.generate(prompt, system)
        
        if result:
            logger.info("✓ Ollama generation successful")
            return result, "ollama"
        
        # Fallback to Gemini
        logger.info("Ollama failed, falling back to Gemini...")
        
        if not gemini_client.is_configured():
            logger.error("Gemini not configured, no fallback available")
            return None, "none"
        
        result = await gemini_client.generate(prompt, system)
        
        if result:
            logger.info("✓ Gemini generation successful")
            return result, "gemini"
        
        logger.error("All LLM providers failed")
        return None, "none"
    
    async def check_availability(self) -> dict:
        """Check which providers are available"""
        ollama_available = await ollama_client.is_available()
        gemini_available = gemini_client.is_configured()
        
        return {
            "ollama": ollama_available,
            "gemini": gemini_available,
            "any_available": ollama_available or gemini_available
        }

llm_manager = LLMManager()
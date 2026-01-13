"""
Google Gemini client for fallback AI generation
"""
import aiohttp
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
    
    async def generate(self, prompt: str, system: Optional[str] = None) -> Optional[str]:
        """
        Generate text using Google Gemini
        Returns None if generation fails
        """
        if not self.api_key:
            logger.warning("Gemini API key not configured")
            return None
        
        try:
            url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
            
            # Combine system and user prompt
            full_prompt = prompt
            if system:
                full_prompt = f"{system}\n\n{prompt}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": full_prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topP": 0.9,
                    "maxOutputTokens": 2048,
                }
            }
            
            timeout = aiohttp.ClientTimeout(total=30)
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Extract text from Gemini response
                        if "candidates" in data and len(data["candidates"]) > 0:
                            candidate = data["candidates"][0]
                            if "content" in candidate and "parts" in candidate["content"]:
                                parts = candidate["content"]["parts"]
                                if len(parts) > 0 and "text" in parts[0]:
                                    result = parts[0]["text"].strip()
                                    logger.info(f"Gemini generation successful. Length: {len(result)}")
                                    return result
                        
                        logger.warning("Gemini response had unexpected format")
                        return None
                    else:
                        error_text = await response.text()
                        logger.warning(f"Gemini returned status {response.status}: {error_text}")
                        return None
                        
        except Exception as e:
            logger.error(f"Gemini error: {str(e)}")
            return None
    
    def is_configured(self) -> bool:
        """Check if Gemini is properly configured"""
        return self.api_key is not None and len(self.api_key) > 0

gemini_client = GeminiClient()
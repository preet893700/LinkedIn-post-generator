"""
Ollama client for local LLM inference
"""
import aiohttp
import asyncio
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT
    
    async def generate(self, prompt: str, system: Optional[str] = None) -> Optional[str]:
        """
        Generate text using Ollama
        Returns None if generation fails
        """
        try:
            url = f"{self.base_url}/api/generate"
            
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                }
            }
            
            if system:
                payload["system"] = system
            
            timeout = aiohttp.ClientTimeout(total=self.timeout)
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        result = data.get("response", "").strip()
                        logger.info(f"Ollama generation successful. Length: {len(result)}")
                        return result if result else None
                    else:
                        logger.warning(f"Ollama returned status {response.status}")
                        return None
                        
        except asyncio.TimeoutError:
            logger.warning(f"Ollama timeout after {self.timeout}s")
            return None
        except aiohttp.ClientError as e:
            logger.warning(f"Ollama client error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected Ollama error: {str(e)}")
            return None
    
    async def is_available(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            url = f"{self.base_url}/api/tags"
            timeout = aiohttp.ClientTimeout(total=5)
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url) as response:
                    return response.status == 200
        except:
            return False

ollama_client = OllamaClient()
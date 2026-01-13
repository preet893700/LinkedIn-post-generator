"""
Topic-based post generation endpoint
Real implementation with Ollama → Gemini fallback
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.llm_manager import llm_manager
from app.services.templates import get_template
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class TopicGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=5000, description="Topic for the post")
    template_key: Optional[str] = Field(None, description="Template key (e.g., 'story', 'tips')")
    custom_instructions: Optional[str] = Field(None, description="Additional AI instructions")

class TopicGenerateResponse(BaseModel):
    success: bool
    content: str
    provider: str  # "ollama" or "gemini"
    template_used: Optional[str] = None

@router.post("/generate/topic", response_model=TopicGenerateResponse)
async def generate_from_topic(request: TopicGenerateRequest):
    """
    Generate a LinkedIn post from a topic
    Uses template if provided, otherwise generates generic post
    """
    try:
        logger.info(f"Generating post from topic: {request.topic[:50]}...")
        
        # Get template if specified
        template_data = get_template(request.template_key) if request.template_key else None
        
        # Build system prompt
        if template_data:
            system_prompt = template_data["system"]
            prompt_template = template_data["template"]
            prompt = prompt_template.format(topic=request.topic)
        else:
            # Default professional LinkedIn post
            system_prompt = "You are an expert LinkedIn content creator who writes engaging professional posts."
            prompt = f"""Create a professional LinkedIn post about: {request.topic}

Guidelines:
- Make it engaging and authentic
- Use line breaks for readability
- Keep it concise (150-250 words)
- Include 1-2 relevant emojis if appropriate
- End with a question or call-to-action
- Professional but conversational tone

Generate ONLY the post content, no meta-commentary."""
        
        # Add custom instructions if provided
        if request.custom_instructions:
            prompt += f"\n\nAdditional instructions: {request.custom_instructions}"
        
        # Call LLM with fallback
        try:
            content, provider = await llm_manager.generate(
                prompt=prompt,
                system=system_prompt
            )
            
            if not content:
                raise HTTPException(
                    status_code=503,
                    detail="AI generation failed. Please ensure Ollama is running or configure Gemini API key."
                )
            
            logger.info(f"✓ Generated post using {provider} ({len(content)} chars)")
            
            return TopicGenerateResponse(
                success=True,
                content=content.strip(),
                provider=provider,
                template_used=request.template_key
            )
            
        except Exception as e:
            logger.error(f"LLM generation error: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail=f"AI generation failed: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_from_topic: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
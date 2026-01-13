"""
API endpoints for post generation
"""
from fastapi import APIRouter, HTTPException
from app.schemas.post_schemas import GenerateRequest, GenerateResponse, ErrorResponse
from app.services.llm_manager import llm_manager
from app.services.templates import get_template
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate_post(request: GenerateRequest):
    """
    Generate a LinkedIn post from a topic using AI
    """
    try:
        # Get template
        template_data = get_template(request.template or "story")
        
        # Build prompt
        prompt = template_data["template"].format(topic=request.topic)
        
        # Add custom instructions if provided
        if request.custom_instructions:
            prompt += f"\n\nAdditional instructions: {request.custom_instructions}"
        
        # Generate with LLM
        result, provider = await llm_manager.generate(
            prompt=prompt,
            system=template_data["system"]
        )
        
        if not result:
            raise HTTPException(
                status_code=503,
                detail="AI generation failed. Please check if Ollama is running or configure Gemini API key."
            )
        
        return GenerateResponse(
            success=True,
            post=result,
            provider=provider,
            template_used=request.template
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/templates")
async def get_templates():
    """
    Get all available post templates
    """
    from app.services.templates import get_all_template_names
    return {
        "success": True,
        "templates": get_all_template_names()
    }

@router.get("/status")
async def get_status():
    """
    Check AI provider status
    """
    availability = await llm_manager.check_availability()
    return {
        "success": True,
        "providers": availability
    }
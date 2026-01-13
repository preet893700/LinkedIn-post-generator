"""
Generate LinkedIn post from reference post (style transfer)
This mimics the tone, structure, and formatting of a pasted post
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.llm_manager import llm_manager
from app.services.templates import get_template
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ReferenceGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=5000, description="Topic for the new post")
    reference_post: Optional[str] = Field(None, description="LinkedIn post to mimic style from")
    template_id: Optional[str] = Field(None, description="Template ID (only if no reference)")

class ReferenceGenerateResponse(BaseModel):
    success: bool
    content: str
    provider: str
    source: str  # "reference" | "template" | "default"

@router.post("/generate/from-reference", response_model=ReferenceGenerateResponse)
async def generate_from_reference(request: ReferenceGenerateRequest):
    """
    Generate LinkedIn post using style transfer from reference post
    
    Priority:
    1. If reference_post provided → mimic its style
    2. Else if template_id provided → use template
    3. Else → use default structure
    """
    try:
        logger.info(f"Generating post for topic: {request.topic[:50]}...")
        
        # PRIORITY 1: Reference post (style transfer)
        if request.reference_post and request.reference_post.strip():
            logger.info("Using reference post for style transfer")
            
            system_prompt = """You are an expert LinkedIn content analyst and writer. 
Your task is to analyze a reference post's style and create a new post on a different topic using the SAME style."""
            
            prompt = f"""REFERENCE POST (analyze this style):
{request.reference_post}

TASK:
Write a NEW LinkedIn post about: {request.topic}

CRITICAL REQUIREMENTS:
1. Analyze the reference post's:
   - Sentence length patterns
   - Paragraph structure and spacing
   - Emoji usage (count, placement, type)
   - Line breaks and formatting
   - CTA style (question, statement, call-to-action)
   - Tone (storytelling, authoritative, reflective, casual, etc.)
   - Opening hook style
   - Bullet/list usage
   
2. Create a NEW post about "{request.topic}" that:
   - Uses the SAME tone and voice
   - Has SIMILAR structure and spacing
   - Matches emoji density and placement
   - Mirrors line break patterns
   - Uses the SAME CTA approach
   - Has SIMILAR length

3. DO NOT copy the content, copy the STYLE
4. Return ONLY the post, no explanations

Generate the styled post now:"""

            source = "reference"
            
        # PRIORITY 2: Template
        elif request.template_id:
            logger.info(f"Using template: {request.template_id}")
            
            template_data = get_template(request.template_id)
            system_prompt = template_data["system"]
            prompt = template_data["template"].format(topic=request.topic)
            source = "template"
            
        # PRIORITY 3: Default
        else:
            logger.info("Using default LinkedIn post structure")
            
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
            source = "default"
        
        # Call LLM with fallback
        content, provider = await llm_manager.generate(
            prompt=prompt,
            system=system_prompt
        )
        
        if not content:
            raise HTTPException(
                status_code=503,
                detail="AI generation failed. Please ensure Ollama is running or configure Gemini API key."
            )
        
        logger.info(f"✓ Generated post using {provider} (source: {source}, {len(content)} chars)")
        
        return ReferenceGenerateResponse(
            success=True,
            content=content.strip(),
            provider=provider,
            source=source
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_from_reference: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
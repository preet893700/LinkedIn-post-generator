"""
Post editing actions (shorten, expand, emojis, hashtags, etc.)
Real implementation with Ollama → Gemini fallback
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.llm_manager import llm_manager
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class EditRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000, description="Content to edit")
    custom_instructions: Optional[str] = Field(None, description="Additional instructions")

class EditResponse(BaseModel):
    success: bool
    content: str
    provider: str

# Common system prompt for all editing actions
EDITOR_SYSTEM = "You are an expert LinkedIn content editor. Preserve the core message while applying the requested changes. Return ONLY the edited content, no explanations."

@router.post("/edit/shorten", response_model=EditResponse)
async def shorten_content(request: EditRequest):
    """Make content shorter and more concise"""
    try:
        prompt = f"""Make this LinkedIn post shorter and more concise while keeping the core message:

{request.content}

Requirements:
- Remove unnecessary words and phrases
- Keep the most impactful points
- Maintain professional tone
- Preserve formatting (line breaks, emojis)
- Aim for 30-40% reduction in length

Return ONLY the shortened post."""

        if request.custom_instructions:
            prompt += f"\n\nAdditional: {request.custom_instructions}"

        content, provider = await llm_manager.generate(prompt=prompt, system=EDITOR_SYSTEM)
        
        if not content:
            raise HTTPException(status_code=503, detail="Edit failed")
        
        logger.info(f"✓ Shortened content using {provider}")
        return EditResponse(success=True, content=content.strip(), provider=provider)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Shorten error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit/expand", response_model=EditResponse)
async def expand_content(request: EditRequest):
    """Make content longer with more details"""
    try:
        prompt = f"""Expand this LinkedIn post with more details, examples, and insights:

{request.content}

Requirements:
- Add relevant examples or anecdotes
- Elaborate on key points
- Maintain the original message
- Keep professional tone
- Preserve formatting
- Add 40-60% more content

Return ONLY the expanded post."""

        if request.custom_instructions:
            prompt += f"\n\nAdditional: {request.custom_instructions}"

        content, provider = await llm_manager.generate(prompt=prompt, system=EDITOR_SYSTEM)
        
        if not content:
            raise HTTPException(status_code=503, detail="Edit failed")
        
        logger.info(f"✓ Expanded content using {provider}")
        return EditResponse(success=True, content=content.strip(), provider=provider)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Expand error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit/add-emojis", response_model=EditResponse)
async def add_emojis(request: EditRequest):
    """Add relevant emojis to content"""
    try:
        prompt = f"""Add 3-6 relevant emojis to this LinkedIn post strategically:

{request.content}

Requirements:
- Place emojis where they enhance meaning
- Use professional, relevant emojis
- Don't overdo it (3-6 total)
- Keep the text unchanged except for emoji additions
- Common placements: start of lines, end of sentences, bullet points

Return ONLY the post with emojis added."""

        if request.custom_instructions:
            prompt += f"\n\nAdditional: {request.custom_instructions}"

        content, provider = await llm_manager.generate(prompt=prompt, system=EDITOR_SYSTEM)
        
        if not content:
            raise HTTPException(status_code=503, detail="Edit failed")
        
        logger.info(f"✓ Added emojis using {provider}")
        return EditResponse(success=True, content=content.strip(), provider=provider)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add emojis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit/add-hashtags", response_model=EditResponse)
async def add_hashtags(request: EditRequest):
    """Add relevant hashtags to content"""
    try:
        prompt = f"""Add 3-5 relevant hashtags at the end of this LinkedIn post:

{request.content}

Requirements:
- Choose hashtags relevant to the content
- Use popular LinkedIn hashtags when applicable
- Place them at the end of the post
- Format: #HashtagName (no spaces)
- Include mix of broad and specific hashtags

Return ONLY the post with hashtags added at the end."""

        if request.custom_instructions:
            prompt += f"\n\nAdditional: {request.custom_instructions}"

        content, provider = await llm_manager.generate(prompt=prompt, system=EDITOR_SYSTEM)
        
        if not content:
            raise HTTPException(status_code=503, detail="Edit failed")
        
        logger.info(f"✓ Added hashtags using {provider}")
        return EditResponse(success=True, content=content.strip(), provider=provider)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add hashtags error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit/improve", response_model=EditResponse)
async def improve_writing(request: EditRequest):
    """Improve overall writing quality"""
    try:
        prompt = f"""Improve the writing quality of this LinkedIn post:

{request.content}

Requirements:
- Enhance clarity and impact
- Improve word choice and flow
- Fix any grammar or spelling issues
- Make it more engaging
- Maintain the core message and tone
- Preserve formatting

Return ONLY the improved post."""

        if request.custom_instructions:
            prompt += f"\n\nAdditional: {request.custom_instructions}"

        content, provider = await llm_manager.generate(prompt=prompt, system=EDITOR_SYSTEM)
        
        if not content:
            raise HTTPException(status_code=503, detail="Edit failed")
        
        logger.info(f"✓ Improved content using {provider}")
        return EditResponse(success=True, content=content.strip(), provider=provider)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Improve error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit/rephrase", response_model=EditResponse)
async def rephrase_content(request: EditRequest):
    """Rephrase for clarity and impact"""
    try:
        prompt = f"""Rephrase this LinkedIn post for better clarity and impact:

{request.content}

Requirements:
- Keep the same meaning
- Use different words and sentence structures
- Make it more impactful
- Maintain professional tone
- Preserve formatting

Return ONLY the rephrased post."""

        if request.custom_instructions:
            prompt += f"\n\nAdditional: {request.custom_instructions}"

        content, provider = await llm_manager.generate(prompt=prompt, system=EDITOR_SYSTEM)
        
        if not content:
            raise HTTPException(status_code=503, detail="Edit failed")
        
        logger.info(f"✓ Rephrased content using {provider}")
        return EditResponse(success=True, content=content.strip(), provider=provider)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Rephrase error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit/fix-grammar", response_model=EditResponse)
async def fix_grammar(request: EditRequest):
    """Fix spelling and grammar errors"""
    try:
        prompt = f"""Fix any spelling and grammar errors in this LinkedIn post:

{request.content}

Requirements:
- Correct spelling mistakes
- Fix grammar errors
- Improve punctuation
- Keep the text otherwise unchanged
- Preserve formatting and style

Return ONLY the corrected post."""

        if request.custom_instructions:
            prompt += f"\n\nAdditional: {request.custom_instructions}"

        content, provider = await llm_manager.generate(prompt=prompt, system=EDITOR_SYSTEM)
        
        if not content:
            raise HTTPException(status_code=503, detail="Edit failed")
        
        logger.info(f"✓ Fixed grammar using {provider}")
        return EditResponse(success=True, content=content.strip(), provider=provider)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fix grammar error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit/simplify", response_model=EditResponse)
async def simplify_language(request: EditRequest):
    """Simplify language for broader accessibility"""
    try:
        prompt = f"""Simplify the language in this LinkedIn post for broader accessibility:

{request.content}

Requirements:
- Use simpler, more common words
- Shorten complex sentences
- Remove jargon where possible
- Keep the core message
- Maintain professional tone
- Preserve formatting

Return ONLY the simplified post."""

        if request.custom_instructions:
            prompt += f"\n\nAdditional: {request.custom_instructions}"

        content, provider = await llm_manager.generate(prompt=prompt, system=EDITOR_SYSTEM)
        
        if not content:
            raise HTTPException(status_code=503, detail="Edit failed")
        
        logger.info(f"✓ Simplified content using {provider}")
        return EditResponse(success=True, content=content.strip(), provider=provider)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Simplify error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
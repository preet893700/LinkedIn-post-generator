"""
API endpoints for post rewriting/editing
"""
from fastapi import APIRouter, HTTPException
from app.schemas.post_schemas import RewriteRequest, RewriteResponse, ActionType
from app.services.llm_manager import llm_manager
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

ACTION_PROMPTS = {
    ActionType.IMPROVE: {
        "system": "You are an expert LinkedIn content editor. Improve the writing quality while maintaining the core message and tone.",
        "prompt": "Improve this LinkedIn post. Make it more engaging and professional:\n\n{text}\n\nReturn ONLY the improved post, no explanations."
    },
    ActionType.REPHRASE: {
        "system": "You are an expert LinkedIn content editor. Rephrase content while keeping the same meaning.",
        "prompt": "Rephrase this LinkedIn post for better clarity and impact:\n\n{text}\n\nReturn ONLY the rephrased post, no explanations."
    },
    ActionType.FIX_GRAMMAR: {
        "system": "You are an expert editor. Fix spelling and grammar errors.",
        "prompt": "Fix spelling and grammar in this LinkedIn post:\n\n{text}\n\nReturn ONLY the corrected post, no explanations."
    },
    ActionType.MAKE_SHORTER: {
        "system": "You are an expert LinkedIn content editor. Make content more concise.",
        "prompt": "Make this LinkedIn post shorter and more concise:\n\n{text}\n\nReturn ONLY the shortened post, no explanations."
    },
    ActionType.MAKE_LONGER: {
        "system": "You are an expert LinkedIn content editor. Expand content with relevant details.",
        "prompt": "Make this LinkedIn post longer with more details and examples:\n\n{text}\n\nReturn ONLY the expanded post, no explanations."
    },
    ActionType.SIMPLIFY: {
        "system": "You are an expert LinkedIn content editor. Simplify language for broader accessibility.",
        "prompt": "Simplify the language in this LinkedIn post for broader accessibility:\n\n{text}\n\nReturn ONLY the simplified post, no explanations."
    },
    ActionType.ADD_EMOJIS: {
        "system": "You are an expert LinkedIn content editor. Add relevant emojis strategically.",
        "prompt": "Add relevant emojis to this LinkedIn post (2-5 emojis max, placed strategically):\n\n{text}\n\nReturn ONLY the post with emojis, no explanations."
    },
    ActionType.ADD_HASHTAGS: {
        "system": "You are an expert LinkedIn content editor. Add relevant hashtags.",
        "prompt": "Add 3-5 relevant hashtags at the end of this LinkedIn post:\n\n{text}\n\nReturn ONLY the post with hashtags, no explanations."
    },
    ActionType.CUSTOM: {
        "system": "You are an expert LinkedIn content editor. Follow the user's specific instructions.",
        "prompt": "Modify this LinkedIn post according to these instructions: {custom}\n\nOriginal post:\n{text}\n\nReturn ONLY the modified post, no explanations."
    }
}

@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite_post(request: RewriteRequest):
    """
    Rewrite/edit a LinkedIn post using AI
    """
    try:
        # Get action configuration
        if request.action not in ACTION_PROMPTS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid action: {request.action}"
            )
        
        action_config = ACTION_PROMPTS[request.action]
        
        # Build prompt
        if request.action == ActionType.CUSTOM and request.custom_instructions:
            prompt = action_config["prompt"].format(
                text=request.text,
                custom=request.custom_instructions
            )
        else:
            prompt = action_config["prompt"].format(text=request.text)
        
        # Generate with LLM
        result, provider = await llm_manager.generate(
            prompt=prompt,
            system=action_config["system"]
        )
        
        if not result:
            raise HTTPException(
                status_code=503,
                detail="AI rewrite failed. Please check if Ollama is running or configure Gemini API key."
            )
        
        return RewriteResponse(
            success=True,
            text=result,
            provider=provider,
            action=request.action.value
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Rewrite error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
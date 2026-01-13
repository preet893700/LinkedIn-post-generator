"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class ActionType(str, Enum):
    IMPROVE = "improve"
    REPHRASE = "rephrase"
    FIX_GRAMMAR = "fix_grammar"
    MAKE_SHORTER = "make_shorter"
    MAKE_LONGER = "make_longer"
    SIMPLIFY = "simplify"
    ADD_EMOJIS = "add_emojis"
    ADD_HASHTAGS = "add_hashtags"
    CUSTOM = "custom"

class GenerateRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=5000)
    template: Optional[str] = None
    custom_instructions: Optional[str] = None

class GenerateResponse(BaseModel):
    success: bool
    post: str
    provider: str  # "ollama" or "gemini"
    template_used: Optional[str] = None

class RewriteRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    action: ActionType
    custom_instructions: Optional[str] = None

class RewriteResponse(BaseModel):
    success: bool
    text: str
    provider: str
    action: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
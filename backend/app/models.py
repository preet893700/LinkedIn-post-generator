from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LinkedInPost(BaseModel):
    """Model for a LinkedIn post"""
    topic: str = Field(..., description="The topic of the post")
    text: str = Field(..., description="The generated post content")
    image: str = Field(..., description="Base64 encoded image")
    timestamp: Optional[str] = Field(None, description="ISO 8601 timestamp")
    status: str = Field(default="draft", description="Post status: draft, approved, published")

class GenerationRequest(BaseModel):
    """Request model for generating a post"""
    topic: str = Field(..., min_length=3, max_length=200, description="Topic for the LinkedIn post")
    
    class Config:
        json_schema_extra = {
            "example": {
                "topic": "AI in Healthcare"
            }
        }

class GenerationResponse(BaseModel):
    """Response model for generated content"""
    text: str = Field(..., description="Generated LinkedIn post text")
    image: str = Field(..., description="Base64 encoded generated image")
    
class ApprovalRequest(BaseModel):
    """Request model for approving a post"""
    topic: str = Field(..., description="The topic of the post")
    text: str = Field(..., description="The post content")
    image: str = Field(..., description="Base64 encoded image")
    
class ApprovalResponse(BaseModel):
    """Response model for approval"""
    status: str = Field(..., description="Status of the approval")
    message: str = Field(..., description="Human-readable message")
    post_id: Optional[int] = Field(None, description="ID of the saved post")

class PostListResponse(BaseModel):
    """Response model for listing posts"""
    posts: list = Field(..., description="List of published posts")
    total: int = Field(..., description="Total number of posts")
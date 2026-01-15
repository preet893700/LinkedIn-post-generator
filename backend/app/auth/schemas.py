"""
Enhanced Pydantic schemas for authentication
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshRequest(BaseModel):
    pass  # Refresh token comes from cookie

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class MessageResponse(BaseModel):
    message: str
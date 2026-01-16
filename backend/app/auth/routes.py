"""
Enhanced authentication routes with session management
"""
from fastapi import APIRouter, HTTPException, Depends, Response, Cookie, Header
from typing import Optional
from datetime import datetime, timedelta
from app.auth.schemas import (
    SignupRequest, LoginRequest, AuthResponse, MessageResponse
)
from app.auth.service import auth_service
from app.users.model import UserOut, UserProfileUpdate
from app.core.security import decode_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to get current user from access token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = await auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Update last active timestamp
    await auth_service.update_last_active(user_id)
    
    return user

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest, response: Response):
    """Register a new user with refresh token"""
    try:
        user = await auth_service.create_user(
            name=request.name,
            email=request.email,
            password=request.password
        )
        
        # Create tokens
        access_token, refresh_token, token_id = auth_service.create_tokens_for_user(user)
        
        # Store refresh token
        expires_at = datetime.utcnow() + timedelta(days=7)
        await auth_service.store_refresh_token(user.id, token_id, expires_at)
        
        # Set refresh token as HttpOnly cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "plan": user.plan,
                "avatar_url": user.avatar_url,
                "created_at": user.created_at.isoformat()
            }
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, response: Response):
    """Login user with refresh token"""
    try:
        user = await auth_service.authenticate_user(request.email, request.password)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create tokens
        access_token, refresh_token, token_id = auth_service.create_tokens_for_user(user)
        
        # Store refresh token
        expires_at = datetime.utcnow() + timedelta(days=7)
        await auth_service.store_refresh_token(user.id, token_id, expires_at)
        
        # Set refresh token as HttpOnly cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "plan": user.plan,
                "avatar_url": user.avatar_url,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(response: Response, refresh_token: Optional[str] = Cookie(None)):
    """Refresh access token using refresh token from cookie"""
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not found")
    
    try:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        user_id = payload.get("sub")
        token_id = payload.get("token_id")
        
        if not user_id or not token_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Validate refresh token
        is_valid = await auth_service.validate_refresh_token(user_id, token_id)
        if not is_valid:
            raise HTTPException(status_code=401, detail="Refresh token revoked or expired")
        
        # Get user
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Create new tokens (token rotation)
        new_access_token, new_refresh_token, new_token_id = auth_service.create_tokens_for_user(user)
        
        # Revoke old refresh token
        await auth_service.revoke_refresh_token(user_id, token_id)
        
        # Store new refresh token
        expires_at = datetime.utcnow() + timedelta(days=7)
        await auth_service.store_refresh_token(user.id, new_token_id, expires_at)
        
        # Set new refresh token cookie
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )
        
        return AuthResponse(
            access_token=new_access_token,
            token_type="bearer",
            user={
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "plan": user.plan,
                "avatar_url": user.avatar_url
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refresh error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    current_user=Depends(get_current_user),
    refresh_token: Optional[str] = Cookie(None)
):
    """Logout user and revoke refresh token"""
    try:
        if refresh_token:
            payload = decode_token(refresh_token)
            if payload and payload.get("token_id"):
                await auth_service.revoke_refresh_token(
                    str(current_user.id),
                    payload.get("token_id")
                )
        
        # Clear refresh token cookie
        response.delete_cookie(key="refresh_token")
        
        return MessageResponse(message="Logged out successfully")
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return MessageResponse(message="Logged out")

@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user=Depends(get_current_user)):
    """Get current user profile"""
    return UserOut(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        plan=current_user.plan,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )
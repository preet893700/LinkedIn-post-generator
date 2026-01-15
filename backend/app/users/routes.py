"""
User profile management routes
"""
from fastapi import APIRouter, HTTPException, Depends
from app.users.model import UserOut, UserProfileUpdate
from app.auth.routes import get_current_user
from app.auth.service import auth_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/profile", response_model=UserOut)
async def get_user_profile(current_user=Depends(get_current_user)):
    """Get user profile"""
    return UserOut(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        plan=current_user.plan,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )

@router.put("/profile", response_model=UserOut)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user=Depends(get_current_user)
):
    """Update user profile"""
    try:
        updated_user = await auth_service.update_user_profile(
            user_id=str(current_user.id),
            name=profile_update.name,
            email=profile_update.email
        )
        
        if not updated_user:
            raise HTTPException(status_code=400, detail="Failed to update profile")
        
        return UserOut(
            id=str(updated_user.id),
            name=updated_user.name,
            email=updated_user.email,
            plan=updated_user.plan,
            avatar_url=updated_user.avatar_url,
            created_at=updated_user.created_at,
            last_login=updated_user.last_login
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

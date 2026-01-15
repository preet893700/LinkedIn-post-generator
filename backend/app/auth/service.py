"""
Enhanced authentication service with session management
"""
from datetime import datetime, timedelta
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.core.security import (
    verify_password, get_password_hash, 
    create_access_token, create_refresh_token
)
from app.users.model import UserInDB, UserOut, RefreshToken
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.users_collection = None
    
    async def connect_db(self):
        if not self.client:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.users_collection = self.db.users
            await self.users_collection.create_index("email", unique=True)
            logger.info("Connected to MongoDB")
    
    async def close_db(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection")
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        user_dict = await self.users_collection.find_one({"email": email})
        if user_dict:
            return UserInDB(**user_dict)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        try:
            user_dict = await self.users_collection.find_one({"_id": ObjectId(user_id)})
            if user_dict:
                return UserInDB(**user_dict)
        except:
            pass
        return None
    
    async def create_user(self, name: str, email: str, password: str) -> UserInDB:
        existing_user = await self.get_user_by_email(email)
        if existing_user:
            raise ValueError("Email already registered")
        
        user = UserInDB(
            name=name,
            email=email,
            password_hash=get_password_hash(password),
            created_at=datetime.utcnow(),
            plan="free",
            is_active=True,
            refresh_tokens=[]
        )
        
        user_dict = user.dict(by_alias=True, exclude={"id"})
        result = await self.users_collection.insert_one(user_dict)
        user.id = result.inserted_id
        
        logger.info(f"Created user: {email}")
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        user = await self.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        
        await self.update_last_login(user.id)
        return user
    
    async def update_last_login(self, user_id: ObjectId):
        """Update user's last login timestamp"""
        await self.users_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "last_login": datetime.utcnow(),
                "last_active_at": datetime.utcnow()
            }}
        )
    
    async def update_last_active(self, user_id: str):
        """Update user's last activity timestamp"""
        try:
            await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_active_at": datetime.utcnow()}}
            )
        except:
            pass
    
    async def store_refresh_token(self, user_id: ObjectId, token_id: str, expires_at: datetime):
        """Store refresh token ID in user document"""
        refresh_token = RefreshToken(token_id=token_id, expires_at=expires_at)
        await self.users_collection.update_one(
            {"_id": user_id},
            {"$push": {"refresh_tokens": refresh_token.dict()}}
        )
    
    async def revoke_refresh_token(self, user_id: str, token_id: str):
        """Revoke a specific refresh token"""
        try:
            await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$pull": {"refresh_tokens": {"token_id": token_id}}}
            )
        except:
            pass
    
    async def revoke_all_refresh_tokens(self, user_id: str):
        """Revoke all refresh tokens for user (logout from all devices)"""
        try:
            await self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"refresh_tokens": []}}
            )
        except:
            pass
    
    async def validate_refresh_token(self, user_id: str, token_id: str) -> bool:
        """Check if refresh token is valid and not revoked"""
        try:
            user = await self.get_user_by_id(user_id)
            if not user:
                return False
            
            # Check if token exists and not expired
            for rt in user.refresh_tokens:
                if rt.token_id == token_id and rt.expires_at > datetime.utcnow():
                    return True
            return False
        except:
            return False
    
    async def update_user_profile(self, user_id: str, name: Optional[str] = None, 
                                  email: Optional[str] = None) -> Optional[UserInDB]:
        """Update user profile"""
        try:
            update_data = {}
            if name:
                update_data["name"] = name
            if email:
                # Check if email already exists
                existing = await self.get_user_by_email(email)
                if existing and str(existing.id) != user_id:
                    raise ValueError("Email already in use")
                update_data["email"] = email
            
            if update_data:
                await self.users_collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": update_data}
                )
            
            return await self.get_user_by_id(user_id)
        except:
            return None
    
    def create_tokens_for_user(self, user: UserInDB) -> tuple[str, str, str]:
        """Create both access and refresh tokens"""
        token_data = {
            "sub": str(user.id),
            "email": user.email
        }
        
        access_token = create_access_token(token_data)
        refresh_token, token_id = create_refresh_token(token_data)
        
        return access_token, refresh_token, token_id

auth_service = AuthService()
"""
Enhanced User model with session tracking and refresh tokens
(Pydantic v2 compatible)
"""

from datetime import datetime
from typing import Optional, List

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field
from pydantic_core import core_schema


# ✅ Pydantic v2 compatible ObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        schema.update(type="string")
        return schema


class RefreshToken(BaseModel):
    token_id: str
    expires_at: datetime


class UserInDB(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    email: EmailStr
    password_hash: str
    plan: str = "free"
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    refresh_tokens: List[RefreshToken] = Field(default_factory=list)
    is_active: bool = True

    model_config = {
        "populate_by_name": True,          # ✅ v2 replacement
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    plan: str
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {
        "from_attributes": True            # ✅ v2 replacement for orm_mode
    }


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

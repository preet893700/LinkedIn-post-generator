"""
Enhanced security with refresh tokens and session management
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
import secrets

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from passlib.context import CryptContext

from app.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -------------------------
# Password helpers
# -------------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# -------------------------
# JWT helpers
# -------------------------

def create_access_token(data: dict) -> str:
    """
    Create short-lived access token (10 minutes)
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=10)

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token(data: dict) -> Tuple[str, str]:
    """
    Create refresh token (7 days) with unique token ID
    """
    token_id = secrets.token_urlsafe(32)
    expire = datetime.utcnow() + timedelta(days=7)

    to_encode = data.copy()
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "token_id": token_id
    })

    token = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return token, token_id


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and verify JWT token
    """
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except ExpiredSignatureError:
        return None
    except JWTError:
        return None

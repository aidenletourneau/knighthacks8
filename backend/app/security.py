from datetime import datetime, timedelta, timezone
import os
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_ALG = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return str(payload.get("sub"))
    except JWTError:
        return None



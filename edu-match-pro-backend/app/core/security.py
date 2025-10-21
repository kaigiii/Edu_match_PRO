from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from app.core.config import settings


def get_password_hash(password: str) -> str:
    """將明文密碼使用 bcrypt 進行雜湊"""
    # 直接使用 bcrypt 避免 passlib 的版本問題
    password_bytes = password.encode('utf-8')
    # bcrypt 限制密碼長度為 72 字節
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """驗證明文密碼與雜湊密碼是否匹配"""
    # 直接使用 bcrypt 避免 passlib 的版本問題
    password_bytes = plain_password.encode('utf-8')
    # bcrypt 限制密碼長度為 72 字節
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """根據傳入的資料和過期時間，建立一個 JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """解碼並驗證 token 的有效性，回傳 payload"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        raise JWTError("Invalid token")


def verify_token(token: str) -> Optional[dict]:
    """驗證 token 並返回用戶信息"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None

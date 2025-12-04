from sqlmodel import SQLModel
from typing import Optional


class Token(SQLModel):
    """JWT Token 回應 Schema"""
    access_token: str
    token_type: str = "bearer"


class TokenData(SQLModel):
    """JWT Token 解碼後的資料結構"""
    sub: Optional[str] = None

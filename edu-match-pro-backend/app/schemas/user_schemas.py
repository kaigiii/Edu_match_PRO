from sqlmodel import SQLModel
from pydantic import EmailStr
from datetime import datetime
from typing import Optional
import uuid
from app.schemas.profile_schemas import ProfileCreate, ProfilePublic


class UserCreate(SQLModel):
    """使用者註冊 Schema"""
    email: EmailStr
    password: str
    role: str
    # 個人檔案資料
    profile: ProfileCreate


class UserPublic(SQLModel):
    """公開使用者資訊 Schema (不包含密碼)"""
    id: uuid.UUID
    email: EmailStr
    role: str
    created_at: datetime
    profile: Optional[ProfilePublic] = None
    
    class Config:
        from_attributes = True

import uuid
from typing import Optional
from sqlmodel import SQLModel
from datetime import datetime


class ProfileBase(SQLModel):
    """個人檔案基礎 Schema"""
    organization_name: str
    contact_person: str
    position: str
    phone: str
    address: str
    tax_id: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileCreate(ProfileBase):
    """創建個人檔案 Schema"""
    pass


class ProfileUpdate(SQLModel):
    """更新個人檔案 Schema"""
    organization_name: Optional[str] = None
    contact_person: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfilePublic(ProfileBase):
    """用於回傳企業公開資料的 Schema"""
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

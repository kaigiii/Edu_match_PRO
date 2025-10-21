"""
模擬用戶模型
專門用於演示和測試的用戶帳號
"""
from sqlmodel import Field, Relationship
from datetime import datetime
from typing import Optional
import uuid

from app.models.base import BaseModel


class DemoUser(BaseModel, table=True):
    """模擬用戶表"""
    __tablename__ = "demo_users"
    
    email: str = Field(unique=True, nullable=False, index=True, max_length=255)
    password: str = Field(nullable=False, max_length=255)  # 加密存儲
    role: str = Field(nullable=False, max_length=50)  # 'school' | 'company'
    display_name: str = Field(nullable=False, max_length=255)  # 顯示名稱
    description: Optional[str] = Field(default=None)  # 用戶描述
    is_active: bool = Field(default=True)  # 是否啟用
    is_demo_only: bool = Field(default=True)  # 標記為僅演示用
    last_used_at: Optional[datetime] = Field(default=None)  # 最後使用時間
    usage_count: int = Field(default=0)  # 使用次數統計
    
    # 關聯關係
    profile: Optional["DemoProfile"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class DemoProfile(BaseModel, table=True):
    """模擬用戶檔案表"""
    __tablename__ = "demo_profiles"
    
    user_id: uuid.UUID = Field(foreign_key="demo_users.id", nullable=False, index=True)
    organization_name: str = Field(nullable=False, max_length=255)
    contact_person: str = Field(nullable=False, max_length=255)
    position: str = Field(nullable=False, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None, max_length=500)  # 頭像URL
    
    # 關聯關係
    user: Optional["DemoUser"] = Relationship(back_populates="profile")

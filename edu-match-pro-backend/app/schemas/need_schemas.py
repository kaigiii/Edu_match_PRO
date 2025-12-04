import uuid
from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel
from app.models.need import UrgencyLevel, NeedStatus


class NeedBase(SQLModel):
    """基礎 Need Schema，包含所有共用的欄位"""
    title: str
    description: str
    category: str
    location: str
    student_count: int
    image_url: Optional[str] = None
    urgency: UrgencyLevel
    sdgs: List[int] = []


class NeedCreate(NeedBase):
    """用於建立新需求的 Schema"""
    pass


class NeedUpdate(SQLModel):
    """用於更新需求的 Schema，所有欄位都是可選的"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    student_count: Optional[int] = None
    image_url: Optional[str] = None
    urgency: Optional[UrgencyLevel] = None
    sdgs: Optional[List[int]] = None


class NeedPublic(NeedBase):
    """用於回傳需求資料的 Schema，包含資料庫生成的欄位"""
    id: uuid.UUID
    school_id: uuid.UUID
    status: NeedStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

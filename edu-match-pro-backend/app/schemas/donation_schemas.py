import uuid
from datetime import datetime
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel
from app.models.donation import DonationStatus
from app.schemas.need_schemas import NeedPublic
from app.schemas.user_schemas import UserPublic


# 捐贈類型枚舉
class DonationTypeEnum(str, Enum):
    material = "物資"
    funding = "經費"
    teacher = "師資"


class DonationBase(SQLModel):
    """基礎 Donation Schema，包含捐贈專案的基本資訊"""
    donation_type: str
    description: Optional[str] = None
    progress: int = 0


class DonationCreate(SQLModel):
    """用於企業發起認捐的 Schema"""
    need_id: uuid.UUID
    donation_type: str
    description: Optional[str] = None


class DonationPublic(DonationBase):
    """用於回傳捐贈專案詳細資訊的 Schema"""
    id: uuid.UUID
    need_id: uuid.UUID
    company_id: uuid.UUID
    status: DonationStatus
    created_at: datetime
    completion_date: Optional[datetime] = None
    need: Optional[NeedPublic] = None
    company: Optional[UserPublic] = None

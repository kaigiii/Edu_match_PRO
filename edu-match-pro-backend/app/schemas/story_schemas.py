import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel
from app.schemas.donation_schemas import DonationPublic


class ImpactStoryBase(SQLModel):
    """基礎影響力故事 Schema"""
    title: str
    content: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    impact_metrics: Optional[str] = None


class ImpactStoryCreate(ImpactStoryBase):
    """建立影響力故事的 Schema"""
    donation_id: uuid.UUID


class ImpactStoryPublic(ImpactStoryBase):
    """公開的影響力故事 Schema"""
    id: uuid.UUID
    donation_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    donation: Optional[DonationPublic] = None

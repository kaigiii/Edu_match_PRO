import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel
from app.models.activity_log import ActivityType


class ActivityLogPublic(SQLModel):
    """公開的活動日誌 Schema"""
    id: uuid.UUID
    user_id: uuid.UUID
    activity_type: ActivityType
    description: str
    extra_data: Optional[str] = None
    created_at: datetime

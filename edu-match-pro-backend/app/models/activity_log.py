from sqlmodel import Field
from typing import Optional
from enum import Enum
import uuid
from app.models.base import BaseModel


class ActivityType(str, Enum):
    user_register = "user_register"
    user_login = "user_login"
    need_created = "need_created"
    need_updated = "need_updated"
    donation_created = "donation_created"
    donation_approved = "donation_approved"
    donation_completed = "donation_completed"
    impact_story_created = "impact_story_created"


class ActivityLog(BaseModel, table=True):
    __tablename__ = "activity_log"
    
    user_id: uuid.UUID
    activity_type: ActivityType
    description: str
    extra_data: Optional[str] = Field(default=None)  # JSON 字串儲存額外資訊

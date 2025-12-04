import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, ForeignKey
from typing import Optional, TYPE_CHECKING
from enum import Enum
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.need import Need
    from app.models.impact_story import ImpactStory


class DonationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Donation(BaseModel, table=True):
    __tablename__ = "donation"
    
    company_id: uuid.UUID = Field(foreign_key="user.id")
    need_id: uuid.UUID = Field(foreign_key="need.id")
    donation_type: str
    description: Optional[str] = Field(default=None)
    progress: int = Field(default=0)
    status: DonationStatus = Field(default=DonationStatus.pending)
    completion_date: Optional[datetime] = Field(default=None)
    
    # 反向關聯到 User (企業)
    company: Optional["User"] = Relationship(back_populates="donations")
    
    # 反向關聯到 Need
    need: Optional["Need"] = Relationship(back_populates="donations")
    
    # 一對一關聯到 ImpactStory
    impact_story: Optional["ImpactStory"] = Relationship(back_populates="donation")

import uuid
from sqlmodel import SQLModel, Field, Relationship, ForeignKey
from typing import Optional, TYPE_CHECKING
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.donation import Donation


class ImpactStory(BaseModel, table=True):
    __tablename__ = "impact_story"
    
    donation_id: uuid.UUID = Field(foreign_key="donation.id")
    title: str
    content: str
    image_url: Optional[str] = Field(default=None)
    video_url: Optional[str] = Field(default=None)
    impact_metrics: Optional[str] = Field(default=None)  # JSON 字串儲存影響力指標
    
    # 反向關聯到 Donation
    donation: Optional["Donation"] = Relationship(back_populates="impact_story")

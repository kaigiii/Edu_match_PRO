from sqlmodel import Field, Relationship, Column
from typing import Optional, List, TYPE_CHECKING
from enum import Enum
from sqlalchemy import ARRAY, Integer
import uuid
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.donation import Donation


class UrgencyLevel(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class NeedStatus(str, Enum):
    active = "active"
    in_progress = "in_progress"
    completed = "completed"


class Need(BaseModel, table=True):
    __tablename__ = "need"
    
    school_id: uuid.UUID = Field(foreign_key="user.id")
    title: str
    description: str
    category: str
    location: str
    student_count: int
    image_url: Optional[str] = Field(default=None)
    urgency: UrgencyLevel
    sdgs: List[int] = Field(sa_column=Column(ARRAY(Integer)))
    status: NeedStatus = Field(default=NeedStatus.active)
    
    # 反向關聯到 User (學校)
    school: Optional["User"] = Relationship(back_populates="needs")
    
    # 一對多關聯到 Donation
    donations: List["Donation"] = Relationship(back_populates="need")

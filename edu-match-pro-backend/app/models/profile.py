import uuid
from sqlmodel import SQLModel, Field, Relationship, ForeignKey
from typing import Optional, TYPE_CHECKING
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User


class Profile(BaseModel, table=True):
    __tablename__ = "profile"
    
    user_id: uuid.UUID = Field(foreign_key="user.id")
    organization_name: str
    contact_person: str
    position: str
    phone: str
    address: str
    tax_id: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None)
    
    # 反向關聯到 User
    user: Optional["User"] = Relationship(back_populates="profile")

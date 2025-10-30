import uuid
from sqlmodel import SQLModel, Field, Relationship, ForeignKey
from typing import Optional, TYPE_CHECKING
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User


class Profile(BaseModel, table=True):
    """
    用戶檔案表
    同時支持正式用戶和演示用戶
    部分字段設為可選以適應不同場景
    """
    __tablename__ = "profile"
    
    user_id: uuid.UUID = Field(foreign_key="user.id", unique=True, index=True)
    
    # 組織資訊（必填）
    organization_name: str = Field(max_length=255)
    
    # 聯絡資訊（改為可選以支持 demo 用戶）
    contact_person: Optional[str] = Field(default=None, max_length=255)
    position: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None)
    
    # 額外資訊（可選）
    tax_id: Optional[str] = Field(default=None, max_length=50)
    bio: Optional[str] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    
    # 反向關聯到 User
    user: Optional["User"] = Relationship(back_populates="profile")

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Enum as SAEnum
from typing import Optional, List, TYPE_CHECKING
from enum import Enum
from datetime import datetime
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.profile import Profile
    from app.models.need import Need
    from app.models.donation import Donation


class UserRole(str, Enum):
    SCHOOL = "school"
    COMPANY = "company"


class User(BaseModel, table=True):
    __tablename__ = "user"
    
    email: str = Field(unique=True, index=True)
    password: str  # 儲存雜湊後的密碼
    role: UserRole = Field(
        sa_column=Column(
            SAEnum(UserRole, name="userrole", values_callable=lambda x: [e.value for e in x]),
            nullable=False
        )
    )
    
    # Demo 用戶相關字段
    is_demo: bool = Field(default=False)  # 標記是否為演示帳號
    display_name: Optional[str] = Field(default=None, max_length=255)  # 顯示名稱（主要用於 demo）
    description: Optional[str] = Field(default=None)  # 用戶描述
    is_active: bool = Field(default=True)  # 是否啟用
    last_used_at: Optional[datetime] = Field(default=None)  # 最後使用時間
    usage_count: int = Field(default=0)  # 使用次數統計
    
    # 一對一關聯到 Profile
    profile: Optional["Profile"] = Relationship(back_populates="user")
    
    # 一對多關聯到 Need (如果是學校)
    needs: List["Need"] = Relationship(back_populates="school")
    
    # 一對多關聯到 Donation (如果是企業)
    donations: List["Donation"] = Relationship(back_populates="company")

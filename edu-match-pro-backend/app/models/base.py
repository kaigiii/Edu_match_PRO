from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid


class BaseModel(SQLModel):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)

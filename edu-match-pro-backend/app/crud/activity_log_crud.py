import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.activity_log import ActivityLog, ActivityType


async def create_activity_log(
    session: AsyncSession,
    user_id: uuid.UUID,
    activity_type: ActivityType,
    description: str,
    extra_data: Optional[str] = None
) -> ActivityLog:
    """建立活動日誌記錄"""
    activity_log = ActivityLog(
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        extra_data=extra_data
    )
    
    session.add(activity_log)
    await session.commit()
    await session.refresh(activity_log)
    
    return activity_log


async def get_activity_logs_by_user(
    session: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 20
) -> List[ActivityLog]:
    """獲取特定使用者的最近活動記錄"""
    result = await session.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def get_recent_activity_logs(
    session: AsyncSession,
    limit: int = 50
) -> List[ActivityLog]:
    """獲取最近的活動記錄（公開）"""
    result = await session.execute(
        select(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def get_recent_activity(
    session: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 20
) -> List[ActivityLog]:
    """獲取用戶的最近活動記錄"""
    return await get_activity_logs_by_user(session, user_id, limit)

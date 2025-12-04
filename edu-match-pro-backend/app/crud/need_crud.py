import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.need import Need, NeedStatus
from app.models.activity_log import ActivityType
from app.schemas.need_schemas import NeedCreate, NeedUpdate
from app.crud.activity_log_crud import create_activity_log
from app.crud.base_crud import BaseCRUD
from app.core.exceptions import NotFoundError, ValidationError


# 創建 Need CRUD 實例
need_crud = BaseCRUD(Need)

async def create_need(session: AsyncSession, need_in: NeedCreate, school_id: uuid.UUID) -> Need:
    """建立新的需求"""
    # 驗證輸入數據
    if not need_in.title or not need_in.title.strip():
        raise ValidationError("需求標題不能為空")
    
    if need_in.student_count <= 0:
        raise ValidationError("學生數量必須大於 0")
    
    # 創建需求數據
    need_data = need_in.dict()
    need_data['school_id'] = school_id
    need_data['status'] = NeedStatus.active  # 設置默認狀態
    
    # 使用 BaseCRUD 的 create 方法
    return await need_crud.create(session, need_data)


async def get_need_by_id(session: AsyncSession, need_id: uuid.UUID) -> Optional[Need]:
    """根據 ID 獲取需求"""
    return await need_crud.get(session, need_id)


async def get_needs_by_school(session: AsyncSession, school_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Need]:
    """獲取特定學校的所有需求"""
    return await need_crud.get_multi(
        session=session,
        skip=skip,
        limit=limit,
        filters={'school_id': school_id}
    )


async def get_all_needs(session: AsyncSession, skip: int = 0, limit: int = 100) -> List[Need]:
    """
    獲取所有需求（排除演示用戶創建的需求）
    
    現在使用統一的 User 表，通過 is_demo 字段區分演示用戶
    """
    from app.models.user import User
    from sqlalchemy import select, not_
    
    # 獲取所有演示用戶的 ID
    demo_users_result = await session.execute(
        select(User.id).where(User.is_demo == True, User.is_active == True)
    )
    demo_user_ids = [user_id[0] for user_id in demo_users_result.fetchall()]
    
    # 查詢所有需求，但排除演示用戶創建的需求
    if demo_user_ids:
        result = await session.execute(
            select(Need)
            .where(not_(Need.school_id.in_(demo_user_ids)))
            .offset(skip)
            .limit(limit)
            .order_by(Need.created_at.desc())
        )
    else:
        # 如果沒有演示用戶，返回所有需求
        result = await session.execute(
            select(Need)
            .offset(skip)
            .limit(limit)
            .order_by(Need.created_at.desc())
        )
    
    return result.scalars().all()


async def get_all_needs_for_companies(session: AsyncSession, skip: int = 0, limit: int = 100) -> List[Need]:
    """獲取所有需求（包括模擬用戶需求，供企業查看）"""
    from sqlalchemy import select
    
    # 查詢所有需求，包括模擬用戶創建的需求
    result = await session.execute(
        select(Need)
        .offset(skip)
        .limit(limit)
        .order_by(Need.created_at.desc())
    )
    
    return result.scalars().all()


async def update_need(session: AsyncSession, db_need: Need, need_in: NeedUpdate) -> Need:
    """更新需求"""
    # 使用 BaseCRUD 的 update 方法
    return await need_crud.update(session, db_need, need_in)


async def delete_need(session: AsyncSession, db_need: Need) -> None:
    """刪除需求"""
    # 使用 BaseCRUD 的 delete 方法
    await need_crud.delete(session, db_need.id)

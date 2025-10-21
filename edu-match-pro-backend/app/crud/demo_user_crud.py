"""
模擬用戶 CRUD 操作
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List
from datetime import datetime
import uuid

from app.models.demo_user import DemoUser, DemoProfile
from app.core.security import get_password_hash, verify_password
from app.crud.base_crud import BaseCRUD

# 創建 DemoUser CRUD 實例
demo_user_crud = BaseCRUD(DemoUser)

async def create_demo_user(
    session: AsyncSession, 
    email: str, 
    password: str, 
    role: str,
    display_name: str,
    description: str = None,
    profile_data: dict = None
) -> DemoUser:
    """創建模擬用戶"""
    # 檢查是否已存在
    existing_user = await get_demo_user_by_email(session, email)
    if existing_user:
        raise ValueError(f"Demo user with email {email} already exists")
    
    # 創建用戶
    demo_user = DemoUser(
        email=email,
        password=get_password_hash(password),
        role=role,
        display_name=display_name,
        description=description,
        is_active=True,
        is_demo_only=True
    )
    
    session.add(demo_user)
    await session.flush()  # 獲取 user_id
    
    # 創建檔案
    if profile_data:
        demo_profile = DemoProfile(
            user_id=demo_user.id,
            organization_name=profile_data.get("organization_name", display_name),
            contact_person=profile_data.get("contact_person", display_name),
            position=profile_data.get("position", "校長" if role == "school" else "執行長"),
            phone=profile_data.get("phone"),
            address=profile_data.get("address"),
            bio=profile_data.get("bio", description)
        )
        session.add(demo_profile)
    
    await session.commit()
    await session.refresh(demo_user)
    return demo_user


async def get_demo_user_by_email(session: AsyncSession, email: str) -> Optional[DemoUser]:
    """根據email獲取模擬用戶"""
    result = await session.execute(
        select(DemoUser).where(DemoUser.email == email, DemoUser.is_active == True)
    )
    return result.scalar_one_or_none()


async def authenticate_demo_user(session: AsyncSession, email: str, password: str) -> Optional[DemoUser]:
    """驗證模擬用戶登入"""
    user = await get_demo_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    
    # 直接更新使用統計，避免異步任務問題
    await update_demo_user_usage(session, user.id)
    return user


async def update_demo_user_usage_async(session: AsyncSession, user_id: uuid.UUID):
    """非同步更新模擬用戶使用統計"""
    try:
        await session.execute(
            update(DemoUser)
            .where(DemoUser.id == user_id)
            .values(
                last_used_at=datetime.utcnow(),
                usage_count=DemoUser.usage_count + 1
            )
        )
        await session.commit()
    except Exception as e:
        # 統計更新失敗不影響登入
        print(f"統計更新失敗: {e}")
        pass


async def update_demo_user_usage(session: AsyncSession, user_id: uuid.UUID):
    """更新模擬用戶使用統計"""
    # 使用單一查詢直接更新，避免先查詢再更新
    await session.execute(
        update(DemoUser)
        .where(DemoUser.id == user_id)
        .values(
            last_used_at=datetime.utcnow(),
            usage_count=DemoUser.usage_count + 1  # 直接在資料庫層面加1
        )
    )
    await session.commit()


async def get_all_demo_users(session: AsyncSession) -> List[DemoUser]:
    """獲取所有模擬用戶"""
    result = await session.execute(
        select(DemoUser).where(DemoUser.is_active == True)
    )
    return result.scalars().all()


async def get_demo_users_by_role(session: AsyncSession, role: str) -> List[DemoUser]:
    """根據角色獲取模擬用戶"""
    result = await session.execute(
        select(DemoUser).where(
            DemoUser.role == role,
            DemoUser.is_active == True
        )
    )
    return result.scalars().all()


async def deactivate_demo_user(session: AsyncSession, user_id: uuid.UUID):
    """停用模擬用戶"""
    await session.execute(
        update(DemoUser)
        .where(DemoUser.id == user_id)
        .values(is_active=False)
    )
    await session.commit()

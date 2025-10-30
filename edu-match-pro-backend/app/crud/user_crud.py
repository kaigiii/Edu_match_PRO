from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List
from datetime import datetime
import uuid

from app.models.user import User, UserRole
from app.models.profile import Profile
from app.schemas.user_schemas import UserCreate
from app.core.security import get_password_hash, verify_password


async def get_user_by_email(session: AsyncSession, email: str, include_inactive: bool = False) -> Optional[User]:
    """
    根據 email 查詢使用者
    
    Args:
        session: 數據庫會話
        email: 用戶郵箱
        include_inactive: 是否包含未啟用的用戶
    """
    query = select(User).where(User.email == email)
    if not include_inactive:
        query = query.where(User.is_active == True)
    
    result = await session.execute(query)
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, user_in: UserCreate) -> User:
    """
    建立新使用者及個人檔案（正式用戶）
    
    Args:
        session: 數據庫會話
        user_in: 用戶創建數據
    """
    # 將明文密碼進行雜湊處理
    hashed_password = get_password_hash(user_in.password)
    
    # 建立新的使用者物件
    db_user = User(
        email=user_in.email,
        password=hashed_password,
        role=user_in.role.lower(),  # 直接使用小寫字串
        is_demo=False  # 正式用戶
    )
    
    # 將使用者加入 session 並提交
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    
    # 建立對應的個人檔案
    db_profile = Profile(
        user_id=db_user.id,
        organization_name=user_in.profile.organization_name,
        contact_person=user_in.profile.contact_person,
        position=user_in.profile.position,
        phone=user_in.profile.phone,
        address=user_in.profile.address,
        tax_id=user_in.profile.tax_id,
        bio=user_in.profile.bio,
        avatar_url=user_in.profile.avatar_url
    )
    
    session.add(db_profile)
    await session.commit()
    await session.refresh(db_profile)
    
    # 重新加載用戶以包含 profile 關聯
    await session.refresh(db_user, ["profile"])
    
    return db_user


async def create_demo_user(
    session: AsyncSession,
    email: str,
    password: str,
    role: str,
    display_name: str,
    description: str = None,
    profile_data: dict = None
) -> User:
    """
    創建演示用戶
    
    Args:
        session: 數據庫會話
        email: 郵箱
        password: 密碼
        role: 角色 (school/company)
        display_name: 顯示名稱
        description: 描述
        profile_data: 檔案數據字典
    """
    # 檢查是否已存在
    existing_user = await get_user_by_email(session, email, include_inactive=True)
    if existing_user:
        raise ValueError(f"用戶郵箱 {email} 已存在")
    
    # 創建演示用戶
    demo_user = User(
        email=email,
        password=get_password_hash(password),
        role=role,
        is_demo=True,
        display_name=display_name,
        description=description,
        is_active=True
    )
    
    session.add(demo_user)
    await session.flush()  # 獲取 user_id
    
    # 創建檔案
    if profile_data:
        demo_profile = Profile(
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


async def authenticate_user(session: AsyncSession, email: str, password: str) -> Optional[User]:
    """
    驗證用戶登入（支持正式用戶和演示用戶）
    
    Args:
        session: 數據庫會話
        email: 郵箱
        password: 密碼
    """
    user = await get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    
    # 如果是演示用戶，更新使用統計
    if user.is_demo:
        await update_user_usage(session, user.id)
    
    return user


async def update_user_usage(session: AsyncSession, user_id: uuid.UUID):
    """
    更新用戶使用統計（主要用於演示用戶）
    
    Args:
        session: 數據庫會話
        user_id: 用戶ID
    """
    await session.execute(
        update(User)
        .where(User.id == user_id)
        .values(
            last_used_at=datetime.utcnow(),
            usage_count=User.usage_count + 1
        )
    )
    await session.commit()


async def get_all_users(session: AsyncSession, is_demo: Optional[bool] = None) -> List[User]:
    """
    獲取所有用戶
    
    Args:
        session: 數據庫會話
        is_demo: 是否只獲取演示用戶 (None=全部, True=只演示, False=只正式)
    """
    query = select(User).where(User.is_active == True)
    
    if is_demo is not None:
        query = query.where(User.is_demo == is_demo)
    
    result = await session.execute(query)
    return result.scalars().all()


async def get_users_by_role(session: AsyncSession, role: str, is_demo: Optional[bool] = None) -> List[User]:
    """
    根據角色獲取用戶
    
    Args:
        session: 數據庫會話
        role: 用戶角色
        is_demo: 是否只獲取演示用戶
    """
    query = select(User).where(
        User.role == role,
        User.is_active == True
    )
    
    if is_demo is not None:
        query = query.where(User.is_demo == is_demo)
    
    result = await session.execute(query)
    return result.scalars().all()


async def deactivate_user(session: AsyncSession, user_id: uuid.UUID):
    """
    停用用戶
    
    Args:
        session: 數據庫會話
        user_id: 用戶ID
    """
    await session.execute(
        update(User)
        .where(User.id == user_id)
        .values(is_active=False)
    )
    await session.commit()

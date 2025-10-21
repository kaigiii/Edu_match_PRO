from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.models.user import User, UserRole
from app.schemas.user_schemas import UserCreate
from app.core.security import get_password_hash, verify_password


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    """根據 email 查詢使用者"""
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, user_in: UserCreate) -> User:
    """建立新使用者"""
    # 將明文密碼進行雜湊處理
    hashed_password = get_password_hash(user_in.password)
    
    # 建立新的使用者物件
    db_user = User(
        email=user_in.email,
        password=hashed_password,
        role=user_in.role.lower()  # 直接使用小寫字串
    )
    
    # 將使用者加入 session 並提交
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    
    return db_user


async def authenticate_user(session: AsyncSession, email: str, password: str) -> Optional[User]:
    """驗證用戶登入"""
    user = await get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user

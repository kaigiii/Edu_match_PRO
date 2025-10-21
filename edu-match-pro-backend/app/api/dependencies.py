"""
簡化的 API 依賴
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db import get_session
from app.models.user import User
from app.models.demo_user import DemoUser
from sqlalchemy import select
from app.core.security import verify_token
from app.core.exceptions import UnauthorizedError

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> User:
    """獲取當前用戶（支援真實用戶和模擬用戶）"""
    token = credentials.credentials
    
    # 驗證 token 並獲取用戶信息
    user_data = verify_token(token)
    if not user_data:
        raise UnauthorizedError("Invalid authentication credentials")
    
    # 從資料庫查詢用戶
    user_id = user_data.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token payload")

    # 確保 user_id 是 UUID 格式
    try:
        import uuid
        user_uuid = uuid.UUID(str(user_id))
        
        # 檢查是否為模擬用戶
        is_demo = user_data.get("is_demo", False)
        
        if is_demo:
            # 查詢模擬用戶表
            result = await session.execute(select(DemoUser).where(DemoUser.id == user_uuid))
            demo_user = result.scalar_one_or_none()
            if not demo_user or not demo_user.email:
                raise UnauthorizedError("Demo user not found")
            
            # 將模擬用戶轉換為 User 對象（用於兼容性）
            user = User(
                id=demo_user.id,
                email=demo_user.email,
                password=demo_user.password,
                role=demo_user.role,
                created_at=demo_user.created_at,
                updated_at=demo_user.updated_at
            )
            return user
        else:
            # 查詢真實用戶表
            result = await session.execute(select(User).where(User.id == user_uuid))
            user = result.scalar_one_or_none()
            if not user or not user.email:
                raise UnauthorizedError("User not found")
            return user
            
    except (ValueError, TypeError) as e:
        raise UnauthorizedError(f"Invalid user ID format: {str(e)}")

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    session: AsyncSession = Depends(get_session)
) -> Optional[User]:
    """獲取當前用戶（可選）"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, session)
    except UnauthorizedError:
        return None


# 權限檢查依賴項（向後兼容）
async def require_company_user(current_user: User = Depends(get_current_user)) -> User:
    """要求企業用戶權限"""
    if current_user.role != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company users can access this resource"
        )
    return current_user


async def require_school_user(current_user: User = Depends(get_current_user)) -> User:
    """要求學校用戶權限"""
    if current_user.role != "school":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only school users can access this resource"
        )
    return current_user

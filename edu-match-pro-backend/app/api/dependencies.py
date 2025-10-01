"""
簡化的 API 依賴
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_session
from app.models.user import User
from app.core.security import verify_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> User:
    """獲取當前用戶"""
    token = credentials.credentials
    
    # 驗證 token 並獲取用戶信息
    user_data = verify_token(token)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 從數據庫獲取用戶
    # 這裡需要實現根據 user_data 獲取用戶的邏輯
    # 暫時返回模擬用戶
    return User(
        id=user_data.get("user_id"),
        email=user_data.get("email"),
        role=user_data.get("role", "school")
    )

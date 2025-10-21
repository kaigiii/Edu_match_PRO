"""
模擬登入 API
專門用於演示和測試的認證端點
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.db import get_session
from app.schemas.token_schemas import Token
from app.schemas.user_schemas import UserPublic
from app.crud.demo_user_crud import (
    create_demo_user, 
    authenticate_demo_user, 
    get_all_demo_users,
    get_demo_users_by_role
)
from app.core.security import create_access_token
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/demo", tags=["Demo Authentication"])


@router.post("/auth/login", response_model=Token)
async def demo_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session)
):
    """模擬用戶登入"""
    # 驗證模擬用戶
    demo_user = await authenticate_demo_user(session, form_data.username, form_data.password)
    if not demo_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid demo credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 創建 JWT token，標記為模擬用戶
    access_token = create_access_token(
        data={
            "sub": str(demo_user.id), 
            "role": demo_user.role,
            "is_demo": True,  # 標記為模擬用戶
            "display_name": demo_user.display_name
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/users/me", response_model=UserPublic)
async def get_demo_me(current_user: User = Depends(get_current_user)):
    """取得當前模擬用戶資訊"""
    # 這裡需要檢查是否為模擬用戶
    # 實際實作中需要從 token 中解析 is_demo 標記
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at,
    )


@router.get("/users", response_model=List[UserPublic])
async def list_demo_users(session: AsyncSession = Depends(get_session)):
    """列出所有模擬用戶（管理員功能）"""
    demo_users = await get_all_demo_users(session)
    return [
        UserPublic(
            id=user.id,
            email=user.email,
            role=user.role,
            created_at=user.created_at
        ) for user in demo_users
    ]


@router.get("/users/{role}", response_model=List[UserPublic])
async def list_demo_users_by_role(
    role: str,
    session: AsyncSession = Depends(get_session)
):
    """根據角色列出模擬用戶"""
    if role not in ["school", "company"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'school' or 'company'"
        )
    
    demo_users = await get_demo_users_by_role(session, role)
    return [
        UserPublic(
            id=user.id,
            email=user.email,
            role=user.role,
            created_at=user.created_at
        ) for user in demo_users
    ]


@router.post("/users", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def create_demo_user_endpoint(
    email: str,
    password: str,
    role: str,
    display_name: str,
    description: str = None,
    session: AsyncSession = Depends(get_session)
):
    """創建新的模擬用戶（管理員功能）"""
    if role not in ["school", "company"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'school' or 'company'"
        )
    
    try:
        demo_user = await create_demo_user(
            session=session,
            email=email,
            password=password,
            role=role,
            display_name=display_name,
            description=description
        )
        
        return UserPublic(
            id=demo_user.id,
            email=demo_user.email,
            role=demo_user.role,
            created_at=demo_user.created_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

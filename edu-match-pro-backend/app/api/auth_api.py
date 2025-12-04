"""
統一認證 API
支持正式用戶和演示用戶的認證
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db import get_session
from app.schemas.token_schemas import Token
from app.schemas.user_schemas import UserCreate, UserPublic
from app.crud.user_crud import (
    create_user, 
    create_demo_user,
    get_user_by_email, 
    authenticate_user,
    get_all_users,
    get_users_by_role
)
from app.core.security import create_access_token
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Authentication"])

@router.post("/auth/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_session)
):
    """用戶註冊"""
    # 檢查用戶是否已存在
    existing_user = await get_user_by_email(session, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 創建新用戶（包含 Profile）
    user = await create_user(session, user_in)
    
    # 構建回應（包含 profile 資料）
    from app.schemas.profile_schemas import ProfilePublic
    
    response = UserPublic(
        id=user.id,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        profile=ProfilePublic(
            id=user.profile.id,
            user_id=user.profile.user_id,
            organization_name=user.profile.organization_name,
            contact_person=user.profile.contact_person,
            position=user.profile.position,
            phone=user.profile.phone,
            address=user.profile.address,
            tax_id=user.profile.tax_id,
            bio=user.profile.bio,
            avatar_url=user.profile.avatar_url,
            created_at=user.profile.created_at,
            updated_at=user.profile.updated_at
        ) if user.profile else None
    )
    
    return response

@router.post("/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session)
):
    """用戶登入"""
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/users/me", response_model=UserPublic)
async def get_me(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """取得當前使用者資訊（包含 profile），支持正式和演示用戶"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.schemas.profile_schemas import ProfilePublic
    
    # 查詢用戶並載入 profile 關聯
    result = await session.execute(
        select(User).where(User.id == current_user.id).options(selectinload(User.profile))
    )
    user_with_profile = result.scalar_one()
    
    # 構建回應
    response = UserPublic(
        id=user_with_profile.id,
        email=user_with_profile.email,
        role=user_with_profile.role,
        created_at=user_with_profile.created_at,
        profile=ProfilePublic(
            id=user_with_profile.profile.id,
            user_id=user_with_profile.profile.user_id,
            organization_name=user_with_profile.profile.organization_name,
            contact_person=user_with_profile.profile.contact_person,
            position=user_with_profile.profile.position,
            phone=user_with_profile.profile.phone,
            address=user_with_profile.profile.address,
            tax_id=user_with_profile.profile.tax_id,
            bio=user_with_profile.profile.bio,
            avatar_url=user_with_profile.profile.avatar_url,
            created_at=user_with_profile.profile.created_at,
            updated_at=user_with_profile.profile.updated_at
        ) if user_with_profile.profile else None
    )
    
    return response


# ==================== 演示用戶端點 ====================

@router.post("/demo/auth/login", response_model=Token)
async def demo_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session)
):
    """
    演示用戶登入
    與正式登入使用相同的認證邏輯，但會自動標記為 demo 用戶
    """
    # 驗證用戶（包括演示用戶）
    user = await authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 創建 JWT token，包含 is_demo 標記
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value if hasattr(user.role, 'value') else user.role,
            "is_demo": user.is_demo,
            "display_name": user.display_name
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/demo/users", response_model=List[UserPublic])
async def list_demo_users(session: AsyncSession = Depends(get_session)):
    """列出所有演示用戶（管理員功能）"""
    demo_users = await get_all_users(session, is_demo=True)
    return [
        UserPublic(
            id=user.id,
            email=user.email,
            role=user.role,
            created_at=user.created_at
        ) for user in demo_users
    ]


@router.get("/demo/users/{role}", response_model=List[UserPublic])
async def list_demo_users_by_role(
    role: str,
    session: AsyncSession = Depends(get_session)
):
    """根據角色列出演示用戶"""
    if role not in ["school", "company"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'school' or 'company'"
        )
    
    demo_users = await get_users_by_role(session, role, is_demo=True)
    return [
        UserPublic(
            id=user.id,
            email=user.email,
            role=user.role,
            created_at=user.created_at
        ) for user in demo_users
    ]


@router.post("/demo/users", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def create_demo_user_endpoint(
    email: str,
    password: str,
    role: str,
    display_name: str,
    description: str = None,
    session: AsyncSession = Depends(get_session)
):
    """創建新的演示用戶（管理員功能）"""
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

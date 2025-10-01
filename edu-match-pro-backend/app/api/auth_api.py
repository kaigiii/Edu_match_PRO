"""
認證 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_session
from app.schemas.token_schemas import Token
from app.schemas.user_schemas import UserCreate, UserPublic
from app.crud.user_crud import create_user, get_user_by_email, authenticate_user
from app.core.security import create_access_token

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
    
    # 創建新用戶
    user = await create_user(session, user_in)
    return UserPublic(
        id=user.id,
        email=user.email,
        role=user.role,
        created_at=user.created_at
    )

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

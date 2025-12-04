from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel
from app.core.config import settings
from typing import AsyncGenerator

# 建立非同步引擎
engine = create_async_engine(settings.database_url, echo=True)

# 建立非同步 Session Local
async_session_local = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI 依賴項：產生資料庫 session"""
    async with async_session_local() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_db_and_tables():
    """建立資料庫和資料表"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

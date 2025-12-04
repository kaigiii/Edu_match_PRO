import pytest
import pytest_asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import text
import psycopg2
from httpx import AsyncClient, ASGITransport
import subprocess
import os

from app.core.config import settings
from app.db import get_session
from main import app


@pytest.fixture(scope="session")
def test_db_setup():
    if not settings.test_database_url:
        pytest.skip("TEST_DATABASE_URL not configured")
    # 執行資料庫遷移（一次）
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        env={**os.environ, "DATABASE_URL_SYNC": settings.test_database_url.replace("+asyncpg", "")},
        capture_output=True,
        text=True,
        cwd="."
    )
    if result.returncode != 0:
        pytest.fail(f"Database migration failed: {result.stderr}")
    yield
    # 清理到 base（一次）
    subprocess.run(
        ["alembic", "downgrade", "base"],
        env={**os.environ, "DATABASE_URL_SYNC": settings.test_database_url.replace("+asyncpg", "")},
        capture_output=True,
        text=True,
        cwd="."
    )


@pytest.fixture(scope="session")
def test_session_maker(test_db_setup):
    engine = create_async_engine(settings.test_database_url, echo=False, poolclass=NullPool)
    SessionLocal = async_sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    yield SessionLocal
    # 關閉引擎
    import asyncio
    asyncio.get_event_loop().run_until_complete(engine.dispose())


@pytest.fixture(scope="session", autouse=True)
def override_app_session(test_session_maker):
    async def _override_get_session() -> AsyncGenerator[AsyncSession, None]:
        async with test_session_maker() as session:
            yield session
    app.dependency_overrides[get_session] = _override_get_session
    yield
    app.dependency_overrides.clear()


# 注意：避免在每個測試前後做 TRUNCATE 以免與 async session 交易衝突


@pytest_asyncio.fixture(scope="function")
async def async_client():
    """建立測試 HTTP 客戶端"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
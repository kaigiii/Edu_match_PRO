import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_register_user():
    """測試使用者註冊"""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": email,
        "password": "password123",
        "role": "school"
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        response = await c.post("/auth/register", json=user_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "school"
    assert "password" not in data
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_login_for_access_token():
    """測試使用者登入"""
    # 先註冊一個使用者
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": email,
        "password": "password123",
        "role": "school"
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        await c.post("/auth/register", json=user_data)
    
    # 測試登入
    login_data = {
        "username": email,
        "password": "password123"
    }
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        response = await c.post("/auth/login", data=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_get_current_user():
    """測試獲取當前使用者資訊"""
    # 先註冊並登入
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": email,
        "password": "password123",
        "role": "school"
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        await c.post("/auth/register", json=user_data)
    
    login_data = {
        "username": email,
        "password": "password123"
    }
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        login_response = await c.post("/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    
    # 測試獲取當前使用者
    headers = {"Authorization": f"Bearer {token}"}
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        response = await c.get("/auth/users/me", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "school"
    assert "password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email():
    """測試重複註冊同一個 email"""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": email,
        "password": "password123",
        "role": "school"
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        response1 = await c.post("/auth/register", json=user_data)
    assert response1.status_code == 201
    # 第二次註冊應該失敗
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        response2 = await c.post("/auth/register", json=user_data)
    assert response2.status_code == 400


@pytest.mark.asyncio
async def test_login_invalid_credentials():
    """測試無效憑證登入"""
    # 先註冊一個使用者
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": email,
        "password": "password123",
        "role": "school"
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        await c.post("/auth/register", json=user_data)
    
    # 使用錯誤密碼登入
    login_data = {
        "username": email,
        "password": "wrongpassword"
    }
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        response = await c.post("/auth/login", data=login_data)
    assert response.status_code == 401

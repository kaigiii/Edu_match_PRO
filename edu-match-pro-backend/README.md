# Edu-Match-Pro Backend API

> 教育配對平台後端服務 - 連接學校需求與企業資源的橋樑

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green.svg)](https://fastapi.tiangolo.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0.43-red.svg)](https://sqlalchemy.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 目錄

- [專案概述](#專案概述)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [API 文檔](#api-文檔)
- [資料庫設計](#資料庫設計)
- [認證系統](#認證系統)
- [部署指南](#部署指南)
- [開發指南](#開發指南)
- [測試](#測試)
- [故障排除](#故障排除)
- [貢獻指南](#貢獻指南)

## 🎯 專案概述

Edu-Match-Pro Backend 是一個現代化的教育資源配對平台後端服務，專為連接學校教育需求與企業社會責任資源而設計。平台支援學校發布教育需求、企業瀏覽和贊助需求，以及完整的專案追蹤和統計分析功能。

### 核心功能

- 🏫 **學校需求管理**：學校可發布、編輯、追蹤教育需求
- 🏢 **企業資源配對**：企業可瀏覽、贊助教育需求
- 📊 **智能儀表板**：提供詳細的統計分析和進度追蹤
- 🤖 **AI 推薦系統**：基於需求特徵的智能推薦
- 📈 **影響力追蹤**：完整的專案生命週期管理
- 🔐 **雙重認證系統**：支援真實用戶和演示用戶

### 業務價值

- **提升教育資源配置效率**：自動化配對學校需求與企業資源
- **增強企業社會責任透明度**：提供完整的專案追蹤和影響力報告
- **促進教育公平**：特別關注偏鄉和弱勢學校需求
- **數據驅動決策**：提供詳細的統計分析和趨勢洞察

## 🏗️ 技術架構

### 核心技術棧

```
┌─────────────────────────────────────────────────────────────┐
│                    Edu-Match-Pro Backend                    │
├─────────────────────────────────────────────────────────────┤
│  API Layer (FastAPI)                                        │
│  ├── Authentication & Authorization                        │
│  ├── Request/Response Validation                           │
│  ├── Error Handling & Logging                             │
│  └── CORS & Security Middleware                           │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├── CRUD Operations (BaseCRUD)                           │
│  ├── Business Rules & Validation                          │
│  ├── Data Transformation                                 │
│  └── Activity Logging                                     │
├─────────────────────────────────────────────────────────────┤
│  Data Access Layer (SQLAlchemy)                           │
│  ├── Async Database Operations                            │
│  ├── Relationship Management                              │
│  ├── Query Optimization                                   │
│  └── Transaction Management                               │
├─────────────────────────────────────────────────────────────┤
│  Database Layer (PostgreSQL)                              │
│  ├── User Management (Real + Demo Users)                  │
│  ├── Need & Donation Tracking                            │
│  ├── Activity Logs                                       │
│  └── Analytics & Reporting                               │
└─────────────────────────────────────────────────────────────┘
```

### 技術選型理由

| 技術 | 版本 | 選型理由 |
|------|------|----------|
| **FastAPI** | 0.111.0 | 高性能、自動文檔生成、類型安全 |
| **SQLAlchemy** | 2.0.43 | 成熟的 ORM、異步支持、關係管理 |
| **PostgreSQL** | 15+ | 可靠性高、JSON 支持、複雜查詢 |
| **Pydantic** | 2.11.9 | 數據驗證、序列化、類型安全 |
| **Alembic** | 1.13.1 | 數據庫遷移管理 |
| **JWT** | python-jose | 安全的認證機制 |

## 🚀 快速開始

### 環境要求

- Python 3.11+
- PostgreSQL 15+
- Node.js 18+ (前端開發)
- Git

### 安裝步驟

#### 1. 克隆專案

```bash
git clone https://github.com/your-org/edu-match-pro.git
cd edu-match-pro/edu-match-pro-backend
```

#### 2. 創建虛擬環境

```bash
# 使用 venv
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 或
.venv\Scripts\activate     # Windows

# 或使用 conda
conda create -n edu-match-pro python=3.11
conda activate edu-match-pro
```

#### 3. 安裝依賴

```bash
pip install -r requirements.txt
```

#### 4. 環境配置

創建 `.env` 文件：

```bash
# 資料庫配置
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/edu_match_pro
TEST_DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/edu_match_pro_test

# 安全配置
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS 配置（可選）
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 5. 資料庫設置

```bash
# 創建資料庫
createdb edu_match_pro

# 運行遷移
alembic upgrade head

# 初始化演示數據
python scripts/init_demo_users.py
python scripts/init_test_data.py
```

#### 6. 啟動服務

```bash
# 開發模式
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 或使用 FastAPI CLI
fastapi dev main.py
```

#### 7. 驗證安裝

訪問以下 URL 確認服務正常：

- API 文檔：http://localhost:8000/docs
- 健康檢查：http://localhost:8000/health
- OpenAPI 規範：http://localhost:8000/openapi.json

## 📚 API 文檔

### 基礎配置

- **Base URL**: `http://localhost:8000`
- **Content-Type**: `application/json`
- **認證方式**: Bearer Token (JWT)

### 核心 API 端點

#### 認證相關

```http
POST /auth/register          # 用戶註冊
POST /auth/login             # 用戶登入
GET  /auth/users/me          # 獲取當前用戶信息
POST /demo/auth/login        # 演示用戶登入
GET  /demo/users             # 獲取演示用戶列表
```

#### 學校需求管理

```http
GET    /school_needs                    # 獲取所有學校需求
GET    /school_needs/{id}               # 獲取特定需求詳情
POST   /school_needs                    # 創建新需求
PUT    /school_needs/{id}               # 更新需求
DELETE /school_needs/{id}               # 刪除需求
GET    /my_needs                        # 獲取我的需求
```

#### 企業功能

```http
GET    /company_needs                   # 獲取企業可查看的需求
GET    /company_dashboard_stats         # 企業儀表板統計
GET    /company_donations               # 企業捐贈記錄
POST   /sponsor_need/{id}               # 贊助需求
GET    /company_ai_recommended_needs    # AI 推薦需求
```

#### 統計分析

```http
GET    /school_dashboard_stats           # 學校儀表板統計
GET    /platform_stats                  # 平台整體統計
GET    /recent_activity                 # 最近活動記錄
```

#### 內容管理

```http
GET    /ai_recommended_needs             # AI 推薦需求
GET    /recent_projects                  # 最近專案
GET    /impact_stories                   # 影響力故事
```

### 請求/響應範例

#### 創建需求

```http
POST /school_needs
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "急需平板電腦支援數位教學",
  "description": "偏鄉學校缺乏數位設備，影響學生學習效果",
  "category": "硬體設備",
  "location": "台東縣太麻里鄉",
  "student_count": 120,
  "urgency": "high",
  "sdgs": [4, 10]
}
```

#### 響應格式

```json
{
  "id": "uuid-string",
  "school_id": "uuid-string",
  "title": "急需平板電腦支援數位教學",
  "description": "偏鄉學校缺乏數位設備，影響學生學習效果",
  "category": "硬體設備",
  "location": "台東縣太麻里鄉",
  "student_count": 120,
  "image_url": null,
  "urgency": "high",
  "sdgs": [4, 10],
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 錯誤處理

所有 API 都遵循統一的錯誤響應格式：

```json
{
  "error": "錯誤描述",
  "type": "ErrorType",
  "status_code": 400
}
```

常見 HTTP 狀態碼：

- `200` - 成功
- `201` - 創建成功
- `400` - 請求錯誤
- `401` - 未授權
- `403` - 禁止訪問
- `404` - 資源不存在
- `500` - 服務器錯誤

## 🗄️ 資料庫設計

### 核心實體關係

```mermaid
erDiagram
    User ||--o{ Need : "creates"
    User ||--o{ Donation : "sponsors"
    User ||--|| Profile : "has"
    Need ||--o{ Donation : "receives"
    Donation ||--o| ImpactStory : "generates"
    User ||--o{ ActivityLog : "performs"
    
    User {
        uuid id PK
        string email UK
        string password
        enum role
        datetime created_at
        datetime updated_at
    }
    
    Need {
        uuid id PK
        uuid school_id FK
        string title
        text description
        string category
        string location
        int student_count
        string image_url
        enum urgency
        int[] sdgs
        enum status
        datetime created_at
        datetime updated_at
    }
    
    Donation {
        uuid id PK
        uuid company_id FK
        uuid need_id FK
        string donation_type
        text description
        int progress
        enum status
        datetime completion_date
        datetime created_at
        datetime updated_at
    }
```

### 資料表說明

#### 用戶管理

| 表名 | 說明 | 關鍵字段 |
|------|------|----------|
| `user` | 真實用戶表 | email, password, role |
| `demo_users` | 演示用戶表 | email, display_name, is_demo_only |
| `profile` | 用戶檔案表 | organization_name, contact_person |
| `demo_profiles` | 演示用戶檔案表 | organization_name, bio |

#### 業務核心

| 表名 | 說明 | 關鍵字段 |
|------|------|----------|
| `need` | 需求表 | title, description, student_count, urgency |
| `donation` | 捐贈表 | donation_type, progress, status |
| `impact_story` | 影響力故事表 | title, summary, impact_data |
| `activity_log` | 活動日誌表 | activity_type, description, extra_data |

### 索引策略

```sql
-- 性能優化索引
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_need_school_id ON need(school_id);
CREATE INDEX idx_need_status ON need(status);
CREATE INDEX idx_donation_company_id ON donation(company_id);
CREATE INDEX idx_donation_need_id ON donation(need_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
```

## 🔐 認證系統

### 雙重認證架構

系統支援兩種用戶類型：

#### 1. 真實用戶認證

```python
# 註冊流程
POST /auth/register
{
  "email": "school@example.com",
  "password": "secure_password",
  "role": "school"
}

# 登入流程
POST /auth/login
{
  "username": "school@example.com",
  "password": "secure_password"
}
```

#### 2. 演示用戶認證

```python
# 演示登入
POST /demo/auth/login
{
  "username": "demo_school@example.com",
  "password": "demo_password"
}
```

### JWT Token 結構

```json
{
  "sub": "user_id",
  "role": "school|company",
  "is_demo": false,
  "display_name": "學校名稱",
  "exp": 1640995200,
  "iat": 1640908800
}
```

### 權限控制

```python
# 角色權限矩陣
PERMISSIONS = {
    "school": [
        "create_need", "update_own_need", "delete_own_need",
        "view_own_needs", "view_school_dashboard"
    ],
    "company": [
        "view_all_needs", "sponsor_need", "view_company_dashboard",
        "view_own_donations", "view_ai_recommendations"
    ]
}
```

## 🚀 部署指南

### Docker 部署

#### 1. 創建 Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 安裝 Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用代碼
COPY . .

# 暴露端口
EXPOSE 8000

# 啟動命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. 創建 docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: edu_match_pro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:password@db:5432/edu_match_pro
      SECRET_KEY: your-secret-key
    ports:
      - "8000:8000"
    depends_on:
      - db
    volumes:
      - .:/app

volumes:
  postgres_data:
```

#### 3. 部署命令

```bash
# 構建和啟動
docker-compose up -d

# 運行遷移
docker-compose exec backend alembic upgrade head

# 初始化數據
docker-compose exec backend python scripts/init_demo_users.py
```

### 生產環境部署

#### 1. 使用 Gunicorn

```bash
# 安裝 Gunicorn
pip install gunicorn

# 啟動服務
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### 2. 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. 環境變量配置

```bash
# 生產環境變量
export DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/db"
export SECRET_KEY="your-production-secret-key"
export CORS_ORIGINS="https://your-frontend-domain.com"
export LOG_LEVEL="INFO"
```

## 🛠️ 開發指南

### 專案結構

```
edu-match-pro-backend/
├── app/                          # 應用核心
│   ├── api/                      # API 路由
│   │   ├── main_api.py          # 主 API 路由
│   │   ├── auth_api.py           # 認證 API
│   │   ├── demo_auth_api.py     # 演示認證 API
│   │   └── dependencies.py      # 依賴注入
│   ├── core/                     # 核心配置
│   │   ├── config.py            # 應用配置
│   │   ├── security.py            # 安全相關
│   │   └── exceptions.py         # 異常處理
│   ├── crud/                     # 數據訪問層
│   │   ├── base_crud.py         # 基礎 CRUD
│   │   ├── user_crud.py         # 用戶 CRUD
│   │   ├── demo_user_crud.py    # 演示用戶 CRUD
│   │   ├── need_crud.py         # 需求 CRUD
│   │   ├── donation_crud.py     # 捐贈 CRUD
│   │   ├── dashboard_crud.py    # 儀表板 CRUD
│   │   └── activity_log_crud.py # 活動日誌 CRUD
│   ├── models/                   # 數據模型
│   │   ├── base.py              # 基礎模型
│   │   ├── user.py              # 用戶模型
│   │   ├── demo_user.py         # 演示用戶模型
│   │   ├── need.py              # 需求模型
│   │   ├── donation.py          # 捐贈模型
│   │   ├── profile.py           # 檔案模型
│   │   ├── activity_log.py      # 活動日誌模型
│   │   └── impact_story.py      # 影響力故事模型
│   ├── schemas/                  # 數據驗證
│   │   ├── user_schemas.py      # 用戶 Schema
│   │   ├── need_schemas.py      # 需求 Schema
│   │   ├── donation_schemas.py  # 捐贈 Schema
│   │   ├── dashboard_schemas.py  # 儀表板 Schema
│   │   ├── activity_log_schemas.py # 活動日誌 Schema
│   │   ├── story_schemas.py     # 故事 Schema
│   │   ├── token_schemas.py     # Token Schema
│   │   ├── common_schemas.py    # 通用 Schema
│   │   └── profile_schemas.py   # 檔案 Schema
│   ├── utils/                    # 工具函數
│   │   └── response_helpers.py   # 響應助手
│   ├── data/                     # 數據相關
│   │   └── mock_data.py         # 模擬數據
│   └── db.py                     # 數據庫連接
├── alembic/                      # 數據庫遷移
│   ├── versions/                # 遷移版本
│   ├── env.py                   # 遷移環境
│   └── script.py.mako           # 遷移模板
├── scripts/                      # 腳本工具
│   ├── init_demo_users.py       # 初始化演示用戶
│   ├── init_test_data.py        # 初始化測試數據
│   ├── create_demo_data.py      # 創建演示數據
│   ├── clear_data.py            # 清理數據
│   └── ingest_school_tables.py  # 導入學校數據
├── tests/                        # 測試
│   ├── api/                     # API 測試
│   │   └── test_auth.py         # 認證測試
│   └── conftest.py              # 測試配置
├── main.py                       # 應用入口
├── requirements.txt              # 依賴列表
├── alembic.ini                   # Alembic 配置
├── pyrightconfig.json           # 類型檢查配置
└── README.md                     # 專案文檔
```

### 開發工作流

#### 1. 設置開發環境

```bash
# 克隆專案
git clone <repository-url>
cd edu-match-pro-backend

# 創建虛擬環境
python -m venv .venv
source .venv/bin/activate

# 安裝依賴
pip install -r requirements.txt

# 安裝開發依賴
pip install -r requirements-dev.txt
```

#### 2. 數據庫遷移

```bash
# 創建新遷移
alembic revision --autogenerate -m "描述變更"

# 應用遷移
alembic upgrade head

# 回滾遷移
alembic downgrade -1
```

#### 3. 代碼質量檢查

```bash
# 類型檢查
pyright

# 代碼格式化
black .

# 導入排序
isort .

# 代碼檢查
flake8 .

# 安全檢查
bandit -r .
```

### 添加新功能

#### 1. 創建數據模型

```python
# app/models/new_model.py
from sqlmodel import SQLModel, Field
from app.models.base import BaseModel

class NewModel(BaseModel, table=True):
    __tablename__ = "new_model"
    
    name: str = Field(max_length=255)
    description: Optional[str] = None
```

#### 2. 創建 CRUD 操作

```python
# app/crud/new_model_crud.py
from app.crud.base_crud import BaseCRUD
from app.models.new_model import NewModel

new_model_crud = BaseCRUD(NewModel)

async def create_new_model(session: AsyncSession, data: dict):
    return await new_model_crud.create(session, data)
```

#### 3. 創建 API 端點

```python
# app/api/main_api.py
@router.post("/new_models", response_model=NewModelPublic)
async def create_new_model(
    data: NewModelCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await create_new_model(session, data.dict())
```

## 🧪 測試

### 測試策略

- **單元測試**：測試個別函數和類
- **集成測試**：測試 API 端點
- **端到端測試**：測試完整用戶流程

### 運行測試

```bash
# 運行所有測試
pytest

# 運行特定測試
pytest tests/api/test_auth.py

# 運行測試並生成覆蓋率報告
pytest --cov=app --cov-report=html

# 運行測試並顯示詳細輸出
pytest -v
```

### 測試範例

```python
# tests/api/test_auth.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword",
        "role": "school"
    })
    assert response.status_code == 201
    assert "id" in response.json()

def test_login_user():
    response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

## 🔧 故障排除

### 常見問題

#### 1. 資料庫連接問題

```bash
# 檢查資料庫狀態
pg_isready -h localhost -p 5432

# 檢查連接字符串
echo $DATABASE_URL

# 測試連接
python -c "
import asyncio
from app.db import engine
async def test():
    async with engine.begin() as conn:
        print('Database connection successful')
asyncio.run(test())
"
```

#### 2. 認證問題

```bash
# 檢查 JWT 配置
python -c "
from app.core.config import settings
print(f'Secret key: {settings.secret_key[:10]}...')
print(f'Algorithm: {settings.algorithm}')
"

# 測試 token 生成
python -c "
from app.core.security import create_access_token
token = create_access_token({'sub': 'test'})
print(f'Token: {token[:50]}...')
"
```

#### 3. CORS 問題

```bash
# 檢查 CORS 配置
python -c "
from app.core.config import settings
print(f'CORS origins: {settings.cors_origins}')
"
```

### 日誌配置

```python
# 在 main.py 中添加日誌配置
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
```

### 性能監控

```python
# 添加性能監控
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## 🤝 貢獻指南

### 貢獻流程

1. **Fork 專案**
2. **創建功能分支**：`git checkout -b feature/amazing-feature`
3. **提交變更**：`git commit -m 'Add amazing feature'`
4. **推送分支**：`git push origin feature/amazing-feature`
5. **創建 Pull Request**

### 代碼規範

- 使用 **Black** 進行代碼格式化
- 使用 **isort** 進行導入排序
- 使用 **flake8** 進行代碼檢查
- 使用 **mypy** 進行類型檢查
- 遵循 **PEP 8** 代碼風格

### 提交訊息規範

```
<type>(<scope>): <subject>

<body>

<footer>
```

類型：
- `feat`: 新功能
- `fix`: 修復問題
- `docs`: 文檔更新
- `style`: 代碼格式
- `refactor`: 重構
- `test`: 測試相關
- `chore`: 構建過程或輔助工具的變動

### 開發環境設置

```bash
# 安裝開發依賴
pip install -r requirements-dev.txt

# 設置 pre-commit hooks
pre-commit install

# 運行所有檢查
pre-commit run --all-files
```

## 📄 許可證

本專案採用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 📞 支援

- **文檔**：查看 [API 文檔](http://localhost:8000/docs)
- **問題回報**：[GitHub Issues](https://github.com/your-org/edu-match-pro/issues)
- **討論**：[GitHub Discussions](https://github.com/your-org/edu-match-pro/discussions)
- **郵件**：support@edu-match-pro.com

## 🙏 致謝

感謝所有為這個專案做出貢獻的開發者和教育工作者。

---

**Edu-Match-Pro Backend** - 讓教育資源配對更簡單、更高效！

> 最後更新：2024年1月

# Edu-Match-Pro Backend

## 專案描述

Edu-Match-Pro 是一個教育資源媒合平台，連接偏鄉學校的教育需求與企業的 ESG 捐贈。本專案為後端 API 服務，使用 FastAPI、PostgreSQL、SQLModel 等現代技術建構。

## 核心功能

- **使用者認證系統**：支援學校和企業註冊、登入與 JWT 認證
- **需求管理**：學校可發布教育資源需求
- **捐贈管理**：企業可認捐學校需求
- **儀表板數據**：提供統計數據和活動日誌
- **影響力故事**：記錄專案成果和影響

## 技術棧

- **FastAPI** - 現代化 Python Web 框架
- **PostgreSQL** - 關聯式資料庫
- **SQLModel** - 結合 SQLAlchemy 和 Pydantic
- **Alembic** - 資料庫遷移工具
- **JWT** - 身份驗證
- **Pydantic-Settings** - 設定管理

## 安裝與設定

### 1. 建立虛擬環境

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 或
.venv\Scripts\activate  # Windows
```

### 2. 安裝依賴

```bash
pip install -r requirements.txt
```

### 3. 設定環境變數

複製 `.env.example` 到 `.env` 並修改設定：

```env
DATABASE_URL="postgresql+asyncpg://edu_user:edu_password@localhost:5432/edu_match_pro_db"
DATABASE_URL_SYNC="postgresql://edu_user:edu_password@localhost:5432/edu_match_pro_db"
SECRET_KEY="your-secret-key-here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. 設定 PostgreSQL 資料庫

```sql
-- 建立資料庫
CREATE DATABASE edu_match_pro_db;

-- 建立使用者
CREATE USER edu_user WITH PASSWORD 'edu_password';
GRANT ALL PRIVILEGES ON DATABASE edu_match_pro_db TO edu_user;
```

### 5. 執行資料庫遷移

```bash
alembic upgrade head
```

## 執行專案

### 開發模式

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 生產模式

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API 文件

啟動服務後，可透過以下網址查看 API 文件：

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## API 端點

### 認證 (Authentication)
- `POST /auth/register` - 使用者註冊
- `POST /auth/login` - 使用者登入
- `GET /auth/users/me` - 取得當前使用者資訊

### 需求管理 (Needs)
- `POST /school_needs` - 建立新需求（學校）
- `GET /my_needs` - 取得我的需求（學校）
- `GET /school_needs` - 取得所有公開需求
- `GET /school_needs/{need_id}` - 取得單一需求
- `PUT /school_needs/{need_id}` - 更新需求
- `DELETE /school_needs/{need_id}` - 刪除需求

### 捐贈管理 (Donations)
- `GET /company_donations` - 取得我的捐贈（企業）

### 儀表板 (Dashboard)
- `GET /school_dashboard_stats` - 學校儀表板數據
- `GET /company_dashboard_stats` - 企業儀表板數據

### 影響力故事 (Stories)
- `GET /impact_stories` - 取得所有影響力故事

### 活動日誌 (Activity)
- `GET /recent_activity` - 取得最近活動記錄

## 專案結構

```
edu-match-pro-backend/
├── app/
│   ├── api/
│   │   ├── main_api.py        # 主 API 端點
│   │   ├── auth_api.py        # 認證 API
│   │   └── dependencies.py    # API 依賴
│   ├── core/                  # 核心設定
│   ├── crud/                  # 資料庫操作
│   ├── models/                # 資料庫模型
│   └── schemas/               # API Schema
├── alembic/                   # 資料庫遷移
├── .env                       # 環境變數
├── alembic.ini               # Alembic 設定
├── main.py                   # 應用程式入口
└── requirements.txt          # 依賴清單
```

## 開發指南

### 新增 API 端點

1. 在 `app/schemas/` 中定義 Schema
2. 在 `app/crud/` 中實作 CRUD 操作
3. 在 `app/api/` 中建立端點
4. 在 `main.py` 中註冊路由

### 資料庫遷移

```bash
# 產生遷移檔案
alembic revision --autogenerate -m "描述變更"

# 執行遷移
alembic upgrade head

# 回滾遷移
alembic downgrade -1
```

## 測試

使用 Swagger UI 或 curl 測試 API：

```bash
# 測試基本連線
curl http://127.0.0.1:8000

# 測試認證
curl -X POST "http://127.0.0.1:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "role": "school"}'
```

## 授權

本專案採用 MIT 授權條款。

## 貢獻

歡迎提交 Issue 和 Pull Request 來改善專案。

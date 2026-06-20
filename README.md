# Edu Match PRO - 技術文檔

## 技術棧

### 後端
- **框架**: FastAPI (Python 3.11+)
- **資料庫**: PostgreSQL (使用 SQLAlchemy ORM)
- **認證**: JWT (python-jose)
- **AI 服務**: Google Gemini API
- **遷移工具**: Alembic

### 前端
- **框架**: React 18 + TypeScript
- **構建工具**: Vite
- **樣式**: Tailwind CSS
- **路由**: React Router DOM v6
- **動畫**: Framer Motion
- **圖表**: Recharts, D3.js

---

## 目錄結構

```
Edu_match_pro/
├── edu-match-pro-backend/     # 後端 API
│   ├── app/
│   │   ├── api/              # API 路由
│   │   ├── core/             # 核心配置（config, security, AI）
│   │   ├── crud/             # 資料庫操作
│   │   ├── models/           # SQLAlchemy 模型
│   │   └── schemas/          # Pydantic schemas
│   ├── scripts/              # 工具腳本
│   ├── alembic/              # 資料庫遷移
│   └── tests/                # 測試
│
├── edu-match-pro-frontend/    # 前端應用
│   ├── src/
│   │   ├── pages/            # 頁面組件
│   │   ├── components/       # 共用組件
│   │   ├── services/         # API 服務
│   │   ├── contexts/         # React Context
│   │   └── config/           # 配置
│   └── public/               # 靜態資源
│
├── start_local.sh            # 本地開發啟動腳本
└── start_ngrok.sh            # Ngrok 隧道啟動腳本（僅後端）
```

---

## 環境配置

### 後端環境變數 (`.env`)

```bash
# 資料庫
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini API（支援多組 key 輪換）
GEMINI_API_KEY=your-primary-key
GEMINI_API_KEY_2=your-secondary-key
GEMINI_API_KEY_3=your-tertiary-key

# Demo 用戶密碼
DEMO_SCHOOL_PASSWORD=demo_school_2024
DEMO_COMPANY_PASSWORD=demo_company_2024
DEMO_RURAL_SCHOOL_PASSWORD=demo_rural_2024

# CORS
CORS_ORIGINS=http://localhost:13101,https://kaigiii.github.io
```

### 前端環境變數（可選）

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:13102

# .env.production
VITE_API_BASE_URL=https://your-ngrok-url.ngrok-free.dev
```

---

## 快速啟動

### 1. 一鍵啟動本地開發環境

```bash
# 同時啟動前端和後端
./start_local.sh
```

啟動後：
- **後端 API**: http://localhost:13102
- **API 文檔**: http://localhost:13102/docs
- **前端應用**: http://localhost:13101

### 2. 啟動 Ngrok 隧道（公網訪問）

```bash
# 前提：必須先運行 ./start_local.sh
./start_ngrok.sh
```

功能：
- 為後端創建 ngrok 公網隧道
- 前端部署在 GitHub Pages，不需要 ngrok

---

## 手動啟動

### 後端

```bash
cd edu-match-pro-backend

# 創建虛擬環境
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# 安裝依賴
pip install -r requirements.txt

# 執行資料庫遷移
alembic upgrade head

# 啟動服務
uvicorn main:app --host 0.0.0.0 --port 13102 --reload
```

### 前端

```bash
cd edu-match-pro-frontend

# 安裝依賴
npm install

# 開發模式
npm run dev

# 生產構建
npm run build
```

---

## API 端點

### 基礎

- `GET /health` - 健康檢查

### 認證 (`/api/auth`)

- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 獲取當前用戶資訊

### 主要 API (`/api`)

**學校資料**
- `GET /api/schools` - 學校列表
- `GET /api/schools/{school_code}` - 學校詳情

**需求管理**
- `GET /api/needs` - 需求列表
- `POST /api/needs` - 創建需求 🔒
- `GET /api/needs/{need_id}` - 需求詳情
- `PUT /api/needs/{need_id}` - 更新需求 🔒
- `DELETE /api/needs/{need_id}` - 刪除需求 🔒

**捐贈管理**
- `POST /api/needs/{need_id}/sponsor` - 贊助需求 🔒
- `GET /api/donations` - 捐贈記錄 🔒

**儀表板**
- `GET /api/dashboard/stats` - 統計數據 🔒

**AI 功能**
- `POST /api/ai/extract-donation-params` - 提取捐贈參數
- `POST /api/ai/generate-analysis` - 生成策略分析

🔒 = 需要 JWT 認證

完整 API 文檔：http://localhost:13102/docs

---

## 資料庫管理

### 創建遷移

```bash
cd edu-match-pro-backend
alembic revision --autogenerate -m "描述"
```

### 執行遷移

```bash
alembic upgrade head
```

### 回滾遷移

```bash
alembic downgrade -1
```

### 重建 Demo 資料

```bash
cd edu-match-pro-backend
source .venv/bin/activate
python scripts/rebuild_demo_data.py              # 創建豐富資料（推薦）
python scripts/rebuild_demo_data.py --assign     # 快速分配現有資料
python scripts/rebuild_demo_data.py --init-only  # 僅初始化 demo_users 表
```

---

## 部署

### 前端（GitHub Pages）

```bash
cd edu-match-pro-frontend
npm run build
# GitHub Actions 自動部署到 https://kaigiii.github.io/Edu_match_PRO/
```

### 後端（Ngrok）

```bash
# 本地運行後端
./start_local.sh

# 在另一終端啟動 ngrok
./start_ngrok.sh

# 複製 ngrok URL，手動更新以下文件：
# 1. edu-match-pro-frontend/src/config/api.ts (第 21 行)
# 2. edu-match-pro-backend/app/core/config.py (第 26 行)
```

---

## Demo 測試帳號

| 角色 | 帳號 | 密碼 |
|------|------|------|
| 學校（都市） | demo.school@edu.tw | demo_school_2024 |
| 學校（偏鄉） | demo.rural.school@edu.tw | demo_rural_2024 |
| 企業 | demo.company@tech.com | demo_company_2024 |

---

## 開發工具

### 後端測試

```bash
cd edu-match-pro-backend
pytest                    # 運行所有測試
pytest tests/api/        # 測試 API
pytest -v                # 詳細輸出
```

### 前端開發

```bash
cd edu-match-pro-frontend
npm run dev              # 開發伺服器
npm run build            # 生產構建
npm run preview          # 預覽構建結果
npm run lint             # ESLint 檢查
```

---

## 常見問題

### 後端 CORS 錯誤
檢查 `edu-match-pro-backend/app/core/config.py` 的 `CORS_ORIGINS` 設定

### 前端無法連接後端
1. 確認後端已啟動：http://localhost:13102/health
2. 檢查前端 API 配置：`src/config/api.ts`

### 資料庫連接失敗
1. 確認 PostgreSQL 已啟動
2. 檢查 `.env` 的 `DATABASE_URL` 設定
3. 確認資料庫已創建

### Ngrok URL 過期
Ngrok 免費版 URL 會定期過期，需手動更新兩個文件（見「部署 > 後端」章節）

---

## 技術支援

- **前端配置**: `edu-match-pro-frontend/src/config/api.ts`
- **後端配置**: `edu-match-pro-backend/app/core/config.py`
- **API 文檔**: http://localhost:13102/docs （本地）


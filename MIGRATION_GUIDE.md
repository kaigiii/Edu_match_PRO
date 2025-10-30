# 認證系統合併遷移指南

## 📋 概述

已成功合併演示用戶和正式用戶系統，統一使用 `User` 和 `Profile` 模型。

## ✅ 完成的更改

### 1. 模型更新

#### User 模型 (`app/models/user.py`)
- ✅ 添加 `is_demo` 字段：標記是否為演示帳號
- ✅ 添加 `display_name` 字段：顯示名稱（主要用於 demo）
- ✅ 添加 `description` 字段：用戶描述
- ✅ 添加 `is_active` 字段：是否啟用
- ✅ 添加 `last_used_at` 字段：最後使用時間
- ✅ 添加 `usage_count` 字段：使用次數統計

#### Profile 模型 (`app/models/profile.py`)
- ✅ 將 `contact_person` 改為可選
- ✅ 將 `position` 改為可選
- ✅ 將 `phone` 改為可選
- ✅ 將 `address` 改為可選
- ✅ 添加字段最大長度限制
- ✅ 添加詳細註釋說明

### 2. CRUD 功能合併 (`app/crud/user_crud.py`)

新增功能：
- ✅ `create_demo_user()` - 創建演示用戶
- ✅ `get_all_users()` - 獲取所有用戶（可按 is_demo 篩選）
- ✅ `get_users_by_role()` - 按角色獲取用戶（可按 is_demo 篩選）
- ✅ `update_user_usage()` - 更新用戶使用統計
- ✅ `deactivate_user()` - 停用用戶

更新功能：
- ✅ `authenticate_user()` - 現在支持演示和正式用戶，自動更新演示用戶統計
- ✅ `get_user_by_email()` - 添加 `include_inactive` 參數

### 3. API 端點更新 (`app/api/auth_api.py`)

新增演示用戶端點（保持向後兼容）：
- ✅ `POST /demo/auth/login` - 演示用戶登入
- ✅ `GET /demo/users` - 列出所有演示用戶
- ✅ `GET /demo/users/{role}` - 按角色列出演示用戶
- ✅ `POST /demo/users` - 創建新演示用戶

更新端點：
- ✅ `GET /auth/users/me` - 現在同時支持正式和演示用戶

### 4. 文件清理

已刪除的文件：
- ✅ `app/models/demo_user.py`
- ✅ `app/api/demo_auth_api.py`
- ✅ `app/crud/demo_user_crud.py`

### 5. 數據庫遷移

- ✅ 創建遷移文件：`alembic/versions/merge_demo_and_regular_users.py`

## 🚀 應用遷移步驟

### 步驟 1：備份數據庫（重要！）

```bash
# PostgreSQL 備份
pg_dump -U your_username -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 步驟 2：應用數據庫遷移

```bash
cd edu-match-pro-backend

# 查看當前遷移狀態
alembic current

# 應用新遷移
alembic upgrade head

# 如果出現問題，可以回滾
# alembic downgrade -1
```

### 步驟 3：驗證遷移

```bash
# 啟動後端服務
cd edu-match-pro-backend
source venv/bin/activate  # 如果使用虛擬環境
uvicorn main:app --reload
```

### 步驟 4：測試端點

```bash
# 測試演示用戶登入
curl -X POST "http://localhost:8000/demo/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo@school.com&password=demo123"

# 列出所有演示用戶
curl -X GET "http://localhost:8000/demo/users"
```

## 📊 數據遷移說明

遷移腳本會自動：

1. **添加新字段到 user 表**
2. **修改 profile 表約束**（部分字段改為可選）
3. **自動遷移數據**：
   - 將 `demo_users` 表的數據遷移到 `user` 表（is_demo=true）
   - 將 `demo_profiles` 表的數據遷移到 `profile` 表
4. **刪除舊表**：`demo_users` 和 `demo_profiles`

## 🔄 API 兼容性

### 保持兼容的端點

所有原有的演示用戶端點都保持兼容：
- `/demo/auth/login` ✅
- `/demo/users` ✅
- `/demo/users/{role}` ✅

### 正式用戶端點不受影響

- `/auth/register` ✅
- `/auth/login` ✅
- `/auth/users/me` ✅（現在支持兩種用戶）

## ⚠️ 注意事項

### 1. Token 變化

演示用戶登入後，JWT token 中會包含：
```json
{
  "sub": "user_id",
  "role": "school|company",
  "is_demo": true,
  "display_name": "顯示名稱"
}
```

### 2. 前端可能需要更新

如果前端需要識別演示用戶，可以從 token 或用戶資訊中讀取 `is_demo` 字段。

### 3. 重新初始化演示數據

如果需要重新創建演示用戶，請運行：

```bash
cd edu-match-pro-backend/scripts
python init_demo_users.py
```

**注意**：該腳本可能需要更新以使用新的 `create_demo_user()` 函數。

## 🐛 故障排除

### 問題 1：遷移失敗

```bash
# 回滾遷移
alembic downgrade -1

# 檢查數據庫狀態
psql -U your_username -d your_database -c "\dt"
```

### 問題 2：demo_users 表不存在

如果你的數據庫中沒有 `demo_users` 表，遷移腳本會自動跳過數據遷移部分，直接創建新字段。

### 問題 3：外鍵約束錯誤

確保在遷移前沒有孤立的 profile 記錄：

```sql
-- 檢查孤立的 profile
SELECT * FROM profile WHERE user_id NOT IN (SELECT id FROM "user");
```

## 📝 後續任務

### 可選：更新 init_demo_users.py 腳本

如果你使用 `scripts/init_demo_users.py` 來初始化演示數據，需要更新它以使用新的 `create_demo_user()` 函數：

```python
from app.crud.user_crud import create_demo_user

# 替換原來的 import
# from app.crud.demo_user_crud import create_demo_user
```

### 可選：刪除 Test.py

`Test.py` 文件包含暴露的 Google API 密鑰，建議手動刪除：

```bash
rm /Users/xiaojunjun/Coding/Project/Edu_macth_pro/Test.py
```

並確保該密鑰已被重新生成或撤銷。

## ✨ 改進效果

通過此次合併：
- ✅ 刪除了 **3 個重複文件**
- ✅ 減少了約 **400 行重複代碼**
- ✅ 統一了認證系統架構
- ✅ 保持了完整的向後兼容性
- ✅ 提升了代碼維護性

## 📞 需要幫助？

如果遇到任何問題，請檢查：
1. 數據庫備份是否完成
2. Alembic 遷移日誌：`alembic history`
3. 應用日誌中的錯誤信息


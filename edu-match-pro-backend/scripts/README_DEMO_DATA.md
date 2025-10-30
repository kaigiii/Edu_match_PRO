# Demo 用戶和測試資料管理腳本

## 快速開始 ⚡

**一鍵重建所有 demo 資料：**

```bash
cd edu-match-pro-backend
source .venv/bin/activate
python scripts/rebuild_demo_data.py
```

這個命令會：
- 🗑️  清理現有 demo 資料
- 👥 重建 demo 用戶
- 📝 同步 profiles
- 📊 分配測試資料（needs 和 donations）
- ✅ 驗證所有設置

## 概述

這些腳本用於管理 demo 用戶並為他們分配測試資料，確保前端儀表板能正常顯示。

## 問題背景

原本系統有兩個獨立的用戶表：
- `demo_users`: Demo 演示用戶
- `user`: 真實用戶

但資料表（`need`, `donation`）的外鍵都指向 `user` 表，導致 demo 用戶登入後儀表板沒有資料。

## 解決方案

1. 將 `demo_users` 同步到 `user` 表
2. 將 `demo_profiles` 同步到 `profile` 表
3. 為 demo 用戶分配測試資料（needs 和 donations）

## 腳本說明

### 主要腳本

#### 1. `rebuild_demo_data.py` ⭐ **推薦使用**

**功能**：一鍵重建所有 demo 資料
- 🗑️  清理現有 demo 用戶及其資料
- 👥 從 demo_users 重建用戶到 user 表
- 📝 從 demo_profiles 同步 profiles
- 📊 分配測試資料（needs 和 donations）
- 🎯 設定不同狀態（completed, in_progress, pending）
- ✅ 完整驗證並顯示統計

**使用時機**：
- ✅ 初次設置 demo 環境
- ✅ 重置所有 demo 資料
- ✅ demo 資料出現問題時
- ✅ 資料庫更新後重新初始化

**執行**：
```bash
cd edu-match-pro-backend
source .venv/bin/activate
python scripts/rebuild_demo_data.py
```

**預期結果**：
```
學校用戶:
  • demo.school@edu.tw: 10 個 needs (包含不同狀態)
  • demo.rural.school@edu.tw: 10 個 needs

企業用戶:
  • demo.company@tech.com: 15 個 donations
    - 10 個 completed (已完成)
    - 2-3 個 in_progress (進行中)
    - 2-3 個 pending (待處理)

所有用戶都有完整的 profile 資料
```

---

### 其他工具腳本

#### 2. `init_demo_users.py`

**功能**：首次初始化 demo_users 和 demo_profiles 表
- 創建 demo 用戶帳號到 demo_users 表
- 創建對應的 demo profiles
- 僅用於資料庫首次設置

**使用時機**：
- 全新資料庫，demo_users 表為空
- 需要重新創建 demo_users 表資料

**執行**：
```bash
cd edu-match-pro-backend
source .venv/bin/activate
python scripts/init_demo_users.py
```

⚠️ **注意**：執行後還需要運行 `rebuild_demo_data.py` 來同步資料

#### 3. `ingest_school_tables.py`

**功能**：導入學校相關 CSV 資料
- 導入偏鄉學校資料（faraway3.csv）
- 導入教育統計資料（edu_B_1_4.csv）
- 導入學校電腦設備資料（全國國民中小學可上網電腦設備數量.csv）

**使用時機**：
- 需要更新學校資料
- 添加新的學校資料來源

**執行**：
```bash
cd edu-match-pro-backend
source .venv/bin/activate
python scripts/ingest_school_tables.py
```

## Demo 用戶帳號

### 學校用戶

1. **台北市立建國中學**
   - Email: `demo.school@edu.tw`
   - Password: `demo_school_2024`
   - 測試資料: 10 個 needs

2. **台東縣太麻里國小（偏鄉）**
   - Email: `demo.rural.school@edu.tw`
   - Password: `demo_rural_2024`
   - 測試資料: 10 個 needs

### 企業用戶

1. **科技創新股份有限公司**
   - Email: `demo.company@tech.com`
   - Password: `demo_company_2024`
   - 測試資料: 15 個 donations (5 completed, 3 in_progress, 7 pending)

## 資料庫架構注意事項

### 表關係

```
user (單數，不是 users)
├─ profile (一對一，外鍵: profile.user_id -> user.id)
├─ need (一對多，外鍵: need.school_id -> user.id)
└─ donation (一對多，外鍵: donation.company_id -> user.id)

demo_users (獨立表，僅用於認證)
└─ demo_profiles (一對一，外鍵: demo_profiles.user_id -> demo_users.id)
```

### 欄位差異

**profile vs demo_profiles**:
- `profile` 有 `tax_id` 欄位
- `demo_profiles` 沒有 `tax_id` 欄位
- 同步時 `tax_id` 設為 NULL

### 外鍵約束

刪除用戶時需要注意順序：
1. 先刪除或重新分配 needs
2. 再刪除或重新分配 donations
3. 然後刪除 profile
4. 最後刪除 user

## 常見問題排查

### 💡 通用解決方案

**遇到任何 demo 資料問題，直接執行：**

```bash
cd edu-match-pro-backend
source .venv/bin/activate
python scripts/rebuild_demo_data.py
```

這個命令會重建所有 demo 資料，解決 99% 的問題。

---

### 具體問題排查

#### 1. 儀表板沒有資料

**症狀**：
- 學校/企業儀表板顯示全是 0
- 我的需求列表是空的
- 捐贈列表是空的

**檢查**：
```sql
-- 檢查 demo 用戶是否在 user 表中
SELECT * FROM "user" WHERE email LIKE '%demo%';

-- 檢查是否有分配的 needs
SELECT COUNT(*) FROM need WHERE school_id IN (
    SELECT id FROM "user" WHERE email LIKE '%demo%'
);

-- 檢查是否有分配的 donations
SELECT COUNT(*) FROM donation WHERE company_id IN (
    SELECT id FROM "user" WHERE email LIKE '%demo%'
);
```

**快速解決**：
```bash
python scripts/rebuild_demo_data.py
```

---

#### 2. Profile 顯示為空或錯誤

**症狀**：
- 個人資料頁面沒有組織名稱
- 聯絡人資訊是空的
- Header 顯示 "未設定"

**檢查**：
```sql
-- 檢查 profile 是否存在
SELECT u.email, p.organization_name
FROM "user" u
LEFT JOIN profile p ON u.id = p.user_id
WHERE u.email LIKE '%demo%';
```

**快速解決**：
```bash
python scripts/rebuild_demo_data.py
```

---

#### 3. 企業儀表板統計都是 0

**症狀**：
- 完成專案數 = 0
- 幫助學生數 = 0
- 成功率 = 0

**原因**：沒有 `completed` 狀態的 donations

**檢查**：
```sql
-- 檢查 donations 狀態分布
SELECT status, COUNT(*) 
FROM donation 
WHERE company_id IN (
    SELECT id FROM "user" WHERE email = 'demo.company@tech.com'
)
GROUP BY status;
```

**快速解決**：
```bash
python scripts/rebuild_demo_data.py
```

---

#### 4. 無法登入或認證失敗

**症狀**：
- 登入時顯示密碼錯誤
- Token 無效
- 500 Internal Server Error

**檢查**：
```sql
-- 檢查 demo_users 表是否存在
SELECT email, is_active FROM demo_users;
```

**快速解決**：
1. 確認 demo_users 表有資料
2. 執行重建腳本：
```bash
python scripts/rebuild_demo_data.py
```

---

#### 5. CORS 錯誤

**症狀**：
```
Access to fetch at 'http://localhost:3001/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**解決**：
1. 檢查後端是否在運行：`curl http://localhost:3001/health`
2. 重啟後端服務
3. 不是 demo 資料問題，參考主 README

## 開發建議

1. **不要手動刪除資料**：考慮外鍵約束
2. **使用腳本**：確保資料一致性
3. **測試前備份**：避免資料丟失
4. **PostgreSQL Only**：所有腳本都是為 PostgreSQL 設計的

## 更新記錄

- 2025-10-30: 初版，修復 CORS、profile 和儀表板資料問題


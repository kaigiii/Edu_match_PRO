# Scripts 目錄說明

## 📁 目錄結構

```
scripts/
├── README_DEMO_DATA.md           # 📚 詳細文檔
├── rebuild_demo_data.py          # ⭐ 主要腳本：一鍵重建 demo 資料
├── init_demo_users.py            # 🔧 工具：首次初始化 demo_users 表
├── ingest_school_tables.py       # 📊 工具：導入學校 CSV 資料
└── data/                         # 📁 資料目錄
    ├── faraway3.csv              #    偏鄉學校資料
    ├── edu_B_1_4.csv             #    教育統計資料
    └── 全國國民中小學可上網電腦設備數量.csv  # 學校電腦設備資料
```

## 🚀 快速使用

### 日常使用（99% 的情況）

```bash
# 重建所有 demo 資料（推薦）
python scripts/rebuild_demo_data.py
```

這個命令會：
- ✅ 清理舊資料
- ✅ 重建用戶
- ✅ 同步 profiles
- ✅ 分配測試資料
- ✅ 驗證結果

### 特殊情況

#### 首次設置資料庫

```bash
# 1. 初始化 demo_users 表（只需執行一次）
python scripts/init_demo_users.py

# 2. 重建 demo 資料
python scripts/rebuild_demo_data.py
```

#### 更新學校資料

```bash
# 導入或更新學校 CSV 資料
python scripts/ingest_school_tables.py
```

## 📋 腳本詳細說明

### 1. rebuild_demo_data.py ⭐

**用途**：一鍵重建所有 demo 資料

**功能**：
- 清理現有 demo 用戶及其關聯資料
- 從 demo_users 重建到 user 表
- 從 demo_profiles 同步到 profile 表
- 分配測試資料（needs 和 donations）
- 設定不同狀態（completed, in_progress, pending）
- 完整驗證並顯示統計

**執行時間**：約 5-10 秒

**輸出範例**：
```
✅ 插入了 3 個 demo 用戶到 user 表
✅ 同步了 3 個 profiles
✅ 台東縣太麻里國小（演示）: 分配了 10 個 needs
✅ 科技創新股份有限公司（演示）: 分配了 15 個 donations
```

---

### 2. init_demo_users.py 🔧

**用途**：首次初始化 demo_users 和 demo_profiles 表

**什麼時候用**：
- ✅ 全新資料庫
- ✅ demo_users 表為空
- ✅ 需要重新創建 demo 用戶資料

**什麼時候不用**：
- ❌ demo_users 表已有資料（使用 rebuild_demo_data.py）
- ❌ 日常開發測試（使用 rebuild_demo_data.py）

**執行時間**：約 2-3 秒

**重要提示**：
執行後還需要運行 `rebuild_demo_data.py` 來同步資料到 user 表

---

### 3. ingest_school_tables.py 📊

**用途**：導入學校相關 CSV 資料到資料庫

**導入的資料**：
- `faraway3.csv` - 偏鄉學校基本資料
- `edu_B_1_4.csv` - 教育統計資料
- `全國國民中小學可上網電腦設備數量.csv` - 學校電腦設備統計
- `資訊志工團隊名單.csv` - 資訊志工團隊服務資料

**什麼時候用**：
- ✅ 更新學校資料
- ✅ 添加新的學校資料來源
- ✅ 重新導入統計資料
- ✅ 更新志工服務資料

**執行時間**：約 30-60 秒（取決於資料量）

**資料表**：
- `wide_faraway3` - 偏鄉學校資料
- `wide_edu_B_1_4` - 教育統計資料
- `wide_connected_devices` - 學校電腦設備資料
- `wide_volunteer_teams` - 資訊志工團隊資料

---

## 🔧 常見工作流程

### 工作流程 1：開發環境初次設置

```bash
# Step 1: 初始化 demo 用戶（只需一次）
python scripts/init_demo_users.py

# Step 2: 導入學校資料（可選）
python scripts/ingest_school_tables.py

# Step 3: 重建 demo 資料
python scripts/rebuild_demo_data.py
```

### 工作流程 2：日常開發測試

```bash
# 只需要這一個命令！
python scripts/rebuild_demo_data.py
```

### 工作流程 3：演示前準備

```bash
# 重置所有 demo 資料，確保乾淨的演示環境
python scripts/rebuild_demo_data.py
```

### 工作流程 4：更新學校統計資料

```bash
# 1. 更新 CSV 檔案（放在 data/ 目錄）
# 2. 重新導入
python scripts/ingest_school_tables.py
```

---

## 💡 使用建議

### ✅ 推薦做法

1. **定期重建**：每次演示前執行 `rebuild_demo_data.py`
2. **遇到問題**：第一時間執行 `rebuild_demo_data.py`
3. **版本控制**：這些腳本應該加入 git 版本控制
4. **文檔更新**：CSV 資料更新時記得更新文檔

### ❌ 避免做法

1. **手動刪除**：不要手動刪除資料庫記錄（考慮外鍵約束）
2. **直接修改**：不要直接修改 demo_users 表（使用腳本）
3. **忽略錯誤**：看到錯誤訊息時不要忽略，檢查日誌

---

## 🆘 故障排除

### 問題：執行腳本失敗

**解決方法**：
```bash
# 1. 確認虛擬環境已激活
source .venv/bin/activate

# 2. 確認資料庫連線
echo $DATABASE_URL

# 3. 檢查資料庫是否正常運行
curl http://localhost:3001/health
```

### 問題：demo 資料不正確

**解決方法**：
```bash
# 重新執行重建腳本
python scripts/rebuild_demo_data.py
```

### 問題：CSV 導入失敗

**解決方法**：
1. 檢查 CSV 檔案是否存在於 `data/` 目錄
2. 檢查 CSV 檔案格式是否正確
3. 查看錯誤訊息並修正資料

---

## 📝 維護記錄

- **2025-10-30**：整理腳本目錄，刪除冗餘文件
  - 刪除：`sync_demo_profiles.py`（功能已整合）
  - 刪除：`assign_demo_data.py`（功能已整合）
  - 刪除：`init_test_data.py`（SQLite 舊腳本）
  - 保留：核心功能腳本和資料目錄

---

## 📚 相關文檔

- **詳細說明**：[README_DEMO_DATA.md](README_DEMO_DATA.md)
- **主文檔**：[../../README.md](../../README.md)
- **API 文檔**：http://localhost:3001/docs（開發環境）


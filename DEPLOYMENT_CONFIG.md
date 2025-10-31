# 🚀 部署配置說明

## 📋 架構概覽

### 生產環境（GitHub Pages）
- **前端**: https://kaigiii.github.io/Edu_macth_PRO
- **後端**: ngrok URL（當前：`https://pedigreed-uncompulsively-reece.ngrok-free.dev`）

### 本地開發環境
- **前端**: http://localhost:5173
- **後端**: http://localhost:3001

---

## 🔧 配置說明

### 前端 API 配置
文件位置：`edu-match-pro-frontend/src/config/api.ts`

前端會自動根據運行環境選擇對應的後端地址：

```typescript
// GitHub Pages 生產環境 → ngrok 後端
if (isGitHubPages) {
  return 'https://pedigreed-uncompulsively-reece.ngrok-free.dev';
}

// 本地開發環境 → 本地後端
if (isDevelopment) {
  return 'http://localhost:3001';
}
```

---

## 📝 如何更新 ngrok 後端地址

### 方法 1：使用腳本（推薦）

```bash
# 1. 執行更新腳本
./update_ngrok_backend.sh https://your-new-subdomain.ngrok-free.dev

# 2. 根據提示確認更新
# 3. 選擇是否自動提交並推送到 GitHub
```

### 方法 2：手動修改

1. 編輯 `edu-match-pro-frontend/src/config/api.ts`
2. 找到這一行：
   ```typescript
   return 'https://pedigreed-uncompulsively-reece.ngrok-free.dev';
   ```
3. 替換為新的 ngrok URL
4. 提交並推送到 GitHub

---

## 🚀 部署流程

### 自動部署（GitHub Actions）

每次推送到 `main` 分支時，GitHub Actions 會自動：
1. 安裝前端依賴
2. 建置前端專案
3. 部署到 GitHub Pages

查看部署狀態：
👉 https://github.com/kaigiii/Edu_macth_PRO/actions

### 手動觸發部署

在 GitHub Actions 頁面點擊 "Run workflow" 按鈕

---

## 🔍 本地開發

### 1. 啟動後端（終端機 1）
```bash
cd edu-match-pro-backend
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows
python -m uvicorn main:app --reload --port 3001
```

### 2. 啟動前端（終端機 2）
```bash
cd edu-match-pro-frontend
npm run dev
```

### 3. 訪問應用
前端會自動連接本地後端：
- 前端：http://localhost:5173
- 後端：http://localhost:3001

---

## 🌐 ngrok 後端設置

### 啟動 ngrok 後端（用於 GitHub Pages）

```bash
# 1. 啟動後端
cd edu-match-pro-backend
source venv/bin/activate
python -m uvicorn main:app --reload --port 3001

# 2. 在另一個終端啟動 ngrok
ngrok http 3001

# 3. 複製 ngrok 提供的公開 URL
# 範例：https://your-subdomain.ngrok-free.dev

# 4. 更新前端配置（如果 URL 變更）
./update_ngrok_backend.sh https://your-subdomain.ngrok-free.dev
```

---

## ⚙️ 環境變數（可選）

如果需要覆蓋預設 API 地址，可以在前端專案根目錄創建 `.env` 文件：

```env
# 覆蓋預設 API 地址
VITE_API_BASE_URL=https://custom-backend-url.com
```

---

## 🐛 故障排除

### GitHub Pages 無法連接後端
✅ 檢查 ngrok 是否正在運行
✅ 確認 `api.ts` 中的 ngrok URL 是否正確
✅ 檢查後端 CORS 設置是否包含 GitHub Pages 域名

### 本地開發無法連接後端
✅ 確認後端是否在 port 3001 運行
✅ 檢查後端 CORS 設置
✅ 查看瀏覽器控制台的錯誤訊息

### GitHub Actions 建置失敗
✅ 查看 Actions 日誌：https://github.com/kaigiii/Edu_macth_PRO/actions
✅ 確認 `package.json` 依賴是否正確
✅ 檢查是否有語法錯誤或類型錯誤

---

## 📚 相關文件

- [GitHub Actions 配置](.github/workflows/deploy.yml)
- [前端 API 配置](edu-match-pro-frontend/src/config/api.ts)
- [Vite 配置](edu-match-pro-frontend/vite.config.ts)
- [後端 CORS 配置](edu-match-pro-backend/app/core/config.py)

---

## 🎯 重要提醒

1. **ngrok URL 變更時**：記得更新前端配置並重新部署
2. **後端必須保持運行**：GitHub Pages 上的前端需要連接到 ngrok 後端
3. **CORS 配置**：確保後端允許來自 `kaigiii.github.io` 的請求
4. **API Key**：確保後端環境變數（如 `GEMINI_API_KEY`）已正確設置


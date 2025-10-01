# 簡化的 API 架構

## 📁 目錄結構

```
edu-match-pro-backend/
├── app/
│   ├── api/
│   │   ├── main_api.py          # 主 API 文件 (所有端點)
│   │   └── dependencies.py      # API 依賴
│   ├── core/                    # 核心配置
│   ├── crud/                    # 數據庫操作
│   ├── models/                  # 數據模型
│   ├── schemas/                 # 數據驗證
│   └── db.py                   # 數據庫連接
├── main.py                     # 應用程序入口
└── requirements.txt            # 依賴列表
```

## 🚀 API 端點

所有 API 端點都直接掛載到根路徑：

- `GET /health` - 健康檢查
- `GET /school_needs` - 所有學校需求
- `GET /school_needs/{id}` - 單個需求
- `POST /school_needs` - 創建需求
- `PUT /school_needs/{id}` - 更新需求
- `DELETE /school_needs/{id}` - 刪除需求
- `GET /my_needs` - 我的需求
- `GET /company_dashboard_stats` - 企業儀表板
- `GET /school_dashboard_stats` - 學校儀表板
- `GET /ai_recommended_needs` - AI 推薦
- `GET /recent_projects` - 最近專案
- `GET /impact_stories` - 影響力故事
- `GET /company_donations` - 企業捐贈
- `GET /recent_activity` - 最近活動

## 🔧 優勢

1. **簡潔**: 所有 API 在一個文件中
2. **直接**: 沒有複雜的路由層級
3. **易維護**: 所有端點一目了然
4. **高效**: 減少文件間跳轉

## 📝 使用方式

```bash
# 啟動服務器
uvicorn main:app --host 0.0.0.0 --port 3001 --reload

# 訪問 API 文檔
http://localhost:3001/docs
```

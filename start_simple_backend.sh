#!/bin/bash

# 簡化的後端啟動腳本
echo "🚀 啟動簡化的 Edu-Match-Pro 後端服務器..."

# 進入後端目錄
cd edu-match-pro-backend

# 檢查 Python 環境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安裝"
    exit 1
fi

# 測試簡化結構
echo "🧪 測試簡化結構..."
python3 test_simple_structure.py

if [ $? -ne 0 ]; then
    echo "❌ 結構測試失敗"
    exit 1
fi

echo ""
echo "🌐 啟動 FastAPI 服務器在 http://localhost:3001"
echo "📚 API 文檔: http://localhost:3001/docs"
echo "🔍 健康檢查: http://localhost:3001/health"
echo ""
echo "🎯 簡化的 API 端點:"
echo "   GET  /health                    - 健康檢查"
echo "   GET  /school_needs              - 所有需求"
echo "   GET  /school_needs/{id}         - 單個需求"
echo "   POST /school_needs              - 創建需求"
echo "   PUT  /school_needs/{id}         - 更新需求"
echo "   DELETE /school_needs/{id}       - 刪除需求"
echo "   GET  /my_needs                  - 我的需求"
echo "   GET  /company_dashboard_stats   - 企業儀表板"
echo "   GET  /school_dashboard_stats    - 學校儀表板"
echo "   GET  /ai_recommended_needs      - AI 推薦"
echo "   GET  /recent_projects           - 最近專案"
echo "   GET  /impact_stories            - 影響力故事"
echo "   GET  /company_donations         - 企業捐贈"
echo "   GET  /recent_activity           - 最近活動"
echo "   POST /auth/register             - 用戶註冊"
echo "   POST /auth/login                - 用戶登入"
echo ""
echo "按 Ctrl+C 停止服務器"
echo ""

uvicorn main:app --host 0.0.0.0 --port 3001 --reload

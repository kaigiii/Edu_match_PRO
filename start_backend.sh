#!/bin/bash

# 啟動後端服務器
echo "🚀 啟動 Edu-Match-Pro 後端服務器..."

# 進入後端目錄
cd edu-match-pro-backend

# 檢查 Python 環境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安裝"
    exit 1
fi

# 檢查依賴
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt 不存在"
    exit 1
fi

# 安裝依賴（如果需要）
echo "📦 檢查依賴..."
pip3 install -r requirements.txt

# 啟動服務器
echo "🌐 啟動 FastAPI 服務器在 http://localhost:3001"
echo "📚 API 文檔: http://localhost:3001/docs"
echo "🔍 健康檢查: http://localhost:3001/health"
echo ""
echo "按 Ctrl+C 停止服務器"
echo ""

uvicorn main:app --host 0.0.0.0 --port 3001 --reload

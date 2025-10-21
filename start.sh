#!/bin/bash

# Edu-Match-Pro 全棧啟動腳本
echo "🚀 啟動 Edu-Match-Pro 全棧應用..."

# 檢查必要工具
check_requirements() {
    echo "🔍 檢查環境依賴..."
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 未安裝"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安裝"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安裝"
        exit 1
    fi
    
    echo "✅ 環境檢查通過"
}

# 啟動後端
start_backend() {
    echo ""
    echo "🔧 啟動後端服務..."
    cd edu-match-pro-backend
    
    # 檢查虛擬環境
    if [ ! -d ".venv" ]; then
        echo "📦 創建 Python 虛擬環境..."
        python3 -m venv .venv
    fi
    
    # 激活虛擬環境並安裝依賴
    source .venv/bin/activate
    echo "📦 安裝後端依賴..."
    pip install -q -r requirements.txt > /dev/null 2>&1
    
    # 啟動後端服務器
    echo "🌐 後端服務器: http://localhost:3001"
    echo "📚 API 文檔: http://localhost:3001/docs"
    echo "🔍 健康檢查: http://localhost:3001/health"
    
    # 在背景啟動後端
    uvicorn main:app --host 0.0.0.0 --port 3001 --reload &
    BACKEND_PID=$!
    
    # 等待後端啟動
    echo "⏳ 等待後端服務啟動..."
    sleep 3
    
    # 檢查後端是否啟動成功
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "✅ 後端服務啟動成功"
    else
        echo "❌ 後端服務啟動失敗"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    cd ..
}

# 啟動前端
start_frontend() {
    echo ""
    echo "🎨 啟動前端服務..."
    cd edu-match-pro-frontend
    
    # 檢查 node_modules
    if [ ! -d "node_modules" ]; then
        echo "📦 安裝前端依賴..."
        npm install --silent
    fi
    
    # 啟動前端開發服務器
    echo "🌐 前端服務器: http://localhost:5173"
    echo "🎯 應用入口: http://localhost:5173"
    
    # 在背景啟動前端
    npm run dev &
    FRONTEND_PID=$!
    
    # 等待前端啟動
    echo "⏳ 等待前端服務啟動..."
    sleep 5
    
    # 檢查前端是否啟動成功
    if curl -s http://localhost:5173 > /dev/null; then
        echo "✅ 前端服務啟動成功"
    else
        echo "❌ 前端服務啟動失敗"
        kill $FRONTEND_PID 2>/dev/null
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    cd ..
}

# 清理函數
cleanup() {
    echo ""
    echo "🛑 正在停止服務..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ 後端服務已停止"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ 前端服務已停止"
    fi
    exit 0
}

# 設置信號處理
trap cleanup SIGINT SIGTERM

# 主執行流程
main() {
    check_requirements
    start_backend
    start_frontend
    
    echo ""
    echo "🎉 全棧應用啟動完成！"
    echo ""
    echo "📱 前端應用: http://localhost:5173"
    echo "🔧 後端 API: http://localhost:3001"
    echo "📚 API 文檔: http://localhost:3001/docs"
    echo ""
    echo "按 Ctrl+C 停止所有服務"
    echo ""
    
    # 保持腳本運行
    wait
}

# 執行主函數
main

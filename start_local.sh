#!/bin/bash

# ============================================================================
# 本地開發啟動腳本
# ============================================================================
# 功能：
#   - 啟動後端服務 (uvicorn on port 3001)
#   - 啟動前端開發伺服器 (vite dev on port 5173)
# 
# 用途：本地開發，前端連接 localhost:3001
# 
# 使用方法：
#   ./start_local.sh
# ============================================================================

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 專案路徑
PROJECT_ROOT="/Users/xiaojunjun/Coding/Project/Edu_match_pro"
BACKEND_DIR="$PROJECT_ROOT/edu-match-pro-backend"
FRONTEND_DIR="$PROJECT_ROOT/edu-match-pro-frontend"

# 程序 PID
BACKEND_PID=""
FRONTEND_PID=""

# ============================================================================
# 清理函式
# ============================================================================
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止所有服務...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "   停止後端服務 (PID: $BACKEND_PID)..."
        kill -TERM $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "   停止前端服務 (PID: $FRONTEND_PID)..."
        kill -TERM $FRONTEND_PID 2>/dev/null || true
    fi
    
    # 清理連接埠
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✅ 所有服務已停止${NC}"
    exit 0
}

# 捕獲中斷訊號
trap cleanup SIGINT SIGTERM

# ============================================================================
# 啟動函式
# ============================================================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║          智匯偏鄉 Edu Match PRO - 本地開發模式              ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 檢查並清理連接埠
echo -e "${BLUE}🔍 檢查連接埠佔用...${NC}"
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "   連接埠 3001 被佔用，正在清理..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -ti:5173 > /dev/null 2>&1; then
    echo "   連接埠 5173 被佔用，正在清理..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 1
fi
echo -e "${GREEN}✅ 連接埠清理完成${NC}"
echo ""

# ============================================================================
# 啟動後端
# ============================================================================
echo -e "${BLUE}🚀 啟動後端服務...${NC}"
cd "$BACKEND_DIR"

if [ ! -d ".venv" ]; then
    echo -e "${RED}❌ 錯誤：找不到 Python 虛擬環境${NC}"
    echo "   請先在 edu-match-pro-backend 目錄執行："
    echo "   python -m venv .venv"
    echo "   source .venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

source .venv/bin/activate

echo "   啟動 uvicorn (連接埠 3001)..."
uvicorn main:app \
    --host 0.0.0.0 \
    --port 3001 \
    --reload \
    --log-level info \
    > /tmp/backend.log 2>&1 &

BACKEND_PID=$!
echo -e "${GREEN}   ✅ 後端已啟動 (PID: $BACKEND_PID)${NC}"

# 等待後端啟動
echo "   ⏳ 等待後端啟動..."
sleep 3

# 驗證後端
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ 後端健康檢查通過${NC}"
else
    echo -e "${YELLOW}   ⚠️  後端可能需要更長時間啟動${NC}"
fi

echo ""

# ============================================================================
# 啟動前端（開發模式）
# ============================================================================
echo -e "${BLUE}🚀 啟動前端開發伺服器...${NC}"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ 錯誤：找不到 node_modules${NC}"
    echo "   請先在 edu-match-pro-frontend 目錄執行："
    echo "   npm install"
    exit 1
fi

echo "   啟動 vite dev (連接埠 5173)..."
npm run dev > /tmp/frontend-dev.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}   ✅ 前端已啟動 (PID: $FRONTEND_PID)${NC}"

# 等待前端啟動
echo "   ⏳ 等待前端啟動..."
sleep 5

# 驗證前端
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ 前端健康檢查通過${NC}"
else
    echo -e "${YELLOW}   ⚠️  前端可能需要更長時間啟動${NC}"
fi

echo ""

# ============================================================================
# 顯示存取資訊
# ============================================================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🎉 啟動成功！                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 服務資訊：${NC}"
echo ""
echo -e "  ${GREEN}前端開發伺服器：${NC}"
echo -e "    🌐 http://localhost:5173"
echo ""
echo -e "  ${GREEN}後端 API 服務：${NC}"
echo -e "    🌐 http://localhost:3001"
echo -e "    📚 API 文件：http://localhost:3001/docs"
echo ""
echo -e "${BLUE}📊 日誌檔案：${NC}"
echo ""
echo -e "  後端日誌：/tmp/backend.log"
echo -e "  前端日誌：/tmp/frontend-dev.log"
echo ""
echo -e "${BLUE}💡 提示：${NC}"
echo ""
echo -e "  • 前端使用開發模式，支援熱重載"
echo -e "  • 前端自動連接到 localhost:3001"
echo -e "  • 按 ${YELLOW}Ctrl+C${NC} 停止所有服務"
echo -e "  • 如需外部存取，請執行：${YELLOW}./start_ngrok.sh${NC}"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服務...${NC}"
echo ""

# 保持腳本執行
wait


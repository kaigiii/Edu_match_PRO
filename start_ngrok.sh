#!/bin/bash

# ============================================================================
# Ngrok 隧道啟動腳本（僅後端）
# ============================================================================
# 功能：
#   - 為已運行的本地後端服務創建 ngrok 隧道
#   - 前端部署在 GitHub Pages，不需要 ngrok
# 
# 前置條件：
#   - 必須先運行 ./start_local.sh 啟動本地服務
#   - localhost:3001 (後端) 必須正在運行
# 
# 使用方法：
#   ./start_ngrok.sh
# ============================================================================

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ngrok Authtoken（僅後端）
NGROK_BACKEND_TOKEN="34glte1ct7pci54QyU6saQtYJ7X_2gyFKA1R8BFx5yied81wM"

# 進程 PID
NGROK_BACKEND_PID=""

# ============================================================================
# 清理函數
# ============================================================================
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止 Ngrok 隧道...${NC}"
    
    if [ ! -z "$NGROK_BACKEND_PID" ]; then
        echo "   停止後端隧道 (PID: $NGROK_BACKEND_PID)..."
        kill -TERM $NGROK_BACKEND_PID 2>/dev/null || true
    fi
    
    # 清理所有 ngrok 進程
    pkill -f "ngrok" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Ngrok 隧道已停止${NC}"
    echo -e "${BLUE}💡 本地服務仍在運行，可以繼續使用 localhost${NC}"
    exit 0
}

# 捕獲中斷信號
trap cleanup SIGINT SIGTERM

# ============================================================================
# 檢查前置條件
# ============================================================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║          智匯偏鄉 Edu Match PRO - Ngrok 隧道啟動            ║${NC}"
echo -e "${BLUE}║                 (僅後端 API)                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}🔍 檢查本地服務狀態...${NC}"
echo ""

# 檢查後端
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ 錯誤：後端服務未運行${NC}"
    echo ""
    echo "請先運行本地服務："
    echo -e "  ${YELLOW}./start_local.sh${NC}"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ 後端服務運行正常 (localhost:3001)${NC}"
echo ""

# 檢查 ngrok 是否安裝
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ 錯誤：未找到 ngrok${NC}"
    echo ""
    echo "請安裝 ngrok："
    echo "  brew install ngrok"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Ngrok 已安裝${NC}"
echo ""

# 清理現有的 ngrok 進程
echo -e "${BLUE}🧹 清理現有的 ngrok 隧道...${NC}"
pkill -f "ngrok" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✅ 清理完成${NC}"
echo ""

# ============================================================================
# 啟動 Ngrok 隧道
# ============================================================================

echo -e "${BLUE}🌐 啟動後端 Ngrok 隧道...${NC}"
echo ""

# 啟動後端 ngrok
echo "   啟動後端隧道 (端口 3001)..."
ngrok http 3001 \
    --authtoken="$NGROK_BACKEND_TOKEN" \
    --log=stdout \
    --log-level=info \
    > /tmp/ngrok-backend.log 2>&1 &
NGROK_BACKEND_PID=$!
echo -e "${GREEN}   ✅ 後端隧道已啟動 (PID: $NGROK_BACKEND_PID)${NC}"

echo ""
echo "   ⏳ 等待 ngrok 隧道建立（約 5 秒）..."
sleep 5

# ============================================================================
# 獲取 Ngrok URL
# ============================================================================

echo ""
echo -e "${BLUE}📡 獲取 Ngrok URL...${NC}"
echo ""

# 獲取後端 URL
BACKEND_URL=""
if [ -f /tmp/ngrok-backend.log ]; then
    BACKEND_URL=$(grep -o 'url=https://[^"]*\.ngrok[^"]*' /tmp/ngrok-backend.log | head -1 | cut -d'=' -f2)
fi

if [ -z "$BACKEND_URL" ]; then
    # 嘗試從 ngrok API 獲取
    BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
fi

# ============================================================================
# 顯示訪問資訊
# ============================================================================

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  🎉 Ngrok 後端隧道已建立！                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ ! -z "$BACKEND_URL" ]; then
    echo -e "${BLUE}🌐 公網訪問地址：${NC}"
    echo ""
    echo -e "  ${GREEN}後端 API (公網):${NC}"
    echo -e "    🌐 $BACKEND_URL"
    echo -e "    📚 API 文檔：$BACKEND_URL/docs"
    echo ""
else
    echo -e "${YELLOW}⚠️  後端 URL 獲取失敗，請訪問 http://localhost:4040 查看${NC}"
    echo ""
fi

echo -e "${BLUE}🖥️  本地訪問地址：${NC}"
echo ""
echo -e "  ${GREEN}後端 API (本地):${NC}"
echo -e "    🌐 http://localhost:3001"
echo -e "    📚 API 文檔：http://localhost:3001/docs"
echo ""

echo -e "${BLUE}🌍 前端部署：${NC}"
echo ""
echo -e "  ${GREEN}GitHub Pages:${NC}"
echo -e "    🌐 https://kaigiii.github.io/Edu_match_PRO/"
echo ""

echo -e "${BLUE}📊 Ngrok 管理界面：${NC}"
echo ""
echo -e "  後端隧道：http://localhost:4040"
echo ""

echo -e "${BLUE}📝 日誌文件：${NC}"
echo ""
echo -e "  後端隧道：/tmp/ngrok-backend.log"
echo ""

echo -e "${BLUE}💡 提示：${NC}"
echo ""
echo -e "  • 本地後端服務和 ngrok 隧道都在運行"
echo -e "  • 可以同時使用 localhost 和 ngrok URL"
echo -e "  • 按 ${YELLOW}Ctrl+C${NC} 停止 ngrok 隧道（本地服務繼續運行）"
echo ""

echo -e "${YELLOW}⚠️  重要說明：${NC}"
echo ""
echo -e "  ${GREEN}GitHub Pages 前端${NC}會連接到此 ngrok 後端"
echo ""
echo -e "  如需更新 GitHub Pages 使用的後端地址："
echo -e "  1. 複製上方的 ngrok URL"
echo -e "  2. 修改 ${YELLOW}edu-match-pro-frontend/src/config/api.ts${NC} 第 21 行"
echo -e "  3. 修改 ${YELLOW}edu-match-pro-backend/app/core/config.py${NC} 第 26 行"
echo -e "  4. git commit & push 觸發 GitHub Actions 自動部署"
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止 Ngrok 隧道...${NC}"
echo ""

# 保持腳本運行
wait


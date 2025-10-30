#!/bin/bash

# ============================================================================
# 本地开发启动脚本
# ============================================================================
# 功能：
#   - 启动后端服务 (uvicorn on port 3001)
#   - 启动前端开发服务器 (vite dev on port 5173)
# 
# 用途：本地开发，前端连接 localhost:3001
# 
# 使用方法：
#   ./start_local.sh
# ============================================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_ROOT="/Users/xiaojunjun/Coding/Project/Edu_macth_pro"
BACKEND_DIR="$PROJECT_ROOT/edu-match-pro-backend"
FRONTEND_DIR="$PROJECT_ROOT/edu-match-pro-frontend"

# 进程 PID
BACKEND_PID=""
FRONTEND_PID=""

# ============================================================================
# 清理函数
# ============================================================================
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止所有服务...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "   停止后端服务 (PID: $BACKEND_PID)..."
        kill -TERM $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "   停止前端服务 (PID: $FRONTEND_PID)..."
        kill -TERM $FRONTEND_PID 2>/dev/null || true
    fi
    
    # 清理端口
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
    exit 0
}

# 捕获中断信号
trap cleanup SIGINT SIGTERM

# ============================================================================
# 启动函数
# ============================================================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║          智匯偏鄉 Edu Match PRO - 本地开发模式              ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检查并清理端口
echo -e "${BLUE}🔍 检查端口占用...${NC}"
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "   端口 3001 被占用，正在清理..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

if lsof -ti:5173 > /dev/null 2>&1; then
    echo "   端口 5173 被占用，正在清理..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 1
fi
echo -e "${GREEN}✅ 端口清理完成${NC}"
echo ""

# ============================================================================
# 启动后端
# ============================================================================
echo -e "${BLUE}🚀 启动后端服务...${NC}"
cd "$BACKEND_DIR"

if [ ! -d ".venv" ]; then
    echo -e "${RED}❌ 错误：找不到 Python 虚拟环境${NC}"
    echo "   请先在 edu-match-pro-backend 目录运行："
    echo "   python -m venv .venv"
    echo "   source .venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

source .venv/bin/activate

echo "   启动 uvicorn (端口 3001)..."
uvicorn main:app \
    --host 0.0.0.0 \
    --port 3001 \
    --reload \
    --log-level info \
    > /tmp/backend.log 2>&1 &

BACKEND_PID=$!
echo -e "${GREEN}   ✅ 后端已启动 (PID: $BACKEND_PID)${NC}"

# 等待后端启动
echo "   ⏳ 等待后端启动..."
sleep 3

# 验证后端
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ 后端健康检查通过${NC}"
else
    echo -e "${YELLOW}   ⚠️  后端可能需要更长时间启动${NC}"
fi

echo ""

# ============================================================================
# 启动前端（开发模式）
# ============================================================================
echo -e "${BLUE}🚀 启动前端开发服务器...${NC}"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ 错误：找不到 node_modules${NC}"
    echo "   请先在 edu-match-pro-frontend 目录运行："
    echo "   npm install"
    exit 1
fi

echo "   启动 vite dev (端口 5173)..."
npm run dev > /tmp/frontend-dev.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}   ✅ 前端已启动 (PID: $FRONTEND_PID)${NC}"

# 等待前端启动
echo "   ⏳ 等待前端启动..."
sleep 5

# 验证前端
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ 前端健康检查通过${NC}"
else
    echo -e "${YELLOW}   ⚠️  前端可能需要更长时间启动${NC}"
fi

echo ""

# ============================================================================
# 显示访问信息
# ============================================================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🎉 启动成功！                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 服务信息：${NC}"
echo ""
echo -e "  ${GREEN}前端开发服务器：${NC}"
echo -e "    🌐 http://localhost:5173"
echo ""
echo -e "  ${GREEN}后端 API 服务：${NC}"
echo -e "    🌐 http://localhost:3001"
echo -e "    📚 API 文档：http://localhost:3001/docs"
echo ""
echo -e "${BLUE}📊 日志文件：${NC}"
echo ""
echo -e "  后端日志：/tmp/backend.log"
echo -e "  前端日志：/tmp/frontend-dev.log"
echo ""
echo -e "${BLUE}💡 提示：${NC}"
echo ""
echo -e "  • 前端使用开发模式，支持热重载"
echo -e "  • 前端自动连接到 localhost:3001"
echo -e "  • 按 ${YELLOW}Ctrl+C${NC} 停止所有服务"
echo -e "  • 如需外部访问，请运行：${YELLOW}./start_ngrok.sh${NC}"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服务...${NC}"
echo ""

# 保持脚本运行
wait


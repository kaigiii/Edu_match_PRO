#!/bin/bash

# 快速重建 Demo 資料腳本
# 在項目根目錄執行此腳本

echo "🔄 重建 Demo 資料..."
echo ""

cd edu-match-pro-backend
source .venv/bin/activate
python scripts/rebuild_demo_data.py

echo ""
echo "✅ 完成！"
echo ""
echo "📱 現在可以使用以下帳號登入測試："
echo "  • demo.school@edu.tw / demo_school_2024"
echo "  • demo.rural.school@edu.tw / demo_rural_2024"
echo "  • demo.company@tech.com / demo_company_2024"
echo ""


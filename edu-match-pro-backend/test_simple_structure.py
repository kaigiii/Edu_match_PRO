#!/usr/bin/env python3
"""
測試簡化的 API 結構
"""
import sys
import os

# 添加項目根目錄到 Python 路徑
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # 測試導入
    print("🧪 測試簡化 API 結構...")
    
    # 測試 main.py 導入
    print("📦 測試 main.py...")
    from main import app
    print("✅ main.py 導入成功")
    
    # 測試 API 路由
    print("📦 測試 API 路由...")
    routes = [route.path for route in app.routes]
    print(f"✅ 找到 {len(routes)} 個路由")
    
    # 顯示主要路由
    main_routes = [route for route in routes if not route.startswith('/docs') and not route.startswith('/openapi')]
    print("🔗 主要 API 路由:")
    for route in sorted(main_routes):
        print(f"   {route}")
    
    print("\n🎉 簡化結構測試成功！")
    print("📚 API 文檔將在: http://localhost:3001/docs")
    
except ImportError as e:
    print(f"❌ 導入錯誤: {e}")
    print("💡 請確保已安裝所有依賴: pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ 測試失敗: {e}")
    sys.exit(1)

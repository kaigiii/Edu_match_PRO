#!/usr/bin/env python3
"""
API 測試腳本
測試所有前端需要的 API 端點
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:3001"

def test_endpoint(method: str, endpoint: str, expected_status: int = 200, data: Dict[Any, Any] = None) -> bool:
    """測試 API 端點"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, timeout=5)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            print(f"❌ 不支持的 HTTP 方法: {method}")
            return False
        
        if response.status_code == expected_status:
            print(f"✅ {method} {endpoint} - 狀態碼: {response.status_code}")
            return True
        else:
            print(f"❌ {method} {endpoint} - 期望狀態碼: {expected_status}, 實際: {response.status_code}")
            if response.text:
                print(f"   響應: {response.text[:200]}...")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {endpoint} - 連接失敗 (後端服務器未啟動?)")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {method} {endpoint} - 請求超時")
        return False
    except Exception as e:
        print(f"❌ {method} {endpoint} - 錯誤: {e}")
        return False

def main():
    """主測試函數"""
    print("🧪 開始測試 Edu-Match-Pro API 端點")
    print("=" * 50)
    
    # 測試健康檢查
    print("\n📋 健康檢查測試:")
    test_endpoint("GET", "/health")
    
    # 測試學校需求 API
    print("\n📋 學校需求 API 測試:")
    test_endpoint("GET", "/school_needs")
    test_endpoint("GET", "/school_needs/need-001")  # 假設有這個 ID
    
    # 測試儀表板 API
    print("\n📋 儀表板 API 測試:")
    test_endpoint("GET", "/company_dashboard_stats")
    test_endpoint("GET", "/school_dashboard_stats")
    test_endpoint("GET", "/platform_stats")
    
    # 測試推薦和項目 API
    print("\n📋 推薦和項目 API 測試:")
    test_endpoint("GET", "/ai_recommended_needs")
    test_endpoint("GET", "/recent_projects")
    
    # 測試影響力故事 API
    print("\n📋 影響力故事 API 測試:")
    test_endpoint("GET", "/impact_stories")
    
    # 測試用戶相關 API
    print("\n📋 用戶相關 API 測試:")
    test_endpoint("GET", "/my_needs")
    test_endpoint("GET", "/company_donations")
    test_endpoint("GET", "/recent_activity")
    
    print("\n" + "=" * 50)
    print("🎯 測試完成！")
    print("\n💡 提示:")
    print("   - 如果看到 '連接失敗'，請確保後端服務器正在運行")
    print("   - 如果看到 '403 Forbidden'，這是正常的（需要認證）")
    print("   - 如果看到 '404 Not Found'，可能是數據庫中沒有對應數據")
    print("\n🚀 啟動後端服務器:")
    print("   cd edu-match-pro-backend && uvicorn main:app --host 0.0.0.0 --port 3001 --reload")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
修復後的模擬登入系統測試腳本
測試模擬用戶可以訪問受保護的 API 端點
"""

import requests
import json
import time

# 測試配置
BASE_URL = "http://localhost:8000"

# 測試用例
DEMO_CREDENTIALS = [
    {
        "username": "demo.school@edu.tw",
        "password": "demo_school_2024",
        "role": "school",
        "description": "城市學校模擬登入",
        "protected_endpoints": [
            "/school_dashboard_stats",
            "/my_needs"
        ]
    },
    {
        "username": "demo.company@tech.com", 
        "password": "demo_company_2024",
        "role": "company",
        "description": "企業模擬登入",
        "protected_endpoints": [
            "/company_dashboard_stats",
            "/company_donations",
            "/recent_activity"
        ]
    },
    {
        "username": "demo.rural.school@edu.tw",
        "password": "demo_rural_2024", 
        "role": "school",
        "description": "偏鄉學校模擬登入",
        "protected_endpoints": [
            "/school_dashboard_stats",
            "/my_needs"
        ]
    }
]

def test_health_check():
    """測試健康檢查"""
    print("🔍 測試健康檢查...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ 後端服務正常運行")
            return True
        else:
            print(f"❌ 後端服務異常: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 無法連接到後端服務: {e}")
        return False

def test_demo_login_and_protected_access(credentials):
    """測試模擬登入並訪問受保護端點"""
    print(f"\n🔐 測試 {credentials['description']}...")
    
    try:
        # 1. 測試登入
        login_response = requests.post(
            f"{BASE_URL}/demo/auth/login",
            data={
                "username": credentials["username"],
                "password": credentials["password"]
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"❌ 登入失敗: {login_response.status_code} - {login_response.text}")
            return False
        
        data = login_response.json()
        token = data.get("access_token")
        if not token:
            print("❌ 登入失敗：未獲得 token")
            return False
        
        print(f"✅ 登入成功，獲得 token: {token[:50]}...")
        
        # 2. 測試受保護端點
        print(f"   🛡️  測試受保護端點...")
        for endpoint in credentials["protected_endpoints"]:
            try:
                protected_response = requests.get(
                    f"{BASE_URL}{endpoint}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10
                )
                
                if protected_response.status_code == 200:
                    print(f"   ✅ {endpoint} - 訪問成功")
                else:
                    print(f"   ❌ {endpoint} - 訪問失敗: {protected_response.status_code}")
                    return False
                    
            except Exception as e:
                print(f"   ❌ {endpoint} - 請求失敗: {e}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_unauthorized_access():
    """測試未授權訪問"""
    print(f"\n🚫 測試未授權訪問...")
    
    try:
        # 不使用 token 訪問受保護端點
        response = requests.get(f"{BASE_URL}/school_dashboard_stats", timeout=10)
        
        if response.status_code == 401:
            print("✅ 未授權訪問正確被拒絕")
            return True
        else:
            print(f"❌ 未授權訪問處理異常: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 未授權訪問測試失敗: {e}")
        return False

def test_invalid_token():
    """測試無效 token"""
    print(f"\n🔒 測試無效 token...")
    
    try:
        # 使用無效 token 訪問受保護端點
        response = requests.get(
            f"{BASE_URL}/school_dashboard_stats",
            headers={"Authorization": "Bearer invalid_token"},
            timeout=10
        )
        
        if response.status_code == 401:
            print("✅ 無效 token 正確被拒絕")
            return True
        else:
            print(f"❌ 無效 token 處理異常: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 無效 token 測試失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始修復後的模擬登入系統測試")
    print("=" * 60)
    
    # 測試結果統計
    tests_passed = 0
    total_tests = 0
    
    # 1. 健康檢查
    total_tests += 1
    if test_health_check():
        tests_passed += 1
    
    # 2. 各種模擬登入和受保護端點測試
    for credentials in DEMO_CREDENTIALS:
        total_tests += 1
        if test_demo_login_and_protected_access(credentials):
            tests_passed += 1
    
    # 3. 未授權訪問測試
    total_tests += 1
    if test_unauthorized_access():
        tests_passed += 1
    
    # 4. 無效 token 測試
    total_tests += 1
    if test_invalid_token():
        tests_passed += 1
    
    # 測試結果總結
    print("\n" + "=" * 60)
    print("📊 測試結果總結")
    print(f"✅ 通過測試: {tests_passed}/{total_tests}")
    print(f"❌ 失敗測試: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有測試通過！模擬登入系統修復成功")
        print("\n🔧 修復內容:")
        print("  - 後端 dependencies.py 支援模擬用戶認證")
        print("  - 前端 apiService.ts 使用新的模擬登入服務")
        print("  - 模擬用戶可以正常訪問受保護的 API 端點")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

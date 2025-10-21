#!/usr/bin/env python3
"""
模擬登入系統測試腳本
測試所有模擬登入功能
"""

import requests
import json
import time

# 測試配置
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

# 測試用例
DEMO_CREDENTIALS = [
    {
        "username": "demo.school@edu.tw",
        "password": "demo_school_2024",
        "role": "school",
        "description": "城市學校模擬登入"
    },
    {
        "username": "demo.company@tech.com", 
        "password": "demo_company_2024",
        "role": "company",
        "description": "企業模擬登入"
    },
    {
        "username": "demo.rural.school@edu.tw",
        "password": "demo_rural_2024", 
        "role": "school",
        "description": "偏鄉學校模擬登入"
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

def test_demo_login(credentials):
    """測試模擬登入"""
    print(f"\n🔐 測試 {credentials['description']}...")
    
    try:
        # 測試登入
        response = requests.post(
            f"{BASE_URL}/demo/auth/login",
            data={
                "username": credentials["username"],
                "password": credentials["password"]
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            if token:
                print(f"✅ 登入成功，獲得 token: {token[:50]}...")
                
                # 測試 token 解析
                import base64
                import json
                try:
                    # 解析 JWT payload
                    payload_part = token.split('.')[1]
                    # 添加 padding
                    payload_part += '=' * (4 - len(payload_part) % 4)
                    payload = json.loads(base64.b64decode(payload_part))
                    
                    print(f"   - 用戶 ID: {payload.get('sub')}")
                    print(f"   - 角色: {payload.get('role')}")
                    print(f"   - 是否模擬用戶: {payload.get('is_demo')}")
                    print(f"   - 顯示名稱: {payload.get('display_name')}")
                    
                    return True
                except Exception as e:
                    print(f"❌ Token 解析失敗: {e}")
                    return False
            else:
                print("❌ 登入失敗：未獲得 token")
                return False
        else:
            print(f"❌ 登入失敗: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 登入請求失敗: {e}")
        return False

def test_invalid_credentials():
    """測試無效憑證"""
    print(f"\n🚫 測試無效憑證...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/demo/auth/login",
            data={
                "username": "demo.school@edu.tw",
                "password": "wrong_password"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if response.status_code == 401:
            print("✅ 無效憑證正確被拒絕")
            return True
        else:
            print(f"❌ 無效憑證處理異常: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 無效憑證測試失敗: {e}")
        return False

def test_demo_users_list():
    """測試模擬用戶列表"""
    print(f"\n📋 測試模擬用戶列表...")
    
    try:
        response = requests.get(f"{BASE_URL}/demo/users", timeout=10)
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ 成功獲取 {len(users)} 個模擬用戶")
            for user in users:
                print(f"   - {user['email']} ({user['role']})")
            return True
        else:
            print(f"❌ 獲取用戶列表失敗: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 用戶列表測試失敗: {e}")
        return False

def test_frontend_connection():
    """測試前端連接"""
    print(f"\n🌐 測試前端連接...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ 前端服務正常運行")
            return True
        else:
            print(f"❌ 前端服務異常: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 無法連接到前端服務: {e}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始模擬登入系統測試")
    print("=" * 50)
    
    # 測試結果統計
    tests_passed = 0
    total_tests = 0
    
    # 1. 健康檢查
    total_tests += 1
    if test_health_check():
        tests_passed += 1
    
    # 2. 前端連接測試
    total_tests += 1
    if test_frontend_connection():
        tests_passed += 1
    
    # 3. 模擬用戶列表測試
    total_tests += 1
    if test_demo_users_list():
        tests_passed += 1
    
    # 4. 各種模擬登入測試
    for credentials in DEMO_CREDENTIALS:
        total_tests += 1
        if test_demo_login(credentials):
            tests_passed += 1
    
    # 5. 無效憑證測試
    total_tests += 1
    if test_invalid_credentials():
        tests_passed += 1
    
    # 測試結果總結
    print("\n" + "=" * 50)
    print("📊 測試結果總結")
    print(f"✅ 通過測試: {tests_passed}/{total_tests}")
    print(f"❌ 失敗測試: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有測試通過！模擬登入系統運行正常")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

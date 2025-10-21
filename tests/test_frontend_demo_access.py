#!/usr/bin/env python3
"""
測試前端企業用戶查看模擬需求功能
驗證前端頁面能正確顯示模擬需求
"""

import requests
import json

# 測試配置
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

def test_company_frontend_access():
    """測試企業用戶前端訪問模擬需求"""
    print("🔍 測試企業用戶前端訪問模擬需求...")
    
    try:
        # 模擬企業登入
        login_response = requests.post(
            f"{BASE_URL}/demo/auth/login",
            data={
                "username": "demo.company@tech.com",
                "password": "demo_company_2024"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"❌ 模擬企業登入失敗: {login_response.status_code}")
            return False
        
        token = login_response.json()["access_token"]
        print("✅ 模擬企業登入成功")
        
        # 測試企業專用端點
        company_needs_response = requests.get(
            f"{BASE_URL}/company_needs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if company_needs_response.status_code != 200:
            print(f"❌ 獲取企業需求失敗: {company_needs_response.status_code}")
            return False
        
        company_needs = company_needs_response.json()
        print(f"✅ 企業端點返回 {len(company_needs)} 個需求")
        
        # 檢查是否包含模擬學校的需求
        demo_school_ids = [
            "3bdb0ba3-d07c-4d7a-9503-2e31b759ba77",  # 台東縣太麻里國小（演示）
            "06a977b8-b26e-4c6d-9292-03d92fa9c21a",  # 台北市立建國中學（演示）
        ]
        
        demo_needs_in_company_view = [
            need for need in company_needs 
            if need.get('school_id') in demo_school_ids
        ]
        
        if demo_needs_in_company_view:
            print(f"✅ 企業可以看到 {len(demo_needs_in_company_view)} 個模擬學校需求")
            return True
        else:
            print("❌ 企業看不到模擬學校的需求")
            return False
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_public_needs_exclude_demo():
    """測試公開需求列表仍然排除模擬需求"""
    print("\n🔍 測試公開需求列表排除模擬需求...")
    
    try:
        # 獲取公開需求列表（不需要認證）
        public_response = requests.get(f"{BASE_URL}/school_needs", timeout=10)
        
        if public_response.status_code != 200:
            print(f"❌ 獲取公開需求失敗: {public_response.status_code}")
            return False
        
        public_needs = public_response.json()
        print(f"✅ 公開需求列表包含 {len(public_needs)} 個需求")
        
        # 檢查是否包含模擬學校的需求
        demo_school_ids = [
            "3bdb0ba3-d07c-4d7a-9503-2e31b759ba77",  # 台東縣太麻里國小（演示）
            "06a977b8-b26e-4c6d-9292-03d92fa9c21a",  # 台北市立建國中學（演示）
        ]
        
        demo_needs_in_public = [
            need for need in public_needs 
            if need.get('school_id') in demo_school_ids
        ]
        
        if demo_needs_in_public:
            print(f"❌ 公開需求列表包含 {len(demo_needs_in_public)} 個模擬需求")
            return False
        else:
            print("✅ 公開需求列表正確排除模擬需求")
            return True
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_frontend_availability():
    """測試前端服務是否可用"""
    print("\n🔍 測試前端服務可用性...")
    
    try:
        # 檢查前端服務
        frontend_response = requests.get(FRONTEND_URL, timeout=5)
        
        if frontend_response.status_code == 200:
            print("✅ 前端服務正在運行")
            return True
        else:
            print(f"❌ 前端服務異常: {frontend_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 前端服務不可用: {e}")
        return False

def test_api_endpoints():
    """測試API端點配置"""
    print("\n🔍 測試API端點配置...")
    
    try:
        # 測試健康檢查
        health_response = requests.get(f"{BASE_URL}/health", timeout=5)
        
        if health_response.status_code == 200:
            print("✅ 後端API健康檢查通過")
        else:
            print(f"❌ 後端API健康檢查失敗: {health_response.status_code}")
            return False
        
        # 測試企業端點
        company_response = requests.get(f"{BASE_URL}/company_needs", timeout=5)
        
        if company_response.status_code == 401:  # 未認證，這是預期的
            print("✅ 企業端點需要認證（正確行為）")
            return True
        elif company_response.status_code == 200:
            print("⚠️  企業端點不需要認證（可能不安全）")
            return False
        else:
            print(f"❌ 企業端點異常: {company_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API端點測試失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始測試前端企業查看模擬需求功能")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 4
    
    # 測試1: 前端服務可用性
    if test_frontend_availability():
        tests_passed += 1
    
    # 測試2: API端點配置
    if test_api_endpoints():
        tests_passed += 1
    
    # 測試3: 企業查看模擬需求
    if test_company_frontend_access():
        tests_passed += 1
    
    # 測試4: 公開需求列表過濾
    if test_public_needs_exclude_demo():
        tests_passed += 1
    
    # 測試結果總結
    print("\n" + "=" * 60)
    print("📊 測試結果總結")
    print(f"✅ 通過測試: {tests_passed}/{total_tests}")
    print(f"❌ 失敗測試: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有測試通過！前端企業查看模擬需求功能正常")
        print("\n🔧 功能說明:")
        print("  - 前端服務正在運行")
        print("  - API端點配置正確")
        print("  - 企業用戶可以查看模擬需求")
        print("  - 公開需求列表正確過濾")
        print("\n🌐 使用方式:")
        print("  1. 打開瀏覽器訪問 http://localhost:5173")
        print("  2. 使用模擬企業帳號登入")
        print("  3. 進入儀表板 > 探索需求")
        print("  4. 查看所有需求（包括模擬需求）")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

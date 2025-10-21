#!/usr/bin/env python3
"""
測試企業用戶查看模擬需求功能
驗證模擬企業可以看到模擬學校創建的需求
"""

import requests
import json

# 測試配置
BASE_URL = "http://localhost:8000"

def test_company_can_see_demo_needs():
    """測試企業用戶可以看到模擬需求"""
    print("🔍 測試企業用戶查看模擬需求...")
    
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
        
        # 獲取企業可查看的所有需求
        company_needs_response = requests.get(
            f"{BASE_URL}/company_needs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if company_needs_response.status_code != 200:
            print(f"❌ 獲取企業需求失敗: {company_needs_response.status_code}")
            return False
        
        company_needs = company_needs_response.json()
        print(f"✅ 企業可查看 {len(company_needs)} 個需求")
        
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
            print(f"✅ 企業可以看到 {len(demo_needs_in_company_view)} 個模擬學校需求:")
            for need in demo_needs_in_company_view[:3]:  # 只顯示前3個
                print(f"   - {need.get('title')} (學校ID: {need.get('school_id')})")
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

def test_demo_school_can_see_own_needs():
    """測試模擬學校可以看到自己的需求"""
    print("\n🔍 測試模擬學校查看自己的需求...")
    
    try:
        # 模擬學校登入
        login_response = requests.post(
            f"{BASE_URL}/demo/auth/login",
            data={
                "username": "demo.school@edu.tw",
                "password": "demo_school_2024"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"❌ 模擬學校登入失敗: {login_response.status_code}")
            return False
        
        token = login_response.json()["access_token"]
        print("✅ 模擬學校登入成功")
        
        # 獲取自己的需求
        my_needs_response = requests.get(
            f"{BASE_URL}/my_needs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if my_needs_response.status_code != 200:
            print(f"❌ 獲取個人需求失敗: {my_needs_response.status_code}")
            return False
        
        my_needs = my_needs_response.json()
        print(f"✅ 模擬學校可以看到自己的 {len(my_needs)} 個需求")
        
        # 檢查是否都是自己的需求
        demo_school_id = "06a977b8-b26e-4c6d-9292-03d92fa9c21a"  # 台北市立建國中學（演示）
        own_needs = [
            need for need in my_needs 
            if need.get('school_id') == demo_school_id
        ]
        
        if len(own_needs) == len(my_needs):
            print("✅ 模擬學校只能看到自己的需求")
            return True
        else:
            print("❌ 模擬學校看到了不屬於自己的需求")
            return False
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始測試企業查看模擬需求功能")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 3
    
    # 測試1: 企業可以看到模擬需求
    if test_company_can_see_demo_needs():
        tests_passed += 1
    
    # 測試2: 公開需求列表排除模擬需求
    if test_public_needs_exclude_demo():
        tests_passed += 1
    
    # 測試3: 模擬學校只能看到自己的需求
    if test_demo_school_can_see_own_needs():
        tests_passed += 1
    
    # 測試結果總結
    print("\n" + "=" * 60)
    print("📊 測試結果總結")
    print(f"✅ 通過測試: {tests_passed}/{total_tests}")
    print(f"❌ 失敗測試: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有測試通過！企業查看模擬需求功能正常")
        print("\n🔧 功能說明:")
        print("  - 模擬企業可以查看所有需求（包括模擬學校需求）")
        print("  - 公開需求列表只顯示真實用戶需求")
        print("  - 模擬學校只能看到自己的需求")
        print("  - 實現了完整的模擬演示功能")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

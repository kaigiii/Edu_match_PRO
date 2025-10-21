#!/usr/bin/env python3
"""
測試模擬資料分離功能
驗證模擬用戶創建的需求不會出現在公開需求列表中
"""

import requests
import json

# 測試配置
BASE_URL = "http://localhost:8000"

def test_public_needs_separation():
    """測試公開需求列表是否正確過濾模擬需求"""
    print("🔍 測試公開需求列表...")
    
    try:
        # 獲取公開需求列表
        response = requests.get(f"{BASE_URL}/school_needs", timeout=10)
        
        if response.status_code != 200:
            print(f"❌ 獲取公開需求失敗: {response.status_code}")
            return False
        
        public_needs = response.json()
        print(f"✅ 公開需求列表包含 {len(public_needs)} 個需求")
        
        # 檢查是否包含模擬用戶的需求
        demo_school_ids = [
            "3bdb0ba3-d07c-4d7a-9503-2e31b759ba77",  # 台東縣太麻里國小（演示）
            "06a977b8-b26e-4c6d-9292-03d92fa9c21a",  # 台北市立建國中學（演示）
        ]
        
        demo_needs_in_public = [
            need for need in public_needs 
            if need.get('school_id') in demo_school_ids
        ]
        
        if demo_needs_in_public:
            print(f"❌ 公開需求列表包含 {len(demo_needs_in_public)} 個模擬需求:")
            for need in demo_needs_in_public:
                print(f"   - {need.get('title')} (ID: {need.get('school_id')})")
            return False
        else:
            print("✅ 公開需求列表已正確過濾模擬需求")
            return True
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_demo_user_private_needs():
    """測試模擬用戶的私人需求列表"""
    print("\n🔍 測試模擬用戶私人需求...")
    
    try:
        # 模擬用戶登入
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
            print(f"❌ 模擬用戶登入失敗: {login_response.status_code}")
            return False
        
        token = login_response.json()["access_token"]
        print("✅ 模擬用戶登入成功")
        
        # 獲取私人需求列表
        private_response = requests.get(
            f"{BASE_URL}/my_needs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if private_response.status_code != 200:
            print(f"❌ 獲取私人需求失敗: {private_response.status_code}")
            return False
        
        private_needs = private_response.json()
        print(f"✅ 模擬用戶私人需求列表包含 {len(private_needs)} 個需求")
        
        # 檢查是否包含模擬用戶自己的需求
        demo_school_id = "06a977b8-b26e-4c6d-9292-03d92fa9c21a"  # 台北市立建國中學（演示）
        user_needs = [
            need for need in private_needs 
            if need.get('school_id') == demo_school_id
        ]
        
        if user_needs:
            print(f"✅ 模擬用戶可以看到自己的 {len(user_needs)} 個需求")
            for need in user_needs[:3]:  # 只顯示前3個
                print(f"   - {need.get('title')}")
            return True
        else:
            print("❌ 模擬用戶看不到自己的需求")
            return False
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_create_demo_need():
    """測試模擬用戶創建需求"""
    print("\n🔍 測試模擬用戶創建需求...")
    
    try:
        # 模擬用戶登入
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
            print(f"❌ 模擬用戶登入失敗: {login_response.status_code}")
            return False
        
        token = login_response.json()["access_token"]
        
        # 創建新需求
        need_data = {
            "title": "測試模擬需求分離",
            "description": "這是一個測試需求，用於驗證模擬需求不會出現在公開列表中",
            "category": "測試類別",
            "location": "測試地點",
            "student_count": 5,
            "urgency": "low",
            "sdgs": [4]
        }
        
        create_response = requests.post(
            f"{BASE_URL}/school_needs",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=need_data,
            timeout=10
        )
        
        if create_response.status_code != 201:
            print(f"❌ 創建需求失敗: {create_response.status_code}")
            return False
        
        created_need = create_response.json()
        print(f"✅ 成功創建需求: {created_need['title']}")
        
        # 驗證新需求不會出現在公開列表中
        public_response = requests.get(f"{BASE_URL}/school_needs", timeout=10)
        if public_response.status_code == 200:
            public_needs = public_response.json()
            new_need_in_public = any(
                need.get('id') == created_need['id'] 
                for need in public_needs
            )
            
            if new_need_in_public:
                print("❌ 新創建的模擬需求出現在公開列表中")
                return False
            else:
                print("✅ 新創建的模擬需求正確地被排除在公開列表之外")
                return True
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始測試模擬資料分離功能")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 3
    
    # 測試1: 公開需求列表過濾
    if test_public_needs_separation():
        tests_passed += 1
    
    # 測試2: 模擬用戶私人需求
    if test_demo_user_private_needs():
        tests_passed += 1
    
    # 測試3: 創建模擬需求
    if test_create_demo_need():
        tests_passed += 1
    
    # 測試結果總結
    print("\n" + "=" * 60)
    print("📊 測試結果總結")
    print(f"✅ 通過測試: {tests_passed}/{total_tests}")
    print(f"❌ 失敗測試: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有測試通過！模擬資料分離功能正常")
        print("\n🔧 功能說明:")
        print("  - 公開需求列表 (/school_needs) 只顯示真實用戶需求")
        print("  - 模擬用戶可以正常創建和查看自己的需求")
        print("  - 模擬用戶創建的需求不會污染公開需求列表")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

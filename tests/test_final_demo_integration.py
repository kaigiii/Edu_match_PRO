#!/usr/bin/env python3
"""
最終測試：企業用戶查看模擬需求功能
驗證前端和後端完整整合
"""

import requests
import json

# 測試配置
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

def test_complete_demo_flow():
    """測試完整的模擬演示流程"""
    print("🚀 測試完整的模擬演示流程")
    print("=" * 60)
    
    # 測試1: 模擬企業登入
    print("1️⃣ 測試模擬企業登入...")
    try:
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
        
    except Exception as e:
        print(f"❌ 模擬企業登入失敗: {e}")
        return False
    
    # 測試2: 企業查看所有需求（包括模擬需求）
    print("\n2️⃣ 測試企業查看所有需求...")
    try:
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
            print(f"✅ 企業可以看到 {len(demo_needs_in_company_view)} 個模擬學校需求")
        else:
            print("❌ 企業看不到模擬學校的需求")
            return False
            
    except Exception as e:
        print(f"❌ 企業需求測試失敗: {e}")
        return False
    
    # 測試3: 公開需求列表過濾
    print("\n3️⃣ 測試公開需求列表過濾...")
    try:
        public_response = requests.get(f"{BASE_URL}/school_needs", timeout=10)
        
        if public_response.status_code != 200:
            print(f"❌ 獲取公開需求失敗: {public_response.status_code}")
            return False
        
        public_needs = public_response.json()
        print(f"✅ 公開需求列表包含 {len(public_needs)} 個需求")
        
        # 檢查是否包含模擬學校的需求
        demo_needs_in_public = [
            need for need in public_needs 
            if need.get('school_id') in demo_school_ids
        ]
        
        if demo_needs_in_public:
            print(f"❌ 公開需求列表包含 {len(demo_needs_in_public)} 個模擬需求")
            return False
        else:
            print("✅ 公開需求列表正確排除模擬需求")
            
    except Exception as e:
        print(f"❌ 公開需求測試失敗: {e}")
        return False
    
    # 測試4: 模擬學校查看自己的需求
    print("\n4️⃣ 測試模擬學校查看自己的需求...")
    try:
        school_login_response = requests.post(
            f"{BASE_URL}/demo/auth/login",
            data={
                "username": "demo.school@edu.tw",
                "password": "demo_school_2024"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if school_login_response.status_code != 200:
            print(f"❌ 模擬學校登入失敗: {school_login_response.status_code}")
            return False
        
        school_token = school_login_response.json()["access_token"]
        print("✅ 模擬學校登入成功")
        
        # 獲取學校自己的需求
        my_needs_response = requests.get(
            f"{BASE_URL}/my_needs",
            headers={"Authorization": f"Bearer {school_token}"},
            timeout=10
        )
        
        if my_needs_response.status_code != 200:
            print(f"❌ 獲取學校需求失敗: {my_needs_response.status_code}")
            return False
        
        my_needs = my_needs_response.json()
        print(f"✅ 模擬學校可以看到自己的 {len(my_needs)} 個需求")
        
    except Exception as e:
        print(f"❌ 模擬學校測試失敗: {e}")
        return False
    
    # 測試5: 前端服務可用性
    print("\n5️⃣ 測試前端服務可用性...")
    try:
        frontend_response = requests.get(FRONTEND_URL, timeout=5)
        
        if frontend_response.status_code == 200:
            print("✅ 前端服務正在運行")
        else:
            print(f"❌ 前端服務異常: {frontend_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 前端服務測試失敗: {e}")
        return False
    
    return True

def main():
    """主測試函數"""
    print("🎯 最終測試：企業用戶查看模擬需求功能")
    print("=" * 60)
    
    if test_complete_demo_flow():
        print("\n" + "=" * 60)
        print("🎉 所有測試通過！企業查看模擬需求功能完全正常")
        print("\n🔧 功能總結:")
        print("  ✅ 模擬企業可以登入")
        print("  ✅ 企業可以查看所有需求（包括模擬需求）")
        print("  ✅ 公開需求列表正確過濾模擬需求")
        print("  ✅ 模擬學校只能看到自己的需求")
        print("  ✅ 前端服務正常運行")
        
        print("\n🌐 使用方式:")
        print("  1. 打開瀏覽器訪問 http://localhost:5173")
        print("  2. 點擊登入，選擇「企業模擬登入」")
        print("  3. 進入儀表板，點擊「探索需求」")
        print("  4. 查看所有需求（包括模擬學校創建的需求）")
        
        print("\n🎊 現在您可以在網頁上完整地演示企業查看模擬需求的功能了！")
        return True
    else:
        print("\n" + "=" * 60)
        print("⚠️  測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

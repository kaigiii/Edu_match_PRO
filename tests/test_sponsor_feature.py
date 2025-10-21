#!/usr/bin/env python3
"""
測試贊助專案功能
驗證企業用戶可以贊助專案
"""

import requests
import json

# 測試配置
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

def test_sponsor_api():
    """測試贊助 API 功能"""
    print("🔍 測試贊助 API 功能...")
    
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
        
        # 獲取一個需求 ID
        needs_response = requests.get(
            f"{BASE_URL}/company_needs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if needs_response.status_code != 200:
            print(f"❌ 獲取需求列表失敗: {needs_response.status_code}")
            return False
        
        needs = needs_response.json()
        if not needs:
            print("❌ 沒有可用的需求")
            return False
        
        need_id = needs[0]["id"]
        print(f"✅ 找到需求: {needs[0]['title']}")
        
        # 測試贊助 API
        sponsor_data = {
            "donation_type": "經費",
            "description": "測試贊助專案"
        }
        
        sponsor_response = requests.post(
            f"{BASE_URL}/sponsor_need/{need_id}",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=sponsor_data,
            timeout=10
        )
        
        if sponsor_response.status_code != 201:
            print(f"❌ 贊助失敗: {sponsor_response.status_code}")
            print(f"錯誤詳情: {sponsor_response.text}")
            return False
        
        sponsor_result = sponsor_response.json()
        print(f"✅ 贊助成功！贊助 ID: {sponsor_result['id']}")
        print(f"   - 贊助類型: {sponsor_result['donation_type']}")
        print(f"   - 贊助說明: {sponsor_result['description']}")
        print(f"   - 狀態: {sponsor_result['status']}")
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_sponsor_validation():
    """測試贊助驗證功能"""
    print("\n🔍 測試贊助驗證功能...")
    
    try:
        # 測試未認證用戶
        sponsor_response = requests.post(
            f"{BASE_URL}/sponsor_need/test-id",
            headers={"Content-Type": "application/json"},
            json={"donation_type": "經費", "description": "測試"},
            timeout=10
        )
        
        if sponsor_response.status_code == 401:
            print("✅ 未認證用戶被正確拒絕")
        else:
            print(f"❌ 未認證用戶應該被拒絕，但得到: {sponsor_response.status_code}")
            return False
        
        # 測試學校用戶（應該被拒絕）
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
        
        school_sponsor_response = requests.post(
            f"{BASE_URL}/sponsor_need/test-id",
            headers={
                "Authorization": f"Bearer {school_token}",
                "Content-Type": "application/json"
            },
            json={"donation_type": "經費", "description": "測試"},
            timeout=10
        )
        
        if school_sponsor_response.status_code == 403:
            print("✅ 學校用戶被正確拒絕贊助")
        else:
            print(f"❌ 學校用戶應該被拒絕贊助，但得到: {school_sponsor_response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_frontend_availability():
    """測試前端服務可用性"""
    print("\n🔍 測試前端服務可用性...")
    
    try:
        frontend_response = requests.get(FRONTEND_URL, timeout=5)
        
        if frontend_response.status_code == 200:
            print("✅ 前端服務正在運行")
            return True
        else:
            print(f"❌ 前端服務異常: {frontend_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 前端服務測試失敗: {e}")
        return False

def test_donation_types():
    """測試不同贊助類型"""
    print("\n🔍 測試不同贊助類型...")
    
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
        
        # 獲取需求 ID
        needs_response = requests.get(
            f"{BASE_URL}/company_needs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if needs_response.status_code != 200:
            print(f"❌ 獲取需求列表失敗: {needs_response.status_code}")
            return False
        
        needs = needs_response.json()
        if len(needs) < 2:
            print("❌ 需要至少2個需求來測試")
            return False
        
        # 測試不同贊助類型
        donation_types = [
            {"donation_type": "經費", "description": "經費贊助測試"},
            {"donation_type": "物資", "description": "物資捐贈測試"},
            {"donation_type": "師資", "description": "師資支援測試"}
        ]
        
        success_count = 0
        for i, donation_data in enumerate(donation_types):
            if i >= len(needs):
                break
                
            need_id = needs[i]["id"]
            
            sponsor_response = requests.post(
                f"{BASE_URL}/sponsor_need/{need_id}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json=donation_data,
                timeout=10
            )
            
            if sponsor_response.status_code == 201:
                print(f"✅ {donation_data['donation_type']} 贊助成功")
                success_count += 1
            else:
                print(f"❌ {donation_data['donation_type']} 贊助失敗: {sponsor_response.status_code}")
        
        if success_count == len(donation_types):
            print(f"✅ 所有贊助類型測試通過 ({success_count}/{len(donation_types)})")
            return True
        else:
            print(f"⚠️  部分贊助類型測試失敗 ({success_count}/{len(donation_types)})")
            return False
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🎯 測試贊助專案功能")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 4
    
    # 測試1: 贊助 API 功能
    if test_sponsor_api():
        tests_passed += 1
    
    # 測試2: 贊助驗證功能
    if test_sponsor_validation():
        tests_passed += 1
    
    # 測試3: 前端服務可用性
    if test_frontend_availability():
        tests_passed += 1
    
    # 測試4: 不同贊助類型
    if test_donation_types():
        tests_passed += 1
    
    # 測試結果總結
    print("\n" + "=" * 60)
    print("📊 測試結果總結")
    print(f"✅ 通過測試: {tests_passed}/{total_tests}")
    print(f"❌ 失敗測試: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有測試通過！贊助專案功能完全正常")
        print("\n🔧 功能總結:")
        print("  ✅ 企業用戶可以贊助專案")
        print("  ✅ 贊助驗證功能正常")
        print("  ✅ 支持多種贊助類型")
        print("  ✅ 前端服務正常運行")
        
        print("\n🌐 使用方式:")
        print("  1. 打開瀏覽器訪問 http://localhost:5173")
        print("  2. 使用模擬企業帳號登入")
        print("  3. 進入企業儀表板或需求詳情頁面")
        print("  4. 點擊「贊助此專案」按鈕")
        print("  5. 填寫贊助資訊並確認")
        
        print("\n🎊 現在企業用戶可以完整地贊助專案了！")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

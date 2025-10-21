#!/usr/bin/env python3
"""
測試加入計劃功能
驗證企業用戶可以將需求加入到計劃中
"""

import requests
import json

# 測試配置
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

def test_add_to_plan_api():
    """測試加入計劃 API 功能"""
    print("🔍 測試加入計劃 API 功能...")
    
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
        
        # 測試加入計劃 API
        plan_data = {
            "donation_type": "經費",
            "description": "加入計劃測試"
        }
        
        add_plan_response = requests.post(
            f"{BASE_URL}/sponsor_need/{need_id}",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=plan_data,
            timeout=10
        )
        
        if add_plan_response.status_code != 201:
            print(f"❌ 加入計劃失敗: {add_plan_response.status_code}")
            print(f"錯誤詳情: {add_plan_response.text}")
            return False
        
        plan_result = add_plan_response.json()
        print(f"✅ 加入計劃成功！計劃 ID: {plan_result['id']}")
        print(f"   - 計劃類型: {plan_result['donation_type']}")
        print(f"   - 計劃說明: {plan_result['description']}")
        print(f"   - 狀態: {plan_result['status']}")
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_plan_validation():
    """測試計劃驗證功能"""
    print("\n🔍 測試計劃驗證功能...")
    
    try:
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
        
        school_plan_response = requests.post(
            f"{BASE_URL}/sponsor_need/test-id",
            headers={
                "Authorization": f"Bearer {school_token}",
                "Content-Type": "application/json"
            },
            json={"donation_type": "經費", "description": "測試"},
            timeout=10
        )
        
        if school_plan_response.status_code == 403:
            print("✅ 學校用戶被正確拒絕加入計劃")
        else:
            print(f"❌ 學校用戶應該被拒絕加入計劃，但得到: {school_plan_response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_plan_types():
    """測試不同計劃類型"""
    print("\n🔍 測試不同計劃類型...")
    
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
        
        # 獲取需求列表
        needs_response = requests.get(
            f"{BASE_URL}/company_needs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if needs_response.status_code != 200:
            print(f"❌ 獲取需求列表失敗: {needs_response.status_code}")
            return False
        
        needs = needs_response.json()
        if len(needs) < 3:
            print("❌ 需要至少3個需求來測試")
            return False
        
        # 測試不同計劃類型
        plan_types = [
            {"donation_type": "經費", "description": "經費計劃測試"},
            {"donation_type": "物資", "description": "物資計劃測試"},
            {"donation_type": "師資", "description": "師資計劃測試"}
        ]
        
        success_count = 0
        for i, plan_data in enumerate(plan_types):
            if i >= len(needs):
                break
                
            need_id = needs[i]["id"]
            
            add_plan_response = requests.post(
                f"{BASE_URL}/sponsor_need/{need_id}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json=plan_data,
                timeout=10
            )
            
            if add_plan_response.status_code == 201:
                print(f"✅ {plan_data['donation_type']} 計劃成功")
                success_count += 1
            else:
                print(f"❌ {plan_data['donation_type']} 計劃失敗: {add_plan_response.status_code}")
        
        if success_count == len(plan_types):
            print(f"✅ 所有計劃類型測試通過 ({success_count}/{len(plan_types)})")
            return True
        else:
            print(f"⚠️  部分計劃類型測試失敗 ({success_count}/{len(plan_types)})")
            return False
        
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

def main():
    """主測試函數"""
    print("🎯 測試加入計劃功能")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 4
    
    # 測試1: 加入計劃 API 功能
    if test_add_to_plan_api():
        tests_passed += 1
    
    # 測試2: 計劃驗證功能
    if test_plan_validation():
        tests_passed += 1
    
    # 測試3: 不同計劃類型
    if test_plan_types():
        tests_passed += 1
    
    # 測試4: 前端服務可用性
    if test_frontend_availability():
        tests_passed += 1
    
    # 測試結果總結
    print("\n" + "=" * 60)
    print("📊 測試結果總結")
    print(f"✅ 通過測試: {tests_passed}/{total_tests}")
    print(f"❌ 失敗測試: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有測試通過！加入計劃功能完全正常")
        print("\n🔧 功能總結:")
        print("  ✅ 企業用戶可以加入計劃")
        print("  ✅ 計劃驗證功能正常")
        print("  ✅ 支持多種計劃類型")
        print("  ✅ 前端服務正常運行")
        
        print("\n🌐 使用方式:")
        print("  1. 打開瀏覽器訪問 http://localhost:5173")
        print("  2. 使用模擬企業帳號登入")
        print("  3. 在需求卡片或詳情頁面點擊「加入計劃」")
        print("  4. 選擇計劃類型和填寫說明")
        print("  5. 確認後可在「我的捐贈」中查看")
        
        print("\n🎊 現在企業用戶可以將需求加入到計劃中了！")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

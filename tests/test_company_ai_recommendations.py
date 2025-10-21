#!/usr/bin/env python3
"""
測試企業儀表板 AI 推薦功能
驗證企業用戶在儀表板中可以看到模擬需求的推薦
"""

import requests
import json

# 測試配置
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

def test_company_ai_recommendations():
    """測試企業 AI 推薦功能"""
    print("🔍 測試企業 AI 推薦功能...")
    
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
        
        # 測試企業 AI 推薦端點
        ai_recommendations_response = requests.get(
            f"{BASE_URL}/company_ai_recommended_needs",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if ai_recommendations_response.status_code != 200:
            print(f"❌ 獲取企業 AI 推薦失敗: {ai_recommendations_response.status_code}")
            return False
        
        ai_recommendations = ai_recommendations_response.json()
        print(f"✅ 企業 AI 推薦返回 {len(ai_recommendations)} 個需求")
        
        # 檢查是否包含模擬學校的需求
        demo_school_ids = [
            "3bdb0ba3-d07c-4d7a-9503-2e31b759ba77",  # 台東縣太麻里國小（演示）
            "06a977b8-b26e-4c6d-9292-03d92fa9c21a",  # 台北市立建國中學（演示）
        ]
        
        demo_needs_in_ai_recommendations = [
            need for need in ai_recommendations 
            if need.get('school_id') in demo_school_ids
        ]
        
        if demo_needs_in_ai_recommendations:
            print(f"✅ 企業 AI 推薦包含 {len(demo_needs_in_ai_recommendations)} 個模擬學校需求")
            return True
        else:
            print("❌ 企業 AI 推薦不包含模擬學校需求")
            return False
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_public_ai_recommendations_exclude_demo():
    """測試公開 AI 推薦排除模擬需求"""
    print("\n🔍 測試公開 AI 推薦排除模擬需求...")
    
    try:
        # 獲取公開 AI 推薦（不需要認證）
        public_ai_response = requests.get(f"{BASE_URL}/ai_recommended_needs", timeout=10)
        
        if public_ai_response.status_code != 200:
            print(f"❌ 獲取公開 AI 推薦失敗: {public_ai_response.status_code}")
            return False
        
        public_ai_recommendations = public_ai_response.json()
        print(f"✅ 公開 AI 推薦包含 {len(public_ai_recommendations)} 個需求")
        
        # 檢查是否包含模擬學校的需求
        demo_school_ids = [
            "3bdb0ba3-d07c-4d7a-9503-2e31b759ba77",  # 台東縣太麻里國小（演示）
            "06a977b8-b26e-4c6d-9292-03d92fa9c21a",  # 台北市立建國中學（演示）
        ]
        
        demo_needs_in_public_ai = [
            need for need in public_ai_recommendations 
            if need.get('school_id') in demo_school_ids
        ]
        
        if demo_needs_in_public_ai:
            print(f"❌ 公開 AI 推薦包含 {len(demo_needs_in_public_ai)} 個模擬需求")
            return False
        else:
            print("✅ 公開 AI 推薦正確排除模擬需求")
            return True
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_company_dashboard_stats():
    """測試企業儀表板統計"""
    print("\n🔍 測試企業儀表板統計...")
    
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
        
        # 測試企業儀表板統計
        dashboard_stats_response = requests.get(
            f"{BASE_URL}/company_dashboard_stats",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if dashboard_stats_response.status_code != 200:
            print(f"❌ 獲取企業儀表板統計失敗: {dashboard_stats_response.status_code}")
            return False
        
        dashboard_stats = dashboard_stats_response.json()
        print(f"✅ 企業儀表板統計獲取成功")
        print(f"   - 完成專案: {dashboard_stats.get('completedProjects', 0)}")
        print(f"   - 幫助學生: {dashboard_stats.get('studentsHelped', 0)}")
        print(f"   - 總捐贈: {dashboard_stats.get('totalDonation', 0)}")
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        return False

def test_frontend_company_dashboard():
    """測試前端企業儀表板可用性"""
    print("\n🔍 測試前端企業儀表板可用性...")
    
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
        print(f"❌ 前端服務測試失敗: {e}")
        return False

def main():
    """主測試函數"""
    print("🎯 測試企業儀表板 AI 推薦功能")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 4
    
    # 測試1: 企業 AI 推薦功能
    if test_company_ai_recommendations():
        tests_passed += 1
    
    # 測試2: 公開 AI 推薦過濾
    if test_public_ai_recommendations_exclude_demo():
        tests_passed += 1
    
    # 測試3: 企業儀表板統計
    if test_company_dashboard_stats():
        tests_passed += 1
    
    # 測試4: 前端服務可用性
    if test_frontend_company_dashboard():
        tests_passed += 1
    
    # 測試結果總結
    print("\n" + "=" * 60)
    print("📊 測試結果總結")
    print(f"✅ 通過測試: {tests_passed}/{total_tests}")
    print(f"❌ 失敗測試: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 所有測試通過！企業儀表板 AI 推薦功能完全正常")
        print("\n🔧 功能總結:")
        print("  ✅ 企業 AI 推薦包含模擬需求")
        print("  ✅ 公開 AI 推薦正確過濾模擬需求")
        print("  ✅ 企業儀表板統計正常")
        print("  ✅ 前端服務正常運行")
        
        print("\n🌐 使用方式:")
        print("  1. 打開瀏覽器訪問 http://localhost:5173")
        print("  2. 使用模擬企業帳號登入")
        print("  3. 進入企業儀表板")
        print("  4. 查看「AI 智慧推薦專案」部分")
        print("  5. 看到所有需求（包括模擬需求）的推薦")
        
        print("\n🎊 現在企業儀表板的 AI 推薦功能可以完整地顯示模擬需求了！")
        return True
    else:
        print("⚠️  部分測試失敗，請檢查系統配置")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

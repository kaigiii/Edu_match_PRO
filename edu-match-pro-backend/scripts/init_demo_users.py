#!/usr/bin/env python3
"""
初始化模擬用戶腳本
創建安全的演示用戶帳號
"""

import asyncio
import os
import sys
from datetime import datetime

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 使用現有的 PostgreSQL 資料庫配置
# 確保 DATABASE_URL 環境變量已設置為 PostgreSQL 連接

from app.db import get_session
from app.crud.demo_user_crud import create_demo_user


async def init_demo_users():
    """初始化模擬用戶"""
    print("🚀 開始初始化模擬用戶...")
    
    # 模擬用戶配置
    demo_users = [
        {
            "email": "demo.school@edu.tw",
            "password": "demo_school_2024",  # 更安全的密碼
            "role": "school",
            "display_name": "台北市立建國中學（演示）",
            "description": "演示用學校帳號，展示學校端功能",
            "profile": {
                "organization_name": "台北市立建國中學（演示）",
                "contact_person": "張校長",
                "position": "校長",
                "phone": "02-2507-2626",
                "address": "台北市中山區建國北路一段66號",
                "bio": "演示用學校帳號，用於展示教育資源匹配平台功能"
            }
        },
        {
            "email": "demo.company@tech.com",
            "password": "demo_company_2024",  # 更安全的密碼
            "role": "company",
            "display_name": "科技創新股份有限公司（演示）",
            "description": "演示用企業帳號，展示企業端功能",
            "profile": {
                "organization_name": "科技創新股份有限公司（演示）",
                "contact_person": "李執行長",
                "position": "執行長",
                "phone": "02-2345-6789",
                "address": "台北市信義區信義路五段7號",
                "bio": "演示用企業帳號，專注於教育科技創新，致力於縮小數位落差"
            }
        },
        {
            "email": "demo.rural.school@edu.tw",
            "password": "demo_rural_2024",
            "role": "school",
            "display_name": "台東縣太麻里國小（演示）",
            "description": "演示用偏鄉學校帳號",
            "profile": {
                "organization_name": "台東縣太麻里國小（演示）",
                "contact_person": "王校長",
                "position": "校長",
                "phone": "089-781-123",
                "address": "台東縣太麻里鄉太麻里村123號",
                "bio": "演示用偏鄉學校帳號，展示偏鄉教育資源需求"
            }
        }
    ]
    
    async for session in get_session():
        try:
            created_count = 0
            for user_data in demo_users:
                try:
                    await create_demo_user(
                        session=session,
                        email=user_data["email"],
                        password=user_data["password"],
                        role=user_data["role"],
                        display_name=user_data["display_name"],
                        description=user_data["description"],
                        profile_data=user_data["profile"]
                    )
                    created_count += 1
                    print(f"✅ 創建模擬用戶: {user_data['email']} ({user_data['role']})")
                    
                except ValueError as e:
                    if "already exists" in str(e):
                        print(f"⚠️  模擬用戶已存在: {user_data['email']}")
                    else:
                        print(f"❌ 創建模擬用戶失敗: {user_data['email']} - {e}")
                        
            print(f"\n🎉 模擬用戶初始化完成！共創建/更新 {created_count} 個帳號")
            print("\n📋 模擬用戶列表:")
            print("學校端:")
            print("  - demo.school@edu.tw / demo_school_2024")
            print("  - demo.rural.school@edu.tw / demo_rural_2024")
            print("企業端:")
            print("  - demo.company@tech.com / demo_company_2024")
            print("\n🔒 安全提醒:")
            print("- 這些是演示專用帳號，請勿在生產環境使用")
            print("- 密碼已加密存儲，但建議定期更換")
            print("- 可通過管理後台停用或刪除這些帳號")
            
        except Exception as e:
            print(f"❌ 初始化失敗: {e}")
        finally:
            break


if __name__ == "__main__":
    asyncio.run(init_demo_users())

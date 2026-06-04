#!/usr/bin/env python3
"""
一鍵重建 Demo 資料（完全整合版）
自動處理所有依賴，包括 demo 用戶的初始化

支援兩種模式：
1. 分配現有資料 (--assign)：快速分配資料庫中的現有 needs 和 donations
2. 創建新資料 (--generate)：使用模板創建豐富的演示資料（默認）

使用方式：
    python rebuild_demo_data.py              # 創建新資料（推薦）
    python rebuild_demo_data.py --assign     # 分配現有資料（快速）
    python rebuild_demo_data.py --generate   # 明確指定創建新資料
    python rebuild_demo_data.py --init-only  # 僅初始化 demo_users 表
"""

import asyncio
import os
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path
import random

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.db import async_session_local
from app.models import Need, Donation, DonationStatus, NeedStatus, UrgencyLevel
from app.models.impact_story import ImpactStory
from app.crud.user_crud import get_user_by_email
from app.core.security import get_password_hash


# ============================================================================
# 需求資料模板
# ============================================================================
NEED_TEMPLATES = [
    {
        "title": "數位設備需求",
        "description": "學校需要平板電腦和數位白板來提升教學品質，讓學生能夠接觸到最新的數位學習資源。目前只有3台老舊電腦，無法滿足全班30位學生的需求。",
        "category": "數位設備",
        "location": "台東縣太麻里鄉",
        "student_count": 120,
        "urgency": UrgencyLevel.high,
        "sdgs": [4, 9, 10],
        "image_url": "/images/impact-stories/background-wall/01.jpg"
    },
    {
        "title": "圖書資源擴充",
        "description": "圖書館需要更多中英文圖書和數位資源，特別是科學和文學類書籍，以豐富學生的閱讀體驗。現有藏書多數已破損老舊，亟需更新。",
        "category": "圖書資源",
        "location": "花蓮縣秀林鄉",
        "student_count": 85,
        "urgency": UrgencyLevel.medium,
        "sdgs": [4, 10],
        "image_url": "/images/impact-stories/background-wall/05.jpg"
    },
    {
        "title": "體育器材更新",
        "description": "體育課需要新的球類器材 and 運動設備，包括籃球、足球、羽球等，讓學生能夠安全地進行體育活動。現有器材已使用超過10年，存在安全隱憂。",
        "category": "體育器材",
        "location": "台北市中山區",
        "student_count": 200,
        "urgency": UrgencyLevel.medium,
        "sdgs": [3, 4],
        "image_url": "/images/impact-stories/background-wall/09.jpg"
    },
    {
        "title": "音樂教室設備",
        "description": "音樂教室需要樂器和音響設備，包括鋼琴、吉他、小提琴等，讓學生能夠學習音樂和表演藝術。希望能培養孩子們的藝術素養。",
        "category": "音樂設備",
        "location": "台東縣太麻里鄉",
        "student_count": 60,
        "urgency": UrgencyLevel.low,
        "sdgs": [4, 10],
        "image_url": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae"
    },
    {
        "title": "科學實驗室設備",
        "description": "需要更新化學實驗室的器材和設備，確保實驗安全並提升教學品質。包括顯微鏡、燒杯、試管等基本器材。",
        "category": "實驗設備",
        "location": "花蓮縣秀林鄉",
        "student_count": 95,
        "urgency": UrgencyLevel.high,
        "sdgs": [4, 9],
        "image_url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d"
    },
    {
        "title": "英語學習資源",
        "description": "需要英語學習軟體、有聲書和互動教材，提升學生的英語能力和國際視野。希望引進線上學習平台。",
        "category": "語言學習",
        "location": "宜蘭縣大同鄉",
        "student_count": 45,
        "urgency": UrgencyLevel.medium,
        "sdgs": [4, 8, 10],
        "image_url": "https://images.unsplash.com/photo-1513258496099-48168024aec0"
    },
    {
        "title": "環保教育設備",
        "description": "打造綠色教室，需要節能燈具、回收設備和環保教材，培養學生的永續發展意識。",
        "category": "環保教育",
        "location": "新竹縣尖石鄉",
        "student_count": 50,
        "urgency": UrgencyLevel.low,
        "sdgs": [4, 13, 15],
        "image_url": "https://images.unsplash.com/photo-1502082553048-f009c37129b9"
    },
    {
        "title": "農業科技設備",
        "description": "需要 IoT 感測器、樹莓派等設備來監測校園菜園，培養學生的科學精神和責任感。",
        "category": "STEM教育",
        "location": "苗栗縣泰安鄉",
        "student_count": 38,
        "urgency": UrgencyLevel.medium,
        "sdgs": [2, 4, 9],
        "image_url": "https://images.unsplash.com/photo-1492496913980-501348b61469"
    }
]


# ============================================================================
# 捐贈資料模板
# ============================================================================
DONATION_TEMPLATES = [
    {
        "donation_type": "平板電腦 20 台",
        "description": "捐贈全新 iPad 平板電腦，配備教育軟體，支援數位學習",
        "status": DonationStatus.completed,
        "progress": 100
    },
    {
        "donation_type": "圖書 500 冊",
        "description": "捐贈中英文圖書，涵蓋科學、文學、歷史等各領域",
        "status": DonationStatus.completed,
        "progress": 100
    },
    {
        "donation_type": "體育器材套組",
        "description": "捐贈籃球、足球、羽球等體育器材，提升學生運動品質",
        "status": DonationStatus.completed,
        "progress": 100
    },
    {
        "donation_type": "樂器組合",
        "description": "捐贈鍵盤、吉他、小提琴等樂器，豐富音樂教育資源",
        "status": DonationStatus.in_progress,
        "progress": 60
    },
    {
        "donation_type": "實驗器材",
        "description": "捐贈顯微鏡、實驗用具等科學設備，提升實驗教學品質",
        "status": DonationStatus.in_progress,
        "progress": 75
    },
    {
        "donation_type": "線上英語課程",
        "description": "提供一年期線上英語學習平台授權，含外師視訊課程",
        "status": DonationStatus.approved,
        "progress": 30
    },
    {
        "donation_type": "節能環保設備",
        "description": "捐贈LED燈具、太陽能板等環保設備，建立綠色校園",
        "status": DonationStatus.approved,
        "progress": 20
    },
    {
        "donation_type": "智慧農場套組",
        "description": "提供IoT感測器、樹莓派等設備，打造智慧農場教學環境",
        "status": DonationStatus.approved,
        "progress": 15
    }
]


# ============================================================================
# 影響力故事模板
# ============================================================================
IMPACT_STORY_TEMPLATES = [
    {
        "title": "數位教育改變偏鄉學童未來",
        "content": """透過平板電腦的捐贈，太麻里國小的學生們現在能夠接觸到最新的數位學習資源。

老師反饋：「孩子們的學習興趣明顯提升，特別是在數學和自然科學領域。透過互動式教材，原本較難理解的概念變得生動有趣。」

學生小明說：「我現在可以用平板查資料、做作業，還能看英文動畫學英文，真的很開心！」

這個專案不僅提供了硬體設備，還包含了教師培訓和數位教材，確保設備能被有效運用。經過3個月的使用，學生的數位素養測驗平均分數提升了35%，學習動機也顯著增加。

家長們也很支持這個計畫，許多家長表示孩子回家後會主動複習，學習態度變得更積極。""",
        "image_url": "/images/impact-stories/background-wall/01.jpg",
        "video_url": None,
        "impact_metrics": {
            "students_benefited": 120,
            "equipment_donated": "平板電腦 20 台",
            "duration": "3 個月",
            "improvement_rate": "80%",
            "teacher_satisfaction": "95%"
        }
    },
    {
        "title": "圖書資源豐富學子心靈",
        "content": """秀林國中的圖書館因為新捐贈的圖書而煥然一新。

圖書館員表示：「這批書籍不僅數量多，品質也很好。涵蓋了科學、文學、歷史等各個領域，特別是有很多學生喜歡的科普讀物。」

學生小華分享：「以前圖書館的書都很舊，現在有好多新書可以看，我最喜歡科學類的書，讓我對未來更有夢想！」

自從新書上架後，圖書館的借閱率增加了150%，許多學生養成了每週至少借一本書的習慣。學校也配合舉辦讀書會和閱讀競賽，營造濃厚的閱讀氛圍。

老師發現學生的寫作能力和表達能力都有明顯進步，這證明了閱讀對學習的重要性。""",
        "image_url": "/images/impact-stories/background-wall/05.jpg",
        "video_url": None,
        "impact_metrics": {
            "students_benefited": 85,
            "books_donated": "500 冊",
            "reading_increase": "150%",
            "duration": "6 個月",
            "satisfaction_rate": "92%"
        }
    },
    {
        "title": "體育器材讓孩子愛上運動",
        "content": """建國中學收到新的體育器材後，學生們的運動熱情被點燃了。

體育老師說：「新的器材不僅安全，而且品質很好。學生們上體育課的積極性明顯提高，運動傷害也減少了。」

學生小杰興奮地說：「新的籃球很好打，足球也很標準，我們現在每天都想打球！」

學校成立了多支運動社團，包括籃球隊、足球隊、羽球隊等。在最近的區域運動會上，學校獲得了多個獎項，這讓學生們更有信心。

家長們也注意到孩子的體能和團隊合作能力都有所提升，這是意外的收穫。""",
        "image_url": "/images/impact-stories/background-wall/09.jpg",
        "video_url": None,
        "impact_metrics": {
            "students_benefited": 200,
            "equipment_donated": "體育器材套組",
            "participation_increase": "85%",
            "duration": "4 個月",
            "awards": "區域運動會 3 金 2 銀"
        }
    }
]


# ============================================================================
# Demo Users 初始化資料
# ============================================================================
DEMO_USERS_CONFIG = [
    {
        "email": "demo.school@edu.tw",
        "password": "demo_school_2024",
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
        "password": "demo_company_2024",
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


async def check_demo_users_table(engine):
    """檢查 user 表中是否有 demo 資料"""
    async with engine.begin() as conn:
        try:
            result = await conn.execute(text('SELECT COUNT(*) FROM "user" WHERE is_demo = true'))
            count = result.scalar()
            return count > 0
        except Exception as e:
            print(f"  ⚠️  demo 用戶檢查失敗: {e}")
            return False


async def init_demo_users_table(engine):
    """直接在 user 和 profile 表中初始化 demo 資料"""
    print("📋 步驟 0: 直接初始化 demo 用戶")
    print("-" * 70)
    
    async with engine.begin() as conn:
        created_count = 0
        for user_data in DEMO_USERS_CONFIG:
            try:
                # 檢查用戶是否已存在
                result = await conn.execute(text('SELECT id FROM "user" WHERE email = :email'), {"email": user_data["email"]})
                existing_user = result.fetchone()
                if existing_user:
                    user_id = str(existing_user[0])
                    # 清理該用戶關聯的所有資料
                    await conn.execute(text('DELETE FROM impact_story WHERE donation_id IN (SELECT id FROM donation WHERE company_id = :user_id)'), {"user_id": user_id})
                    await conn.execute(text('DELETE FROM donation WHERE company_id = :user_id OR need_id IN (SELECT id FROM need WHERE school_id = :user_id)'), {"user_id": user_id})
                    await conn.execute(text('DELETE FROM need WHERE school_id = :user_id'), {"user_id": user_id})
                    await conn.execute(text('DELETE FROM profile WHERE user_id = :user_id'), {"user_id": user_id})
                    await conn.execute(text('DELETE FROM "user" WHERE id = :user_id'), {"user_id": user_id})
                
                # 插入 user
                result = await conn.execute(text("""
                    INSERT INTO "user" (
                        id, created_at, updated_at, email, password, role,
                        is_demo, display_name, description, is_active
                    ) VALUES (
                        gen_random_uuid(), NOW(), NOW(), :email, :password, CAST(:role AS userrole),
                        true, :display_name, :description, true
                    ) RETURNING id
                """), {
                    "email": user_data["email"],
                    "password": get_password_hash(user_data["password"]),
                    "role": user_data["role"],
                    "display_name": user_data["display_name"],
                    "description": user_data.get("description", "")
                })
                
                user_id = result.fetchone()[0]
                
                # 插入 profile
                if user_data.get("profile"):
                    profile = user_data["profile"]
                    await conn.execute(text("""
                        INSERT INTO profile (
                            id, created_at, updated_at, user_id,
                            organization_name, contact_person, position,
                            phone, address, bio
                        ) VALUES (
                            gen_random_uuid(), NOW(), NOW(), :user_id,
                            :organization_name, :contact_person, :position,
                            :phone, :address, :bio
                        )
                    """), {
                        "user_id": str(user_id),
                        "organization_name": profile.get("organization_name"),
                        "contact_person": profile.get("contact_person"),
                        "position": profile.get("position"),
                        "phone": profile.get("phone"),
                        "address": profile.get("address"),
                        "bio": profile.get("bio")
                    })
                
                created_count += 1
                print(f"  ✅ 創建 demo 用戶: {user_data['email']} ({user_data['role']})")
                
            except Exception as e:
                print(f"  ❌ 創建失敗: {user_data['email']} - {e}")
                raise e
        
        print(f"\n  總共創建了 {created_count} 個 demo 用戶")
    print()


async def clean_demo_data(engine):
    """步驟 1: 清理現有 demo 資料"""
    print("📋 步驟 1: 清理現有 demo 用戶資料")
    print("-" * 70)
    
    async with engine.begin() as conn:
        # 找出現有的 demo 用戶 ID
        result = await conn.execute(text('SELECT id FROM "user" WHERE is_demo = true'))
        existing_demo_ids = [str(row[0]) for row in result]
        
        if existing_demo_ids:
            print(f"  找到 {len(existing_demo_ids)} 個現有 demo 用戶")
            
            # 找一個非 demo 的學校和企業用戶作為臨時接收者
            result = await conn.execute(text("""
                SELECT id FROM "user" 
                WHERE role = 'school' AND is_demo = false
                LIMIT 1
            """))
            temp_school = result.scalar()
            
            result = await conn.execute(text("""
                SELECT id FROM "user" 
                WHERE role = 'company' AND is_demo = false
                LIMIT 1
            """))
            temp_company = result.scalar()
            
            # 刪除 impact_story
            result = await conn.execute(text("""
                DELETE FROM impact_story 
                WHERE donation_id IN (
                    SELECT id FROM donation 
                    WHERE company_id = ANY(:user_ids)
                )
            """), {"user_ids": existing_demo_ids})
            if result.rowcount > 0:
                print(f"  ✅ 刪除了 {result.rowcount} 個 impact_stories")
            
            # 重新分配或刪除 needs 和 donations
            for demo_id in existing_demo_ids:
                if temp_school:
                    result = await conn.execute(text("""
                        UPDATE need SET school_id = :new_id WHERE school_id = :old_id
                    """), {'new_id': str(temp_school), 'old_id': demo_id})
                    if result.rowcount > 0:
                        print(f"  ✅ 重新分配了 {result.rowcount} 個 needs")
                else:
                    result = await conn.execute(text("""
                        DELETE FROM need WHERE school_id = :old_id
                    """), {'old_id': demo_id})
                    if result.rowcount > 0:
                        print(f"  ✅ 刪除了 {result.rowcount} 個 needs")
                
                if temp_company:
                    result = await conn.execute(text("""
                        UPDATE donation SET company_id = :new_id WHERE company_id = :old_id
                    """), {'new_id': str(temp_company), 'old_id': demo_id})
                    if result.rowcount > 0:
                        print(f"  ✅ 重新分配了 {result.rowcount} 個 donations")
                else:
                    result = await conn.execute(text("""
                        DELETE FROM donation WHERE company_id = :old_id
                    """), {'old_id': demo_id})
                    if result.rowcount > 0:
                        print(f"  ✅ 刪除了 {result.rowcount} 個 donations")
            
            # 刪除 profiles
            result = await conn.execute(text('DELETE FROM profile WHERE user_id = ANY(:user_ids)'), {"user_ids": existing_demo_ids})
            print(f"  ✅ 刪除了 {result.rowcount} 個 profiles")
            
            # 刪除用戶
            result = await conn.execute(text('DELETE FROM "user" WHERE id = ANY(:user_ids)'), {"user_ids": existing_demo_ids})
            print(f"  ✅ 刪除了 {result.rowcount} 個用戶")
        else:
            print("  ℹ️  沒有找到現有 demo 用戶")
    
    print()


async def recreate_demo_users(engine):
    """步驟 2: 載入並返回現有 demo 用戶"""
    print("📋 步驟 2: 載入 demo 用戶")
    print("-" * 70)
    
    async with engine.begin() as conn:
        # 查詢 demo 用戶信息
        result = await conn.execute(text("""
            SELECT id, email, role, display_name
            FROM "user"
            WHERE is_demo = true
            ORDER BY role, email
        """))
        
        demo_users = {'school': [], 'company': []}
        print("\n  Demo 用戶列表:")
        for row in result:
            role_str = str(row[2].value if hasattr(row[2], 'value') else row[2])
            demo_users[role_str].append({
                'id': str(row[0]), 
                'email': row[1],
                'display_name': row[3]
            })
            print(f"    • {role_str}: {row[1]} ({row[3]})")
    
    print()
    return demo_users


async def sync_demo_profiles(engine):
    """步驟 3: 同步 demo profiles（已合併，此處為 no-op）"""
    pass


async def assign_existing_needs(engine, demo_users):
    """模式 A: 分配現有的 needs（快速）"""
    print("📋 步驟 4A: 分配現有 needs 給 demo 學校")
    print("-" * 70)
    
    async with engine.begin() as conn:
        for idx, user in enumerate(demo_users.get('school', [])):
            result = await conn.execute(text(f"""
                UPDATE need 
                SET school_id = :school_id
                WHERE id IN (
                    SELECT id FROM need 
                    WHERE school_id != :school_id
                    LIMIT 10 OFFSET {idx * 10}
                )
            """), {'school_id': user['id']})
            print(f"  ✅ {user['display_name']}: 分配了 {result.rowcount} 個 needs")
    
    print()


async def create_new_needs(demo_users):
    """模式 B: 創建新的 needs（豐富）"""
    print("📋 步驟 4B: 創建新 needs 給 demo 學校")
    print("-" * 70)
    
    async with async_session_local() as session:
        created_needs = []
        
        for i, user_info in enumerate(demo_users.get('school', [])):
            # 獲取完整的用戶對象
            user = await get_user_by_email(session, user_info['email'])
            if not user:
                continue
            
            # 每個學校分配 4 個需求
            school_needs = NEED_TEMPLATES[i*4:(i+1)*4]
            
            for need_template in school_needs:
                need = Need(
                    school_id=user.id,
                    title=need_template["title"],
                    description=need_template["description"],
                    category=need_template["category"],
                    location=need_template["location"],
                    student_count=need_template["student_count"],
                    urgency=need_template["urgency"],
                    sdgs=need_template["sdgs"],
                    image_url=need_template.get("image_url"),
                    status=NeedStatus.active
                )
                session.add(need)
                created_needs.append(need)
            
            await session.flush()
            print(f"  ✅ {user_info['display_name']}: 創建了 {len(school_needs)} 個 needs")
        
        await session.commit()
        
        # 刷新以獲取 ID
        for need in created_needs:
            await session.refresh(need)
        
        print(f"\n  總共創建了 {len(created_needs)} 個 needs")
    
    print()
    return created_needs


async def assign_existing_donations(engine, demo_users):
    """模式 A: 分配現有的 donations（快速）"""
    print("📋 步驟 5A: 分配現有 donations 給 demo 企業")
    print("-" * 70)
    
    async with engine.begin() as conn:
        for user in demo_users.get('company', []):
            # 分配 15 個 donations
            result = await conn.execute(text("""
                UPDATE donation 
                SET company_id = :company_id
                WHERE id IN (
                    SELECT id FROM donation 
                    WHERE company_id != :company_id
                    LIMIT 15
                )
            """), {'company_id': user['id']})
            print(f"  ✅ {user['display_name']}: 分配了 {result.rowcount} 個 donations")
            
            # 更新 5 個為 completed 狀態
            result = await conn.execute(text("""
                UPDATE donation 
                SET status = 'completed',
                    progress = 100,
                    completion_date = :completion_date
                WHERE company_id = :company_id
                AND status = 'pending'
                AND id IN (
                    SELECT id FROM donation 
                    WHERE company_id = :company_id
                    AND status = 'pending'
                    LIMIT 5
                )
            """), {
                'company_id': user['id'],
                'completion_date': datetime.now() - timedelta(days=10)
            })
            if result.rowcount > 0:
                print(f"  ✅ 設定了 {result.rowcount} 個 donations 為已完成")
            
            # 更新 3 個為 in_progress
            result = await conn.execute(text("""
                UPDATE donation 
                SET status = 'in_progress',
                    progress = 60
                WHERE company_id = :company_id
                AND status = 'pending'
                AND id IN (
                    SELECT id FROM donation 
                    WHERE company_id = :company_id
                    AND status = 'pending'
                    LIMIT 3
                )
            """), {'company_id': user['id']})
            if result.rowcount > 0:
                print(f"  ✅ 設定了 {result.rowcount} 個 donations 為進行中")
    
    print()


async def create_new_donations(demo_users, needs):
    """模式 B: 創建新的 donations 和 impact stories（豐富）"""
    print("📋 步驟 5B: 創建新 donations 給 demo 企業")
    print("-" * 70)
    
    async with async_session_local() as session:
        created_donations = []
        
        for user_info in demo_users.get('company', []):
            company = await get_user_by_email(session, user_info['email'])
            if not company:
                continue
            
            # 為前 8 個需求創建對應的捐贈
            for i, need in enumerate(needs[:8]):
                if i < len(DONATION_TEMPLATES):
                    template = DONATION_TEMPLATES[i]
                    
                    # 計算完成日期
                    completion_date = None
                    if template["status"] == DonationStatus.completed:
                        completion_date = datetime.utcnow() - timedelta(days=random.randint(30, 90))
                    
                    donation = Donation(
                        company_id=company.id,
                        need_id=need.id,
                        donation_type=template["donation_type"],
                        description=template["description"],
                        status=template["status"],
                        progress=template["progress"],
                        completion_date=completion_date
                    )
                    session.add(donation)
                    created_donations.append(donation)
                    
                    # 更新需求狀態
                    if template["status"] == DonationStatus.completed:
                        need.status = NeedStatus.completed
                    elif template["status"] in [DonationStatus.in_progress, DonationStatus.approved]:
                        need.status = NeedStatus.in_progress
            
            await session.flush()
            print(f"  ✅ {user_info['display_name']}: 創建了 {len(created_donations)} 個 donations")
        
        await session.commit()
        
        # 刷新以獲取 ID
        for donation in created_donations:
            await session.refresh(donation)
    
    print()
    
    # 創建 impact stories
    print("📋 步驟 5C: 創建 impact stories")
    print("-" * 70)
    
    async with async_session_local() as session:
        created_stories = []
        
        # 為已完成的捐贈創建影響故事
        completed_donations = [d for d in created_donations if d.status == DonationStatus.completed]
        
        for i, donation in enumerate(completed_donations[:3]):
            if i < len(IMPACT_STORY_TEMPLATES):
                template = IMPACT_STORY_TEMPLATES[i]
                
                story = ImpactStory(
                    donation_id=donation.id,
                    title=template["title"],
                    content=template["content"],
                    image_url=template.get("image_url"),
                    video_url=template.get("video_url"),
                    impact_metrics=str(template.get("impact_metrics", {}))
                )
                session.add(story)
                created_stories.append(story)
        
        await session.commit()
        print(f"  ✅ 創建了 {len(created_stories)} 個 impact stories")
    
    print()


async def verify_results(engine, demo_users):
    """步驟 6: 驗證結果"""
    print("📋 步驟 6: 驗證重建結果")
    print("-" * 70)
    
    async with engine.begin() as conn:
        # 驗證用戶 and profile
        result = await conn.execute(text("""
            SELECT 
                u.email,
                u.role,
                p.organization_name,
                CASE WHEN p.id IS NOT NULL THEN '✓' ELSE '✗' END as has_profile
            FROM "user" u
            LEFT JOIN profile p ON u.id = p.user_id
            WHERE u.is_demo = true
            ORDER BY u.role, u.email
        """))
        
        print("\n  用戶和 Profile 狀態:")
        for row in result:
            print(f"    {row[3]} {row[0]} ({row[1]})")
            if row[2]:
                print(f"       組織: {row[2]}")
        
        # 驗證 needs 分配
        print("\n  Needs 分配統計:")
        for user in demo_users.get('school', []):
            result = await conn.execute(text("""
                SELECT COUNT(*) FROM need WHERE school_id = :user_id
            """), {'user_id': user['id']})
            count = result.scalar()
            print(f"    • {user['display_name']}: {count} 個 needs")
        
        # 驗證 donations 分配
        print("\n  Donations 分配統計:")
        for user in demo_users.get('company', []):
            result = await conn.execute(text("""
                SELECT 
                    status,
                    COUNT(*) as count
                FROM donation 
                WHERE company_id = :user_id
                GROUP BY status
                ORDER BY status
            """), {'user_id': user['id']})
            print(f"    • {user['display_name']}:")
            for row in result:
                status_str = str(row[0].value if hasattr(row[0], 'value') else row[0])
                print(f"       - {status_str}: {row[1]} 筆")
        
        # 驗證 impact stories
        result = await conn.execute(text("""
            SELECT COUNT(*) 
            FROM impact_story i
            JOIN donation d ON i.donation_id = d.id
            JOIN "user" u ON d.company_id = u.id
            WHERE u.is_demo = true
        """))
        story_count = result.scalar()
        print(f"\n  Impact Stories: {story_count} 個")


async def rebuild_demo_data(mode='generate', init_only=False):
    """
    一鍵重建所有 demo 資料（完全自動化）
    
    Args:
        mode: 'assign' 或 'generate'
            - 'assign': 分配現有資料（快速）
            - 'generate': 創建新資料（豐富，推薦）
            - init_only: 僅初始化 demo 資料
    """
    engine = create_async_engine(settings.database_url)
    
    mode_name = "創建新資料" if mode == 'generate' else "分配現有資料"
    
    print("=" * 70)
    if init_only:
        print("🔧 初始化 demo 用戶")
    else:
        print(f"🔄 開始重建 Demo 資料 ({mode_name})")
    print("=" * 70)
    print()
    
    try:
        # 步驟 0: 檢查並初始化 demo 用戶
        has_demo_users = await check_demo_users_table(engine)
        
        if not has_demo_users or init_only:
            print("  ℹ️  demo 用戶未初始化或需要初始化")
            await init_demo_users_table(engine)
            
            if init_only:
                print()
                print("=" * 70)
                print("🎉 demo 用戶初始化完成！")
                print("=" * 70)
                print()
                print("📱 Demo 用戶帳號:")
                for user in DEMO_USERS_CONFIG:
                    print(f"  • {user['email']} / {user['password']}")
                print()
                return
        else:
            print("  ✓ demo 用戶已存在，跳過初始化")
            print()
        
        if not init_only:
            # 步驟 1: 清理
            await clean_demo_data(engine)
            
            # 步驟 2: 重建用戶
            await init_demo_users_table(engine)
            demo_users = await recreate_demo_users(engine)
            
            # 步驟 3: 同步 profiles
            await sync_demo_profiles(engine)
            
            # 步驟 4 & 5: 根據模式選擇不同的資料處理方式
            if mode == 'generate':
                # 模式 B: 創建新資料（豐富）
                needs = await create_new_needs(demo_users)
                await create_new_donations(demo_users, needs)
            else:
                # 模式 A: 分配現有資料（快速）
                await assign_existing_needs(engine, demo_users)
                await assign_existing_donations(engine, demo_users)
            
            # 步驟 6: 驗證
            await verify_results(engine, demo_users)
        
    finally:
        await engine.dispose()
    
    print()
    print("=" * 70)
    print("🎉 Demo 資料重建完成！")
    print("=" * 70)
    print()
    print("📱 測試帳號:")
    print("  學校 1: demo.school@edu.tw / demo_school_2024")
    print("  學校 2: demo.rural.school@edu.tw / demo_rural_2024")
    print("  企業:   demo.company@tech.com / demo_company_2024")
    print()
    print("💡 下一步:")
    print("  1. 刷新瀏覽器 (Cmd+Shift+R / Ctrl+Shift+R)")
    print("  2. 使用上述帳號登入測試")
    print("  3. 檢查儀表板資料是否正常顯示")
    print()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='一鍵重建 Demo 資料（完全自動化）',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用範例：
  python rebuild_demo_data.py              # 創建新資料（推薦）
  python rebuild_demo_data.py --assign     # 分配現有資料（快速）
  python rebuild_demo_data.py --init-only  # 僅初始化 demo_users 表
        """
    )
    parser.add_argument(
        '--assign', 
        action='store_true', 
        help='分配現有資料模式（快速）'
    )
    parser.add_argument(
        '--generate', 
        action='store_true', 
        help='創建新資料模式（豐富，推薦，默認）'
    )
    parser.add_argument(
        '--init-only',
        action='store_true',
        help='僅初始化 demo_users 表（不重建其他資料）'
    )
    
    args = parser.parse_args()
    
    # 決定模式
    if args.assign:
        mode = 'assign'
    else:
        mode = 'generate'  # 默認使用 generate 模式
    
    try:
        asyncio.run(rebuild_demo_data(mode=mode, init_only=args.init_only))
    except KeyboardInterrupt:
        print("\n\n⚠️  操作已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

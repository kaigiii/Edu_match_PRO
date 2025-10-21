#!/usr/bin/env python3
"""
初始化測試數據腳本
創建學校、企業用戶、需求、捐贈記錄和影響力故事
"""

import asyncio
import uuid
import os
import sys
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 設置數據庫 URL
os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///./edu_match_pro.db'

from app.db import get_session
from app.models.user import User, UserRole
from app.models.need import Need, UrgencyLevel, NeedStatus
from app.models.donation import Donation, DonationStatus
from app.models.impact_story import ImpactStory
from app.models.profile import Profile
from app.core.security import get_password_hash
from app.crud.user_crud import create_user
from app.crud.need_crud import create_need
from app.crud.donation_crud import create_donation
from app.schemas.user_schemas import UserCreate
from app.schemas.need_schemas import NeedCreate
from app.schemas.donation_schemas import DonationCreate


async def create_test_users(session: AsyncSession):
    """創建測試用戶"""
    print("創建測試用戶...")
    
    # 學校用戶
    school_users = [
        {
            "email": "taipei.school@edu.tw",
            "password": "school123",
            "role": UserRole.SCHOOL,
            "profile": {
                "name": "台北市立建國中學",
                "phone": "02-2507-2626",
                "address": "台北市中山區建國北路一段66號",
                "description": "台北市知名公立中學，致力於提供優質教育環境"
            }
        },
        {
            "email": "taitung.school@edu.tw", 
            "password": "school123",
            "role": UserRole.SCHOOL,
            "profile": {
                "name": "台東縣太麻里國小",
                "phone": "089-781-123",
                "address": "台東縣太麻里鄉太麻里村123號",
                "description": "偏鄉小學，需要更多教育資源支援"
            }
        },
        {
            "email": "hualien.school@edu.tw",
            "password": "school123", 
            "role": UserRole.SCHOOL,
            "profile": {
                "name": "花蓮縣秀林國中",
                "phone": "03-826-1234",
                "address": "花蓮縣秀林鄉秀林村456號",
                "description": "原住民地區國中，重視多元文化教育"
            }
        }
    ]
    
    # 企業用戶
    company_users = [
        {
            "email": "tech@company.com",
            "password": "company123",
            "role": UserRole.COMPANY,
            "profile": {
                "name": "科技創新股份有限公司",
                "phone": "02-2345-6789",
                "address": "台北市信義區信義路五段7號",
                "description": "專注於教育科技創新，致力於縮小數位落差"
            }
        },
        {
            "email": "foundation@charity.org",
            "password": "company123",
            "role": UserRole.COMPANY,
            "profile": {
                "name": "教育關懷基金會",
                "phone": "02-3456-7890",
                "address": "台北市大安區仁愛路四段300號",
                "description": "非營利組織，專注於偏鄉教育支援"
            }
        }
    ]
    
    created_users = []
    
    for user_data in school_users + company_users:
        try:
            user_create = UserCreate(
                email=user_data["email"],
                password=user_data["password"],
                role=user_data["role"]
            )
            user = await create_user(session, user_create)
            
            # 創建用戶檔案
            profile = Profile(
                user_id=user.id,
                organization_name=user_data["profile"]["name"],
                contact_person=user_data["profile"]["name"],
                position="校長" if user.role == UserRole.SCHOOL else "執行長",
                phone=user_data["profile"]["phone"],
                address=user_data["profile"]["address"],
                bio=user_data["profile"]["description"]
            )
            session.add(profile)
            created_users.append(user)
            print(f"✓ 創建用戶: {user.email} ({user.role})")
            
        except Exception as e:
            print(f"✗ 創建用戶失敗: {user_data['email']} - {e}")
    
    await session.commit()
    return created_users


async def create_test_needs(session: AsyncSession, school_users):
    """創建測試需求"""
    print("創建測試需求...")
    
    needs_data = [
        {
            "title": "數位設備需求",
            "description": "學校需要平板電腦和數位白板來提升教學品質，讓學生能夠接觸到最新的數位學習資源。",
            "category": "數位設備",
            "location": "台東縣太麻里鄉",
            "student_count": 120,
            "image_url": "/images/needs/tablet-need.jpg",
            "urgency": UrgencyLevel.high,
            "sdgs": [4, 10],  # 優質教育、減少不平等
            "status": NeedStatus.active
        },
        {
            "title": "圖書資源擴充",
            "description": "圖書館需要更多中英文圖書和數位資源，特別是科學和文學類書籍，以豐富學生的閱讀體驗。",
            "category": "圖書資源",
            "location": "花蓮縣秀林鄉",
            "student_count": 85,
            "image_url": "/images/needs/library-need.jpg",
            "urgency": UrgencyLevel.medium,
            "sdgs": [4],  # 優質教育
            "status": NeedStatus.active
        },
        {
            "title": "體育器材更新",
            "description": "體育課需要新的球類器材和運動設備，包括籃球、足球、羽球等，讓學生能夠安全地進行體育活動。",
            "category": "體育器材",
            "location": "台北市中山區",
            "student_count": 300,
            "image_url": "/images/needs/sports-need.jpg",
            "urgency": UrgencyLevel.low,
            "sdgs": [3, 4],  # 良好健康與福祉、優質教育
            "status": NeedStatus.active
        },
        {
            "title": "音樂教室設備",
            "description": "音樂教室需要樂器和音響設備，包括鋼琴、吉他、小提琴等，讓學生能夠學習音樂和表演藝術。",
            "category": "音樂設備",
            "location": "台東縣太麻里鄉",
            "student_count": 60,
            "image_url": "/images/needs/music-need.jpg",
            "urgency": UrgencyLevel.medium,
            "sdgs": [4],  # 優質教育
            "status": NeedStatus.in_progress
        }
    ]
    
    created_needs = []
    
    for i, need_data in enumerate(needs_data):
        try:
            # 輪流分配給不同學校
            school_user = school_users[i % len(school_users)]
            
            need_create = NeedCreate(
                title=need_data["title"],
                description=need_data["description"],
                category=need_data["category"],
                location=need_data["location"],
                student_count=need_data["student_count"],
                image_url=need_data["image_url"],
                urgency=need_data["urgency"],
                sdgs=need_data["sdgs"],
                status=need_data["status"]
            )
            
            need = await create_need(session, need_create, school_user.id)
            created_needs.append(need)
            print(f"✓ 創建需求: {need.title} (學校: {school_user.email})")
            
        except Exception as e:
            print(f"✗ 創建需求失敗: {need_data['title']} - {e}")
    
    await session.commit()
    return created_needs


async def create_test_donations(session: AsyncSession, company_users, needs):
    """創建測試捐贈記錄"""
    print("創建測試捐贈記錄...")
    
    donations_data = [
        {
            "donation_type": "平板電腦 20 台",
            "description": "捐贈全新 iPad 平板電腦，配備教育軟體，支援數位學習",
            "progress": 100,
            "status": DonationStatus.completed,
            "completion_date": datetime.now() - timedelta(days=30)
        },
        {
            "donation_type": "圖書 500 冊",
            "description": "捐贈中英文圖書，涵蓋科學、文學、歷史等各領域",
            "progress": 75,
            "status": DonationStatus.in_progress,
            "completion_date": None
        },
        {
            "donation_type": "體育器材套組",
            "description": "捐贈籃球、足球、羽球等體育器材，提升學生運動品質",
            "progress": 0,
            "status": DonationStatus.pending,
            "completion_date": None
        }
    ]
    
    created_donations = []
    
    for i, donation_data in enumerate(donations_data):
        try:
            # 輪流分配給不同企業和需求
            company_user = company_users[i % len(company_users)]
            need = needs[i % len(needs)]
            
            donation_create = DonationCreate(
                need_id=need.id,
                donation_type=donation_data["donation_type"],
                description=donation_data["description"]
            )
            
            donation = await create_donation(session, donation_create, company_user.id)
            created_donations.append(donation)
            print(f"✓ 創建捐贈: {donation.donation_type} (企業: {company_user.email})")
            
        except Exception as e:
            print(f"✗ 創建捐贈失敗: {donation_data['donation_type']} - {e}")
    
    await session.commit()
    return created_donations


async def create_test_impact_stories(session: AsyncSession, donations):
    """創建測試影響力故事"""
    print("創建測試影響力故事...")
    
    stories_data = [
        {
            "title": "數位教育改變偏鄉學童未來",
            "content": "透過平板電腦的捐贈，太麻里國小的學生們現在能夠接觸到最新的數位學習資源。學生們的學習興趣大幅提升，數位素養也顯著改善。老師們表示，這些設備讓教學更加生動有趣，學生的參與度提高了 80%。",
            "image_url": "/images/impact-stories/featured/featured-01.jpg",
            "video_url": "/videos/taiwan-education.mp4",
            "impact_metrics": '{"students_benefited": 120, "equipment_donated": "平板電腦 20 台", "duration": "3 個月", "improvement_rate": "80%"}'
        },
        {
            "title": "圖書資源豐富學子心靈",
            "content": "秀林國中的圖書館因為新捐贈的圖書而煥然一新。學生們的閱讀量增加了 150%，特別是科學類書籍深受歡迎。許多學生開始對科學產生濃厚興趣，甚至有學生表示將來想成為科學家。",
            "image_url": "/images/impact-stories/featured/featured-02.jpg",
            "video_url": None,
            "impact_metrics": '{"students_benefited": 85, "books_donated": "500 冊", "reading_increase": "150%", "duration": "6 個月"}'
        }
    ]
    
    created_stories = []
    
    for i, story_data in enumerate(stories_data):
        try:
            if i < len(donations):
                donation = donations[i]
                
                story = ImpactStory(
                    donation_id=donation.id,
                    title=story_data["title"],
                    content=story_data["content"],
                    image_url=story_data["image_url"],
                    video_url=story_data["video_url"],
                    impact_metrics=story_data["impact_metrics"]
                )
                
                session.add(story)
                created_stories.append(story)
                print(f"✓ 創建影響力故事: {story.title}")
                
        except Exception as e:
            print(f"✗ 創建影響力故事失敗: {story_data['title']} - {e}")
    
    await session.commit()
    return created_stories


async def main():
    """主函數"""
    print("開始初始化測試數據...")
    
    async for session in get_session():
        try:
            # 創建測試用戶
            users = await create_test_users(session)
            school_users = [u for u in users if u.role == UserRole.SCHOOL]
            company_users = [u for u in users if u.role == UserRole.COMPANY]
            
            # 創建測試需求
            needs = await create_test_needs(session, school_users)
            
            # 創建測試捐贈記錄
            donations = await create_test_donations(session, company_users, needs)
            
            # 創建測試影響力故事
            stories = await create_test_impact_stories(session, donations)
            
            print(f"\n✅ 數據初始化完成！")
            print(f"   - 用戶: {len(users)} 個")
            print(f"   - 需求: {len(needs)} 個")
            print(f"   - 捐贈: {len(donations)} 個")
            print(f"   - 故事: {len(stories)} 個")
            
        except Exception as e:
            print(f"❌ 初始化失敗: {e}")
            await session.rollback()
        finally:
            await session.close()
        break


if __name__ == "__main__":
    asyncio.run(main())

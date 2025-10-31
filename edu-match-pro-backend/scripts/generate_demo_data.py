#!/usr/bin/env python3
"""
生成演示数据脚本
为demo用户创建真实的需求、捐赠和影响故事数据
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db import async_session_local
from app.models import Need, Donation, DonationStatus, NeedStatus, UrgencyLevel
from app.models.impact_story import ImpactStory
from app.crud.user_crud import get_user_by_email


# ============================================================================
# 需求数据模板
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
        "description": "體育課需要新的球類器材和運動設備，包括籃球、足球、羽球等，讓學生能夠安全地進行體育活動。現有器材已使用超過10年，存在安全隱憂。",
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
# 捐赠数据模板
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
# 影响故事数据模板
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


async def clear_existing_demo_data():
    """清理现有的demo数据（保留用户和profile）"""
    print("\n" + "="*80)
    print("清理现有Demo数据")
    print("="*80)
    
    async with async_session_local() as session:
        try:
            # 获取demo用户的ID
            result = await session.execute(
                text('SELECT id FROM "user" WHERE is_demo = true')
            )
            demo_user_ids = [row[0] for row in result.fetchall()]
            
            if not demo_user_ids:
                print("⚠️  没有找到demo用户")
                return
            
            print(f"找到 {len(demo_user_ids)} 个demo用户")
            
            # 删除 impact_story
            result = await session.execute(
                text("""
                    DELETE FROM impact_story 
                    WHERE donation_id IN (
                        SELECT id FROM donation 
                        WHERE company_id = ANY(:user_ids)
                    )
                """),
                {"user_ids": demo_user_ids}
            )
            print(f"✓ 删除了 {result.rowcount} 条 impact_story")
            
            # 删除 donation
            result = await session.execute(
                text("""
                    DELETE FROM donation 
                    WHERE company_id = ANY(:user_ids)
                    OR need_id IN (
                        SELECT id FROM need WHERE school_id = ANY(:user_ids)
                    )
                """),
                {"user_ids": demo_user_ids}
            )
            print(f"✓ 删除了 {result.rowcount} 条 donation")
            
            # 删除 need
            result = await session.execute(
                text('DELETE FROM need WHERE school_id = ANY(:user_ids)'),
                {"user_ids": demo_user_ids}
            )
            print(f"✓ 删除了 {result.rowcount} 条 need")
            
            await session.commit()
            print("✓ 清理完成")
            
        except Exception as e:
            await session.rollback()
            print(f"✗ 清理失败: {e}")
            raise


async def create_needs_for_schools():
    """为demo学校创建需求"""
    print("\n" + "="*80)
    print("创建学校需求数据")
    print("="*80)
    
    async with async_session_local() as session:
        # 获取demo学校用户
        schools = []
        for email in ['demo.school@edu.tw', 'demo.rural.school@edu.tw']:
            school = await get_user_by_email(session, email)
            if school:
                schools.append(school)
        
        if not schools:
            print("⚠️  没有找到demo学校用户")
            return []
        
        created_needs = []
        
        # 为每个学校创建需求
        for i, school in enumerate(schools):
            # 每个学校分配4个需求
            school_needs = NEED_TEMPLATES[i*4:(i+1)*4]
            
            for need_template in school_needs:
                need = Need(
                    school_id=school.id,
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
            print(f"✓ 为 {school.email} 创建了 {len(school_needs)} 个需求")
        
        await session.commit()
        
        # 刷新所有需求对象以获取ID
        for need in created_needs:
            await session.refresh(need)
        
        print(f"\n✓ 总共创建了 {len(created_needs)} 个需求")
        return created_needs


async def create_donations_for_company(needs):
    """为demo企业创建捐赠"""
    print("\n" + "="*80)
    print("创建企业捐赠数据")
    print("="*80)
    
    async with async_session_local() as session:
        # 获取demo企业用户
        company = await get_user_by_email(session, 'demo.company@tech.com')
        if not company:
            print("⚠️  没有找到demo企业用户")
            return []
        
        created_donations = []
        
        # 为前8个需求创建对应的捐赠
        for i, need in enumerate(needs[:8]):
            if i < len(DONATION_TEMPLATES):
                template = DONATION_TEMPLATES[i]
                
                # 计算完成日期
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
                created_donations.append((donation, need))
                
                # 更新需求状态
                if template["status"] == DonationStatus.completed:
                    need.status = NeedStatus.completed
                elif template["status"] in [DonationStatus.in_progress, DonationStatus.approved]:
                    need.status = NeedStatus.in_progress
        
        await session.flush()
        
        # 刷新所有捐赠对象以获取ID
        for donation, _ in created_donations:
            await session.refresh(donation)
        
        await session.commit()
        
        print(f"✓ 为 {company.email} 创建了 {len(created_donations)} 个捐赠")
        return created_donations


async def create_impact_stories(donations):
    """为完成的捐赠创建影响故事"""
    print("\n" + "="*80)
    print("创建影响故事数据")
    print("="*80)
    
    async with async_session_local() as session:
        created_stories = []
        
        # 为已完成的捐赠创建影响故事
        completed_donations = [
            (d, n) for d, n in donations 
            if d.status == DonationStatus.completed
        ]
        
        for i, (donation, need) in enumerate(completed_donations[:3]):
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
        
        print(f"✓ 创建了 {len(created_stories)} 个影响故事")
        return created_stories


async def verify_data():
    """验证生成的数据"""
    print("\n" + "="*80)
    print("验证生成的数据")
    print("="*80)
    
    async with async_session_local() as session:
        # 统计各表数据
        stats = {}
        
        # 需求统计
        result = await session.execute(
            text("""
                SELECT u.email, COUNT(n.id) as need_count
                FROM "user" u
                LEFT JOIN need n ON u.id = n.school_id
                WHERE u.is_demo = true AND u.role = 'school'
                GROUP BY u.email
            """)
        )
        print("\n需求统计:")
        for row in result.fetchall():
            print(f"  {row.email}: {row.need_count} 个需求")
        
        # 捐赠统计
        result = await session.execute(
            text("""
                SELECT d.status, COUNT(*) as count
                FROM donation d
                JOIN "user" u ON d.company_id = u.id
                WHERE u.is_demo = true
                GROUP BY d.status
            """)
        )
        print("\n捐赠统计:")
        for row in result.fetchall():
            print(f"  {row.status}: {row.count} 个")
        
        # 影响故事统计
        result = await session.execute(
            text("""
                SELECT COUNT(*) as count
                FROM impact_story i
                JOIN donation d ON i.donation_id = d.id
                JOIN "user" u ON d.company_id = u.id
                WHERE u.is_demo = true
            """)
        )
        story_count = result.fetchone()[0]
        print(f"\n影响故事: {story_count} 个")
        
        print("\n✓ 数据验证完成")


async def main():
    """主函数"""
    print("="*80)
    print("生成Demo演示数据")
    print("="*80)
    print("\n这个脚本将为demo用户生成完整的演示数据:")
    print("  - 学校需求 (needs)")
    print("  - 企业捐赠 (donations)")
    print("  - 影响故事 (impact_stories)")
    print()
    
    try:
        # 1. 清理现有数据
        await clear_existing_demo_data()
        
        # 2. 创建需求
        needs = await create_needs_for_schools()
        
        # 3. 创建捐赠
        donations = await create_donations_for_company(needs)
        
        # 4. 创建影响故事
        await create_impact_stories(donations)
        
        # 5. 验证数据
        await verify_data()
        
        print("\n" + "="*80)
        print("✓✓✓ Demo数据生成完成！")
        print("="*80)
        print("\n📱 可以使用以下账号登录查看:")
        print("  学校 1: demo.school@edu.tw / demo_school_2024")
        print("  学校 2: demo.rural.school@edu.tw / demo_rural_2024")
        print("  企业:   demo.company@tech.com / demo_company_2024")
        print()
        
    except Exception as e:
        print(f"\n✗✗✗ 生成失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())


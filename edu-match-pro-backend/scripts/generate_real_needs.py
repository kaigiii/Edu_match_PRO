#!/usr/bin/env python3
"""
生成真实需求数据脚本
创建真实学校账号和需求，用于主页展示
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db import async_session_local
from app.models import Need, NeedStatus, UrgencyLevel
from app.models.user import User, UserRole
from app.models.profile import Profile
from app.core.security import get_password_hash


# ============================================================================
# 真实学校账号数据
# ============================================================================
REAL_SCHOOLS = [
    {
        "email": "taiping.elem@edu.tw",
        "password": "school2024",
        "organization_name": "台東縣太平國小",
        "contact_person": "陳校長",
        "phone": "089-551-234",
        "address": "台東縣太平村中正路123號"
    },
    {
        "email": "xiulin.junior@edu.tw",
        "password": "school2024",
        "organization_name": "花蓮縣秀林國中",
        "contact_person": "林校長",
        "phone": "03-826-5678",
        "address": "花蓮縣秀林鄉秀林村456號"
    },
    {
        "email": "jianan.elem@edu.tw",
        "password": "school2024",
        "organization_name": "台南市佳南國小",
        "contact_person": "王校長",
        "phone": "06-789-1234",
        "address": "台南市佳里區中山路789號"
    },
    {
        "email": "wulai.elem@edu.tw",
        "password": "school2024",
        "organization_name": "新北市烏來國小",
        "contact_person": "張校長",
        "phone": "02-2661-5678",
        "address": "新北市烏來區烏來里中正路10號"
    }
]


# ============================================================================
# 真实需求数据模板（10个需求）
# ============================================================================
REAL_NEEDS = [
    {
        "title": "偏鄉數位學習設備需求",
        "description": "本校位於台東偏遠地區，學生多為弱勢家庭子女，缺乏數位學習資源。希望能獲得15台平板電腦或筆記型電腦，讓孩子們能夠使用線上學習資源，縮短城鄉數位落差。目前全校僅有5台老舊電腦，無法滿足120位學生的學習需求。",
        "category": "硬體設備",
        "location": "台東縣",
        "student_count": 120,
        "urgency": UrgencyLevel.high,
        "sdgs": [4, 10],
        "image_url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800"
    },
    {
        "title": "原住民文化課程教材",
        "description": "學校位於原住民部落，希望能獲得族語教材、傳統樂器和文化教學用品，讓學生認識自己的文化根源。需要20套族語學習教材、5組傳統樂器，以及文化教學影音資源。",
        "category": "文化/藝術",
        "location": "花蓮縣",
        "student_count": 85,
        "urgency": UrgencyLevel.medium,
        "sdgs": [4, 10, 11],
        "image_url": "https://images.unsplash.com/photo-1583487960247-419b84309e4b?w=800"
    },
    {
        "title": "科學實驗室器材更新",
        "description": "國中部自然科實驗室器材老舊，許多實驗無法進行。需要顯微鏡10台、基本化學實驗器材組5套、物理實驗器材組3套，讓學生能夠動手做實驗，培養科學素養。",
        "category": "科學/實驗設備",
        "location": "花蓮縣",
        "student_count": 150,
        "urgency": UrgencyLevel.high,
        "sdgs": [4, 9],
        "image_url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800"
    },
    {
        "title": "英語繪本與學習資源",
        "description": "圖書館英語讀物嚴重不足，希望能充實英語繪本、有聲書和互動教材。需要100冊英語繪本、20套有聲書，以及線上英語學習平台授權，提升學生英語能力。",
        "category": "圖書/閱讀",
        "location": "台南市",
        "student_count": 200,
        "urgency": UrgencyLevel.medium,
        "sdgs": [4, 8],
        "image_url": "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800"
    },
    {
        "title": "體育器材與運動場地改善",
        "description": "學校體育器材老舊，部分已損壞不堪使用。需要籃球20顆、足球15顆、排球10顆、羽球拍組15組，以及跳繩50條。希望讓每個孩子都能安全地參與體育活動。",
        "category": "體育器材",
        "location": "新北市",
        "student_count": 180,
        "urgency": UrgencyLevel.medium,
        "sdgs": [3, 4],
        "image_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"
    },
    {
        "title": "音樂教室樂器補充",
        "description": "音樂教室缺乏足夠的樂器供學生使用，希望能獲得電子琴5台、吉他10把、烏克麗麗15把，讓更多學生能夠學習音樂，培養藝術涵養。",
        "category": "文化/藝術",
        "location": "台東縣",
        "student_count": 120,
        "urgency": UrgencyLevel.low,
        "sdgs": [4],
        "image_url": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800"
    },
    {
        "title": "程式教育機器人套組",
        "description": "配合108課綱科技領域課程，學校需要程式教育機器人套組，讓學生學習程式設計和邏輯思維。需要15組教育機器人套組（如mBot或樂高EV3），培養學生的運算思維能力。",
        "category": "師資/技能",
        "location": "台南市",
        "student_count": 180,
        "urgency": UrgencyLevel.high,
        "sdgs": [4, 9],
        "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"
    },
    {
        "title": "環保教育與生態教材",
        "description": "推動校園環保教育，需要環保教材、回收分類設備、堆肥桶等。希望建立校園生態池，需要相關器材和教學資源，讓學生從小培養環保意識。",
        "category": "其他",
        "location": "花蓮縣",
        "student_count": 95,
        "urgency": UrgencyLevel.low,
        "sdgs": [4, 13, 15],
        "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800"
    },
    {
        "title": "弱勢學生課後輔導資源",
        "description": "學校有40%學生來自弱勢家庭，需要課後輔導教材、學習用品和獎勵品。希望能提供50套文具用品、30套課後輔導教材，以及設立小額獎助學金，鼓勵孩子認真學習。",
        "category": "其他",
        "location": "新北市",
        "student_count": 160,
        "urgency": UrgencyLevel.high,
        "sdgs": [1, 4, 10],
        "image_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
    },
    {
        "title": "智慧農業教學設備",
        "description": "學校推動食農教育，希望設置智慧農場教學區。需要溫溼度感測器10組、土壤濕度計5組、樹莓派控制器3組，以及相關教學軟體，讓學生學習科技與農業結合的應用。",
        "category": "科學/實驗設備",
        "location": "台南市",
        "student_count": 140,
        "urgency": UrgencyLevel.medium,
        "sdgs": [2, 4, 9],
        "image_url": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800"
    }
]


async def create_real_schools():
    """创建真实学校账号"""
    print("\n" + "="*80)
    print("创建真实学校账号")
    print("="*80)
    
    async with async_session_local() as session:
        created_schools = []
        
        for school_data in REAL_SCHOOLS:
            # 检查是否已存在
            from sqlalchemy import select
            result = await session.execute(
                select(User).where(User.email == school_data["email"])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                print(f"⚠️  学校已存在: {school_data['email']}")
                created_schools.append(existing)
                continue
            
            # 创建用户
            user = User(
                email=school_data["email"],
                password=get_password_hash(school_data["password"]),
                role=UserRole.SCHOOL,
                is_demo=False,
                is_active=True
            )
            session.add(user)
            await session.flush()
            
            # 创建档案
            profile = Profile(
                user_id=user.id,
                organization_name=school_data["organization_name"],
                contact_person=school_data["contact_person"],
                phone=school_data["phone"],
                address=school_data["address"]
            )
            session.add(profile)
            
            created_schools.append(user)
            print(f"✓ 创建学校: {school_data['organization_name']} ({school_data['email']})")
        
        await session.commit()
        
        # 刷新所有用户对象
        for user in created_schools:
            await session.refresh(user)
        
        print(f"\n✓ 总共有 {len(created_schools)} 个学校账号")
        return created_schools


async def create_real_needs(schools):
    """为真实学校创建需求"""
    print("\n" + "="*80)
    print("创建真实需求数据")
    print("="*80)
    
    async with async_session_local() as session:
        created_needs = []
        
        # 平均分配需求到各个学校
        needs_per_school = len(REAL_NEEDS) // len(schools)
        extra_needs = len(REAL_NEEDS) % len(schools)
        
        need_index = 0
        for i, school in enumerate(schools):
            # 计算这个学校应该有多少需求
            num_needs = needs_per_school + (1 if i < extra_needs else 0)
            
            for j in range(num_needs):
                if need_index >= len(REAL_NEEDS):
                    break
                
                need_template = REAL_NEEDS[need_index]
                
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
                need_index += 1
        
        await session.commit()
        print(f"✓ 创建了 {len(created_needs)} 个真实需求")
        
        # 按学校统计
        from collections import defaultdict
        school_needs_count = defaultdict(int)
        for need in created_needs:
            school_needs_count[need.school_id] += 1
        
        print("\n按学校统计:")
        for school in schools:
            count = school_needs_count.get(school.id, 0)
            if count > 0:
                print(f"  {school.email}: {count} 个需求")
        
        return created_needs


async def verify_data():
    """验证生成的数据"""
    print("\n" + "="*80)
    print("验证数据")
    print("="*80)
    
    async with async_session_local() as session:
        from sqlalchemy import text
        
        # 统计真实用户和需求
        result = await session.execute(
            text("""
                SELECT COUNT(*) FROM "user" 
                WHERE is_demo = false AND role = 'school'
            """)
        )
        school_count = result.scalar()
        print(f"真实学校账号: {school_count} 个")
        
        result = await session.execute(
            text("""
                SELECT COUNT(*) FROM need n
                JOIN "user" u ON n.school_id = u.id
                WHERE u.is_demo = false
            """)
        )
        need_count = result.scalar()
        print(f"真实需求: {need_count} 个")
        
        # 按类别统计
        result = await session.execute(
            text("""
                SELECT n.category, COUNT(*) as count
                FROM need n
                JOIN "user" u ON n.school_id = u.id
                WHERE u.is_demo = false
                GROUP BY n.category
                ORDER BY count DESC
            """)
        )
        print("\n按类别统计:")
        for row in result.fetchall():
            print(f"  {row.category}: {row.count} 个")


async def main():
    """主函数"""
    print("="*80)
    print("生成真实需求数据")
    print("="*80)
    print("\n这个脚本将创建:")
    print("  - 4个真实学校账号")
    print("  - 10个真实需求（显示在主页需求列表）")
    print()
    
    try:
        # 1. 创建学校账号
        schools = await create_real_schools()
        
        # 2. 创建需求
        needs = await create_real_needs(schools)
        
        # 3. 验证数据
        await verify_data()
        
        print("\n" + "="*80)
        print("✓✓✓ 真实需求数据生成完成！")
        print("="*80)
        print("\n📱 学校账号（密码都是 school2024）:")
        for school_data in REAL_SCHOOLS:
            print(f"  - {school_data['email']}")
        print("\n💡 这些需求现在会显示在主页的需求列表中")
        
    except Exception as e:
        print(f"\n✗✗✗ 生成失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())


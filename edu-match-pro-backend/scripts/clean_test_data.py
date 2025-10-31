"""
清理数据库中的测试数据脚本
保留 wide_volunteer_teams, wide_faraway3, wide_edu_B_1_4, wide_connected_devices
检查其他表并删除测试数据（如注音、数字等无意义数据）
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text, inspect
from app.db import async_session_local, engine
from app.models import User, Profile, Need, Donation, ActivityLog
from app.models.impact_story import ImpactStory


async def list_all_tables():
    """列出所有数据库表"""
    async with engine.begin() as conn:
        result = await conn.run_sync(
            lambda sync_conn: inspect(sync_conn).get_table_names()
        )
    return result


async def check_users():
    """检查用户表"""
    async with async_session_local() as session:
        result = await session.execute(
            text("""
                SELECT id, email, role, display_name, is_demo, created_at
                FROM "user"
                ORDER BY created_at
            """)
        )
        users = result.fetchall()
        
        print("\n" + "="*80)
        print("用户表 (user) - 共 {} 条记录".format(len(users)))
        print("="*80)
        
        for user in users:
            print(f"ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Role: {user.role}")
            print(f"  Display Name: {user.display_name}")
            print(f"  Is Demo: {user.is_demo}")
            print(f"  Created At: {user.created_at}")
            print("-" * 80)
        
        return users


async def check_profiles():
    """检查档案表"""
    async with async_session_local() as session:
        result = await session.execute(
            text("""
                SELECT p.id, p.user_id, p.organization_name, p.contact_person, 
                       p.phone, p.address, u.email
                FROM profile p
                JOIN "user" u ON p.user_id = u.id
                ORDER BY p.created_at
            """)
        )
        profiles = result.fetchall()
        
        print("\n" + "="*80)
        print("档案表 (profile) - 共 {} 条记录".format(len(profiles)))
        print("="*80)
        
        for profile in profiles:
            print(f"ID: {profile.id}")
            print(f"  User Email: {profile.email}")
            print(f"  Organization: {profile.organization_name}")
            print(f"  Contact: {profile.contact_person}")
            print(f"  Phone: {profile.phone}")
            print(f"  Address: {profile.address}")
            print("-" * 80)
        
        return profiles


async def check_needs():
    """检查需求表"""
    async with async_session_local() as session:
        result = await session.execute(
            text("""
                SELECT n.id, n.school_id, n.title, n.description, n.category, 
                       n.location, n.status, u.email, u.display_name
                FROM need n
                JOIN "user" u ON n.school_id = u.id
                ORDER BY n.created_at
            """)
        )
        needs = result.fetchall()
        
        print("\n" + "="*80)
        print("需求表 (need) - 共 {} 条记录".format(len(needs)))
        print("="*80)
        
        for need in needs:
            print(f"ID: {need.id}")
            print(f"  School: {need.email} ({need.display_name})")
            print(f"  Title: {need.title}")
            print(f"  Description: {need.description[:100]}..." if len(need.description) > 100 else f"  Description: {need.description}")
            print(f"  Category: {need.category}")
            print(f"  Location: {need.location}")
            print(f"  Status: {need.status}")
            print("-" * 80)
        
        return needs


async def check_donations():
    """检查捐赠表"""
    async with async_session_local() as session:
        result = await session.execute(
            text("""
                SELECT d.id, d.company_id, d.need_id, d.donation_type, 
                       d.description, d.status, d.progress,
                       u.email as company_email, u.display_name as company_name,
                       n.title as need_title
                FROM donation d
                JOIN "user" u ON d.company_id = u.id
                JOIN need n ON d.need_id = n.id
                ORDER BY d.created_at
            """)
        )
        donations = result.fetchall()
        
        print("\n" + "="*80)
        print("捐赠表 (donation) - 共 {} 条记录".format(len(donations)))
        print("="*80)
        
        for donation in donations:
            print(f"ID: {donation.id}")
            print(f"  Company: {donation.company_email} ({donation.company_name})")
            print(f"  Need: {donation.need_title}")
            print(f"  Type: {donation.donation_type}")
            print(f"  Description: {donation.description[:100] if donation.description else 'N/A'}")
            print(f"  Status: {donation.status}")
            print(f"  Progress: {donation.progress}%")
            print("-" * 80)
        
        return donations


async def check_impact_stories():
    """检查影响故事表"""
    async with async_session_local() as session:
        result = await session.execute(
            text("""
                SELECT i.id, i.donation_id, i.title, i.content, i.impact_metrics,
                       d.donation_type, u.display_name as company_name
                FROM impact_story i
                JOIN donation d ON i.donation_id = d.id
                JOIN "user" u ON d.company_id = u.id
                ORDER BY i.created_at
            """)
        )
        stories = result.fetchall()
        
        print("\n" + "="*80)
        print("影响故事表 (impact_story) - 共 {} 条记录".format(len(stories)))
        print("="*80)
        
        for story in stories:
            print(f"ID: {story.id}")
            print(f"  Company: {story.company_name}")
            print(f"  Donation Type: {story.donation_type}")
            print(f"  Title: {story.title}")
            print(f"  Content: {story.content[:100]}..." if story.content and len(story.content) > 100 else f"  Content: {story.content}")
            print(f"  Impact Metrics: {story.impact_metrics}")
            print("-" * 80)
        
        return stories


async def check_activity_logs():
    """检查活动日志表"""
    async with async_session_local() as session:
        result = await session.execute(
            text("""
                SELECT a.id, a.user_id, a.activity_type, a.description, a.created_at,
                       u.email
                FROM activity_log a
                LEFT JOIN "user" u ON a.user_id = u.id
                ORDER BY a.created_at DESC
                LIMIT 50
            """)
        )
        logs = result.fetchall()
        
        print("\n" + "="*80)
        print("活动日志表 (activity_log) - 显示最近 50 条记录")
        print("="*80)
        
        for log in logs:
            print(f"ID: {log.id}")
            print(f"  User: {log.email if log.email else log.user_id}")
            print(f"  Type: {log.activity_type}")
            print(f"  Description: {log.description}")
            print(f"  Created At: {log.created_at}")
            print("-" * 80)
        
        return logs


async def check_wide_tables():
    """检查 wide_ 开头的表（这些要保留）"""
    tables_to_check = [
        'wide_volunteer_teams',
        'wide_faraway3', 
        'wide_edu_B_1_4',
        'wide_connected_devices'
    ]
    
    async with async_session_local() as session:
        for table_name in tables_to_check:
            try:
                result = await session.execute(
                    text(f'SELECT COUNT(*) as count FROM "{table_name}"')
                )
                count = result.fetchone()[0]
                print(f"\n{table_name}: {count} 条记录 (保留)")
            except Exception as e:
                print(f"\n{table_name}: 不存在或查询失败 - {e}")


async def delete_test_data():
    """删除测试数据"""
    print("\n" + "="*80)
    print("开始删除测试数据")
    print("="*80)
    
    # 首先询问用户确认
    confirmation = input("\n是否要删除非demo用户的数据？(输入 'YES' 确认): ")
    if confirmation != "YES":
        print("取消删除操作")
        return
    
    async with async_session_local() as session:
        try:
            # 1. 删除非demo用户相关的数据
            # 先获取非demo用户的ID
            result = await session.execute(
                text('SELECT id FROM "user" WHERE is_demo = false')
            )
            non_demo_user_ids = [row[0] for row in result.fetchall()]
            
            if not non_demo_user_ids:
                print("没有找到非demo用户")
                return
            
            print(f"\n找到 {len(non_demo_user_ids)} 个非demo用户")
            
            # 2. 删除 impact_story（需要先找到相关的donation）
            result = await session.execute(
                text("""
                    DELETE FROM impact_story 
                    WHERE donation_id IN (
                        SELECT id FROM donation WHERE company_id = ANY(:user_ids)
                    )
                """),
                {"user_ids": non_demo_user_ids}
            )
            print(f"删除了 {result.rowcount} 条 impact_story 记录")
            
            # 3. 删除 donation
            result = await session.execute(
                text("""
                    DELETE FROM donation 
                    WHERE company_id = ANY(:user_ids) OR need_id IN (
                        SELECT id FROM need WHERE school_id = ANY(:user_ids)
                    )
                """),
                {"user_ids": non_demo_user_ids}
            )
            print(f"删除了 {result.rowcount} 条 donation 记录")
            
            # 4. 删除 need
            result = await session.execute(
                text('DELETE FROM need WHERE school_id = ANY(:user_ids)'),
                {"user_ids": non_demo_user_ids}
            )
            print(f"删除了 {result.rowcount} 条 need 记录")
            
            # 5. 删除 activity_log
            result = await session.execute(
                text('DELETE FROM activity_log WHERE user_id = ANY(:user_ids)'),
                {"user_ids": non_demo_user_ids}
            )
            print(f"删除了 {result.rowcount} 条 activity_log 记录")
            
            # 6. 删除 profile
            result = await session.execute(
                text('DELETE FROM profile WHERE user_id = ANY(:user_ids)'),
                {"user_ids": non_demo_user_ids}
            )
            print(f"删除了 {result.rowcount} 条 profile 记录")
            
            # 7. 最后删除 user
            result = await session.execute(
                text('DELETE FROM "user" WHERE is_demo = false')
            )
            print(f"删除了 {result.rowcount} 条 user 记录")
            
            await session.commit()
            print("\n✓ 成功删除所有非demo用户的测试数据")
            
        except Exception as e:
            await session.rollback()
            print(f"\n✗ 删除失败: {e}")
            raise


async def main():
    """主函数"""
    print("="*80)
    print("数据库数据检查工具")
    print("="*80)
    
    # 列出所有表
    tables = await list_all_tables()
    print("\n数据库中的所有表:")
    for table in tables:
        print(f"  - {table}")
    
    # 检查各个表的数据
    await check_users()
    await check_profiles()
    await check_needs()
    await check_donations()
    await check_impact_stories()
    await check_activity_logs()
    await check_wide_tables()
    
    # 询问是否删除测试数据
    print("\n" + "="*80)
    print("检查完成")
    print("="*80)
    
    delete_choice = input("\n是否要删除测试数据？(y/n): ")
    if delete_choice.lower() == 'y':
        await delete_test_data()
    else:
        print("跳过删除操作")


if __name__ == "__main__":
    asyncio.run(main())


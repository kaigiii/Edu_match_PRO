#!/usr/bin/env python3
"""
一鍵重建 Demo 資料
整合所有 demo 資料的刪除和重建流程
使用 PostgreSQL
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings


async def rebuild_demo_data():
    """一鍵重建所有 demo 資料"""
    engine = create_async_engine(settings.database_url)
    
    print("=" * 70)
    print("🔄 開始重建 Demo 資料")
    print("=" * 70)
    print()
    
    async with engine.begin() as conn:
        # ========== 步驟 1: 清理現有 demo 資料 ==========
        print("📋 步驟 1: 清理現有 demo 用戶資料")
        print("-" * 70)
        
        # 找出現有的 demo 用戶 ID
        result = await conn.execute(text("""
            SELECT id FROM "user" WHERE email IN (
                SELECT email FROM demo_users
            )
        """))
        existing_demo_ids = [str(row[0]) for row in result]
        
        if existing_demo_ids:
            print(f"  找到 {len(existing_demo_ids)} 個現有 demo 用戶")
            
            # 找一個非 demo 的學校和企業用戶作為臨時接收者
            result = await conn.execute(text("""
                SELECT id FROM "user" 
                WHERE role = 'school' AND email NOT IN (SELECT email FROM demo_users)
                LIMIT 1
            """))
            temp_school = result.scalar()
            
            result = await conn.execute(text("""
                SELECT id FROM "user" 
                WHERE role = 'company' AND email NOT IN (SELECT email FROM demo_users)
                LIMIT 1
            """))
            temp_company = result.scalar()
            
            # 重新分配 needs 和 donations
            for demo_id in existing_demo_ids:
                if temp_school:
                    result = await conn.execute(text("""
                        UPDATE need SET school_id = :new_id WHERE school_id = :old_id
                    """), {'new_id': str(temp_school), 'old_id': demo_id})
                    if result.rowcount > 0:
                        print(f"  ✅ 重新分配了 {result.rowcount} 個 needs")
                
                if temp_company:
                    result = await conn.execute(text("""
                        UPDATE donation SET company_id = :new_id WHERE company_id = :old_id
                    """), {'new_id': str(temp_company), 'old_id': demo_id})
                    if result.rowcount > 0:
                        print(f"  ✅ 重新分配了 {result.rowcount} 個 donations")
            
            # 刪除 profiles
            result = await conn.execute(text("""
                DELETE FROM profile WHERE user_id IN (
                    SELECT id FROM "user" WHERE email IN (SELECT email FROM demo_users)
                )
            """))
            print(f"  ✅ 刪除了 {result.rowcount} 個 profiles")
            
            # 刪除用戶
            result = await conn.execute(text("""
                DELETE FROM "user" WHERE email IN (SELECT email FROM demo_users)
            """))
            print(f"  ✅ 刪除了 {result.rowcount} 個用戶")
        else:
            print("  ℹ️  沒有找到現有 demo 用戶")
        
        print()
        
        # ========== 步驟 2: 從 demo_users 重建 ==========
        print("📋 步驟 2: 從 demo_users 重建用戶")
        print("-" * 70)
        
        result = await conn.execute(text("""
            INSERT INTO "user" (id, created_at, updated_at, email, password, role)
            SELECT id, created_at, updated_at, email, password, role::userrole
            FROM demo_users
        """))
        print(f"  ✅ 插入了 {result.rowcount} 個 demo 用戶到 user 表")
        
        # 查詢 demo 用戶信息
        result = await conn.execute(text("""
            SELECT id, email, role, display_name
            FROM demo_users
            ORDER BY role, email
        """))
        
        demo_users = {'school': [], 'company': []}
        print("\n  Demo 用戶列表:")
        for row in result:
            demo_users[row[2]].append({
                'id': str(row[0]), 
                'email': row[1],
                'display_name': row[3]
            })
            print(f"    • {row[2]}: {row[1]} ({row[3]})")
        
        print()
        
        # ========== 步驟 3: 同步 profiles ==========
        print("📋 步驟 3: 同步 demo profiles")
        print("-" * 70)
        
        result = await conn.execute(text("""
            INSERT INTO profile (
                id, created_at, updated_at, user_id, 
                organization_name, contact_person, position, 
                phone, address, bio, avatar_url, tax_id
            )
            SELECT 
                id, created_at, updated_at, user_id,
                organization_name, contact_person, position,
                phone, address, bio, avatar_url, NULL as tax_id
            FROM demo_profiles
        """))
        print(f"  ✅ 同步了 {result.rowcount} 個 profiles")
        
        print()
        
        # ========== 步驟 4: 分配 needs 給學校 ==========
        print("📋 步驟 4: 分配 needs 給 demo 學校")
        print("-" * 70)
        
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
        
        # ========== 步驟 5: 分配 donations 給企業 ==========
        print("📋 步驟 5: 分配 donations 給 demo 企業")
        print("-" * 70)
        
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
            print(f"  ✅ 設定了 {result.rowcount} 個 donations 為已完成")
            
            # 更新 3 個為 in_progress (60%)
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
            print(f"  ✅ 設定了 {result.rowcount} 個 donations 為進行中")
        
        print()
        
        # ========== 步驟 6: 驗證結果 ==========
        print("📋 步驟 6: 驗證重建結果")
        print("-" * 70)
        
        # 驗證用戶和 profile
        result = await conn.execute(text("""
            SELECT 
                u.email,
                u.role,
                p.organization_name,
                CASE WHEN p.id IS NOT NULL THEN '✓' ELSE '✗' END as has_profile
            FROM "user" u
            LEFT JOIN profile p ON u.id = p.user_id
            WHERE u.email LIKE '%demo%'
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
                print(f"       - {row[0]}: {row[1]} 筆")
    
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
    try:
        asyncio.run(rebuild_demo_data())
    except KeyboardInterrupt:
        print("\n\n⚠️  操作已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


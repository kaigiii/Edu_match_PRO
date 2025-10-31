#!/usr/bin/env python3
"""
更新數據庫中的圖片資源
確保所有 needs 和 impact_stories 都有圖片 URL
"""

import asyncio
import os
import sys
import random

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings


# GitHub Pages 圖片資源基礎 URL
BASE_URL = "https://kaigiii.github.io/Edu_macth_PRO"

# 可用的圖片資源
AVAILABLE_IMAGES = {
    # 需求/學校相關的背景圖片 (通用背景)
    "needs": [
        f"{BASE_URL}/images/bg-1.jpg",
        f"{BASE_URL}/images/bg-2.jpg",
        f"{BASE_URL}/images/bg-3.jpg",
        f"{BASE_URL}/images/bg-4.jpg",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200",  # 教室
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",  # 學習
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200",  # 學生
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1200",  # 戶外學習
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200",  # 書本
        "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1200",  # 電腦教室
        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200",  # 圖書館
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",  # 閱讀
        "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200",  # 音樂
        "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?q=80&w=1200",  # 科學實驗
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",  # 團隊學習
    ],
    
    # 影響力故事圖片
    "impact_stories": [
        f"{BASE_URL}/images/impact-stories/featured/featured-01.jpg",
        f"{BASE_URL}/images/impact-stories/featured/featured-02.jpg",
        f"{BASE_URL}/images/impact-stories/featured/featured-03.jpg",
        f"{BASE_URL}/images/impact-stories/featured/featured-04.jpg",
        f"{BASE_URL}/images/impact-stories/featured/featured-05.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/01.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/02.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/03.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/04.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/05.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/06.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/07.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/08.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/09.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/10.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/11.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/12.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/13.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/14.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/15.jpg",
        f"{BASE_URL}/images/impact-stories/background-wall/16.jpg",
        "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200",  # 英語學習
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200",  # 環保教育
        "https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1200",  # 科技農業
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",  # 閱讀時光
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1200",  # 戶外活動
    ],
}


async def update_image_urls():
    """更新數據庫中的圖片 URL"""
    engine = create_async_engine(settings.database_url)
    
    print("=" * 70)
    print("🖼️  開始更新圖片資源")
    print("=" * 70)
    print()
    
    async with engine.begin() as conn:
        # ========== 更新 Needs 圖片 ==========
        print("📋 檢查 Needs 表的圖片...")
        print("-" * 70)
        
        # 查詢沒有圖片的 needs
        result = await conn.execute(text("""
            SELECT id, title, category 
            FROM need 
            WHERE image_url IS NULL OR image_url = ''
            ORDER BY created_at DESC
        """))
        
        needs_without_images = result.fetchall()
        print(f"  找到 {len(needs_without_images)} 個沒有圖片的 needs")
        
        if needs_without_images:
            print("\n  開始分配圖片...")
            used_images = set()
            
            for idx, (need_id, title, category) in enumerate(needs_without_images):
                # 隨機選擇一張未使用的圖片
                available = [img for img in AVAILABLE_IMAGES["needs"] if img not in used_images]
                if not available:
                    # 如果所有圖片都用過了，重新開始
                    used_images.clear()
                    available = AVAILABLE_IMAGES["needs"].copy()
                
                image_url = random.choice(available)
                used_images.add(image_url)
                
                await conn.execute(
                    text("UPDATE need SET image_url = :image_url WHERE id = :need_id"),
                    {"image_url": image_url, "need_id": str(need_id)}
                )
                print(f"  ✅ {idx + 1}. {title[:40]:<40} → 已分配圖片")
        else:
            print("  ✓ 所有 needs 都已有圖片")
        
        print()
        
        # ========== 更新 Impact Stories 圖片 ==========
        print("📋 檢查 Impact Stories 表的圖片...")
        print("-" * 70)
        
        # 查詢沒有圖片的 impact stories
        result = await conn.execute(text("""
            SELECT id, title 
            FROM impact_story 
            WHERE image_url IS NULL OR image_url = ''
            ORDER BY created_at DESC
        """))
        
        stories_without_images = result.fetchall()
        print(f"  找到 {len(stories_without_images)} 個沒有圖片的 impact stories")
        
        if stories_without_images:
            print("\n  開始分配圖片...")
            used_images = set()
            
            for idx, (story_id, title) in enumerate(stories_without_images):
                # 隨機選擇一張未使用的圖片
                available = [img for img in AVAILABLE_IMAGES["impact_stories"] if img not in used_images]
                if not available:
                    # 如果所有圖片都用過了，重新開始
                    used_images.clear()
                    available = AVAILABLE_IMAGES["impact_stories"].copy()
                
                image_url = random.choice(available)
                used_images.add(image_url)
                
                await conn.execute(
                    text("UPDATE impact_story SET image_url = :image_url WHERE id = :story_id"),
                    {"image_url": image_url, "story_id": str(story_id)}
                )
                print(f"  ✅ {idx + 1}. {title[:40]:<40} → 已分配圖片")
        else:
            print("  ✓ 所有 impact stories 都已有圖片")
        
        print()
        
        # ========== 驗證結果 ==========
        print("📋 驗證更新結果")
        print("-" * 70)
        
        # 統計 needs 圖片狀態
        result = await conn.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(image_url) as with_image
            FROM need
        """))
        row = result.fetchone()
        print(f"\n  Needs 統計:")
        print(f"    • 總數: {row[0]}")
        print(f"    • 有圖片: {row[1]}")
        print(f"    • 覆蓋率: {(row[1]/row[0]*100 if row[0] > 0 else 0):.1f}%")
        
        # 統計 impact stories 圖片狀態
        result = await conn.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(image_url) as with_image
            FROM impact_story
        """))
        row = result.fetchone()
        print(f"\n  Impact Stories 統計:")
        print(f"    • 總數: {row[0]}")
        print(f"    • 有圖片: {row[1]}")
        print(f"    • 覆蓋率: {(row[1]/row[0]*100 if row[0] > 0 else 0):.1f}%")
        
        # 顯示一些樣本
        print(f"\n  圖片樣本 (前5個 needs):")
        result = await conn.execute(text("""
            SELECT title, image_url 
            FROM need 
            WHERE image_url IS NOT NULL
            LIMIT 5
        """))
        for title, image_url in result:
            short_url = image_url[:60] + "..." if len(image_url) > 60 else image_url
            print(f"    • {title[:30]:<30} → {short_url}")
    
    await engine.dispose()
    
    print()
    print("=" * 70)
    print("🎉 圖片資源更新完成！")
    print("=" * 70)
    print()
    print("💡 可用圖片資源:")
    print(f"  • Needs: {len(AVAILABLE_IMAGES['needs'])} 張")
    print(f"  • Impact Stories: {len(AVAILABLE_IMAGES['impact_stories'])} 張")
    print()


if __name__ == "__main__":
    try:
        asyncio.run(update_image_urls())
    except KeyboardInterrupt:
        print("\n\n⚠️  操作已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


"""
簡化的主 API 文件
包含所有前端需要的 API 端點
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.db import get_session
from app.api.dependencies import get_current_user, require_company_user, require_school_user
from app.models.user import User
from app.schemas.need_schemas import NeedPublic, NeedCreate, NeedUpdate
from app.schemas.dashboard_schemas import SchoolDashboardStats, CompanyDashboardStats, PlatformStats
from app.schemas.donation_schemas import DonationPublic
from app.schemas.activity_log_schemas import ActivityLogPublic

from app.crud.need_crud import (
    create_need, get_need_by_id, get_needs_by_school, 
    get_all_needs, get_all_needs_for_companies, update_need, delete_need
)
from app.crud.dashboard_crud import get_school_dashboard_stats as get_school_stats, get_company_dashboard_stats as get_company_stats, get_platform_stats
from app.crud.donation_crud import get_donations_by_company
from app.crud.activity_log_crud import get_recent_activity as get_user_activity
from app.crud.smart_exploration_crud import query_schools_by_criteria

# 導入模擬數據
from app.data.mock_data import RECENT_PROJECTS, IMPACT_STORIES


def convert_need_to_public(need) -> NeedPublic:
    """將 Need 模型轉換為 NeedPublic 響應模型"""
    return NeedPublic(
        id=need.id,
        school_id=need.school_id,
        title=need.title,
        description=need.description,
        category=need.category,
        location=need.location,
        student_count=need.student_count,
        image_url=need.image_url,
        urgency=need.urgency,
        sdgs=need.sdgs,
        status=need.status,
        created_at=need.created_at,
        updated_at=need.updated_at
    )

# 創建主路由器
router = APIRouter(tags=["Main API"])

# ==================== 健康檢查 ====================

@router.get("/health")
async def health_check():
    """健康檢查"""
    return {"status": "ok", "message": "Edu-Match-Pro API is running"}

# ==================== 學校列表 ====================

@router.get("/schools")
async def get_schools(
    query: str = "",
    session: AsyncSession = Depends(get_session)
):
    """
    獲取學校列表（從 wide_faraway3 表）
    返回格式："本校名稱"-"分校分班名稱"
    支持搜索過濾
    """
    from sqlalchemy import select, text
    
    try:
        # 使用原生 SQL 查詢以確保正確處理列名
        sql = text("""
            SELECT DISTINCT 
                CASE 
                    WHEN "分校分班名稱" IS NOT NULL AND "分校分班名稱" != '' 
                    THEN "本校名稱" || '-' || "分校分班名稱"
                    ELSE "本校名稱"
                END as school_name
            FROM wide_faraway3
            WHERE 
                ("本校名稱" IS NOT NULL AND "本校名稱" != '')
                AND (
                    :query = '' 
                    OR "本校名稱" ILIKE '%' || :query || '%'
                    OR "分校分班名稱" ILIKE '%' || :query || '%'
                )
            ORDER BY school_name
            LIMIT 100
        """)
        
        result = await session.execute(sql, {"query": query})
        schools = [row[0] for row in result.fetchall()]
        
        return {
            "schools": schools,
            "total": len(schools)
        }
    except Exception as e:
        print(f"Error fetching schools: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"獲取學校列表失敗: {str(e)}"
        )


# ==================== Wide 資料表 API ====================

@router.get("/data/faraway-schools")
async def get_faraway_schools(
    page: int = 1,
    limit: int = 50,
    county: str = "",
    school_name: str = "",
    session: AsyncSession = Depends(get_session)
):
    """獲取偏鄉學校資料 (wide_faraway3)"""
    from sqlalchemy import text
    
    try:
        offset = (page - 1) * limit
        
        # 構建查詢條件
        where_clauses = []
        params = {"limit": limit, "offset": offset}
        
        if county:
            where_clauses.append('"縣市名稱" ILIKE :county')
            params["county"] = f"%{county}%"
        
        if school_name:
            where_clauses.append('"本校名稱" ILIKE :school_name')
            params["school_name"] = f"%{school_name}%"
        
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        # 查詢資料
        data_sql = text(f"""
            SELECT 
                "學年度", "縣市名稱", "鄉鎮市區", "學生等級",
                "本校代碼", "本校名稱", "分校分班名稱",
                "公/私立", "地區屬性", "班級數",
                "男學生數[人]", "女學生數[人]", "原住民學生比率",
                "上學年男畢業生數[人]", "上學年女畢業生數[人]"
            FROM wide_faraway3
            WHERE {where_sql}
            ORDER BY "縣市名稱", "本校名稱"
            LIMIT :limit OFFSET :offset
        """)
        
        # 查詢總數
        count_sql = text(f"""
            SELECT COUNT(*) FROM wide_faraway3
            WHERE {where_sql}
        """)
        
        result = await session.execute(data_sql, params)
        rows = result.fetchall()
        
        count_result = await session.execute(count_sql, {k: v for k, v in params.items() if k not in ['limit', 'offset']})
        total = count_result.scalar()
        
        data = []
        for row in rows:
            data.append({
                "學年度": row[0],
                "縣市名稱": row[1],
                "鄉鎮市區": row[2],
                "學生等級": row[3],
                "本校代碼": row[4],
                "本校名稱": row[5],
                "分校分班名稱": row[6],
                "公私立": row[7],
                "地區屬性": row[8],
                "班級數": row[9],
                "男學生數": row[10],
                "女學生數": row[11],
                "原住民學生比率": float(row[12]) if row[12] else None,
                "上學年男畢業生數": row[13],
                "上學年女畢業生數": row[14],
            })
        
        return {
            "data": data,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"獲取偏鄉學校資料失敗: {str(e)}"
        )


@router.get("/data/education-statistics")
async def get_education_statistics(
    page: int = 1,
    limit: int = 50,
    county: str = "",
    session: AsyncSession = Depends(get_session)
):
    """獲取教育統計資料 (wide_edu_B_1_4)"""
    from sqlalchemy import text
    
    try:
        offset = (page - 1) * limit
        
        where_sql = '"縣市別" ILIKE :county' if county else "1=1"
        params = {"limit": limit, "offset": offset, "county": f"%{county}%"}
        
        data_sql = text(f"""
            SELECT 
                "學年度", "縣市別",
                "幼兒園[人]", "國小[人]", "國中[人]",
                "高級中等學校-普通科[人]", "高級中等學校-專業群科[人]",
                "高級中等學校-綜合高中[人]", "高級中等學校-實用技能學程[人]",
                "高級中等學校-進修部[人]", "大專校院(全部計入校本部)[人]",
                "大專校院(跨縣市教學計入所在地縣市)[人]", "宗教研修學院[人]",
                "國民補習及大專進修學校及空大[人]", "特殊教育學校[人]"
            FROM "wide_edu_B_1_4"
            WHERE {where_sql}
            ORDER BY "學年度" DESC, "縣市別"
            LIMIT :limit OFFSET :offset
        """)
        
        count_sql = text(f"""
            SELECT COUNT(*) FROM "wide_edu_B_1_4"
            WHERE {where_sql}
        """)
        
        result = await session.execute(data_sql, params)
        rows = result.fetchall()
        
        count_result = await session.execute(count_sql, {"county": f"%{county}%"})
        total = count_result.scalar()
        
        data = []
        for row in rows:
            data.append({
                "學年度": row[0],
                "縣市別": row[1],
                "幼兒園": row[2],
                "國小": row[3],
                "國中": row[4],
                "高中普通科": row[5],
                "高中專業群科": row[6],
                "高中綜合高中": row[7],
                "高中實用技能學程": row[8],
                "高中進修部": row[9],
                "大專校院校本部": row[10],
                "大專校院跨縣市": row[11],
                "宗教研修學院": row[12],
                "國民補習及大專進修": row[13],
                "特殊教育學校": row[14],
            })
        
        return {
            "data": data,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"獲取教育統計資料失敗: {str(e)}"
        )


@router.get("/data/connected-devices")
async def get_connected_devices(
    page: int = 1,
    limit: int = 50,
    county: str = "",
    school_name: str = "",
    session: AsyncSession = Depends(get_session)
):
    """獲取學校電腦設備資料 (wide_connected_devices)"""
    from sqlalchemy import text
    
    try:
        offset = (page - 1) * limit
        
        where_clauses = []
        params = {"limit": limit, "offset": offset}
        
        if county:
            where_clauses.append('"縣市" ILIKE :county')
            params["county"] = f"%{county}%"
        
        if school_name:
            where_clauses.append('"學校名稱" ILIKE :school_name')
            params["school_name"] = f"%{school_name}%"
        
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        data_sql = text(f"""
            SELECT 
                "縣市", "縣市代碼", "鄉鎮市區",
                "學校名稱", "教學電腦數"
            FROM wide_connected_devices
            WHERE {where_sql}
            ORDER BY "縣市", "學校名稱"
            LIMIT :limit OFFSET :offset
        """)
        
        count_sql = text(f"""
            SELECT COUNT(*) FROM wide_connected_devices
            WHERE {where_sql}
        """)
        
        result = await session.execute(data_sql, params)
        rows = result.fetchall()
        
        count_result = await session.execute(count_sql, {k: v for k, v in params.items() if k not in ['limit', 'offset']})
        total = count_result.scalar()
        
        data = []
        for row in rows:
            data.append({
                "縣市": row[0],
                "縣市代碼": row[1],
                "鄉鎮市區": row[2],
                "學校名稱": row[3],
                "教學電腦數": row[4],
            })
        
        return {
            "data": data,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"獲取電腦設備資料失敗: {str(e)}"
        )


@router.get("/data/volunteer-teams")
async def get_volunteer_teams(
    page: int = 1,
    limit: int = 50,
    county: str = "",
    school: str = "",
    session: AsyncSession = Depends(get_session)
):
    """獲取資訊志工團隊資料 (wide_volunteer_teams)"""
    from sqlalchemy import text
    
    try:
        offset = (page - 1) * limit
        
        where_clauses = []
        params = {"limit": limit, "offset": offset}
        
        if county:
            where_clauses.append('"縣市" ILIKE :county')
            params["county"] = f"%{county}%"
        
        if school:
            where_clauses.append('("受服務單位" ILIKE :school OR "志工團隊學校" ILIKE :school)')
            params["school"] = f"%{school}%"
        
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        data_sql = text(f"""
            SELECT 
                "年度", "縣市", "受服務單位", "志工團隊學校"
            FROM wide_volunteer_teams
            WHERE {where_sql}
            ORDER BY "年度" DESC, "縣市", "受服務單位"
            LIMIT :limit OFFSET :offset
        """)
        
        count_sql = text(f"""
            SELECT COUNT(*) FROM wide_volunteer_teams
            WHERE {where_sql}
        """)
        
        result = await session.execute(data_sql, params)
        rows = result.fetchall()
        
        count_result = await session.execute(count_sql, {k: v for k, v in params.items() if k not in ['limit', 'offset']})
        total = count_result.scalar()
        
        data = []
        for row in rows:
            data.append({
                "年度": row[0],
                "縣市": row[1],
                "受服務單位": row[2],
                "志工團隊學校": row[3],
            })
        
        return {
            "data": data,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"獲取志工團隊資料失敗: {str(e)}"
        )


# ==================== Wide 資料統計 API ====================

@router.get("/data/statistics")
async def get_data_statistics(
    session: AsyncSession = Depends(get_session)
):
    """獲取所有 wide 表的統計資訊"""
    from sqlalchemy import text
    
    try:
        stats = {}
        
        # 偏鄉學校統計
        result = await session.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT "縣市名稱") as counties,
                SUM("班級數") as total_classes,
                SUM("男學生數[人]" + "女學生數[人]") as total_students
            FROM wide_faraway3
        """))
        row = result.fetchone()
        stats["faraway_schools"] = {
            "total_records": row[0],
            "counties": row[1],
            "total_classes": row[2],
            "total_students": row[3]
        }
        
        # 教育統計
        result = await session.execute(text("""
            SELECT COUNT(*) FROM "wide_edu_B_1_4"
        """))
        stats["education_statistics"] = {
            "total_records": result.scalar()
        }
        
        # 電腦設備統計
        result = await session.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT "縣市") as counties
            FROM wide_connected_devices
        """))
        row = result.fetchone()
        stats["connected_devices"] = {
            "total_records": row[0],
            "counties": row[1]
        }
        
        # 志工團隊統計
        result = await session.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT "縣市") as counties,
                COUNT(DISTINCT "志工團隊學校") as volunteer_schools
            FROM wide_volunteer_teams
        """))
        row = result.fetchone()
        stats["volunteer_teams"] = {
            "total_records": row[0],
            "counties": row[1],
            "volunteer_schools": row[2]
        }
        
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"獲取統計資料失敗: {str(e)}"
        )

# ==================== 學校需求相關 ====================

@router.get("/school_needs", response_model=List[NeedPublic])
async def get_school_needs(
    session: AsyncSession = Depends(get_session)
):
    """獲取所有學校需求（只包含真實用戶需求）"""
    needs = await get_all_needs(session)
    return [convert_need_to_public(need) for need in needs]


@router.get("/company_needs", response_model=List[NeedPublic])
async def get_company_needs(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_company_user)
):
    """獲取企業可查看的所有需求（包括模擬用戶需求）"""
    needs = await get_all_needs_for_companies(session)
    return [convert_need_to_public(need) for need in needs]


@router.get("/school_needs/{need_id}", response_model=NeedPublic)
async def get_school_need_by_id(
    need_id: str,
    session: AsyncSession = Depends(get_session)
):
    """獲取單個學校需求"""
    try:
        need_uuid = uuid.UUID(need_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid need ID format"
        )
    
    need = await get_need_by_id(session, need_uuid)
    if not need:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Need not found"
        )
    
    return convert_need_to_public(need)


@router.post("/school_needs", response_model=NeedPublic, status_code=status.HTTP_201_CREATED)
async def create_school_need(
    need_in: NeedCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_school_user)
):
    """創建新需求"""
    try:
        
        new_need = await create_need(session, need_in, current_user.id)
        
        return NeedPublic(
            id=new_need.id,
            school_id=new_need.school_id,
            title=new_need.title,
            description=new_need.description,
            category=new_need.category,
            location=new_need.location,
            student_count=new_need.student_count,
            image_url=new_need.image_url,
            urgency=new_need.urgency,
            sdgs=new_need.sdgs,
            status=new_need.status,
            created_at=new_need.created_at,
            updated_at=new_need.updated_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"創建需求失敗: {str(e)}"
        )


@router.put("/school_needs/{need_id}", response_model=NeedPublic)
async def update_school_need(
    need_id: str,
    need_in: NeedUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """更新需求"""
    try:
        need_uuid = uuid.UUID(need_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid need ID format"
        )
    
    db_need = await get_need_by_id(session, need_uuid)
    if not db_need:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Need not found"
        )
    
    if current_user.id != db_need.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this need"
        )
    
    updated_need = await update_need(session, db_need, need_in)
    return NeedPublic(
        id=updated_need.id,
        school_id=updated_need.school_id,
        title=updated_need.title,
        description=updated_need.description,
        category=updated_need.category,
        location=updated_need.location,
        student_count=updated_need.student_count,
        image_url=updated_need.image_url,
        urgency=updated_need.urgency,
        sdgs=updated_need.sdgs,
        status=updated_need.status,
        created_at=updated_need.created_at,
        updated_at=updated_need.updated_at
    )


@router.delete("/school_needs/{need_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_school_need(
    need_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """刪除需求"""
    try:
        need_uuid = uuid.UUID(need_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid need ID format"
        )
    
    db_need = await get_need_by_id(session, need_uuid)
    if not db_need:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Need not found"
        )
    
    if current_user.id != db_need.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this need"
        )
    
    await delete_need(session, db_need)
    return None


@router.get("/my_needs", response_model=List[NeedPublic])
async def get_my_needs(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_school_user)
):
    """獲取我的需求"""
    needs = await get_needs_by_school(session, current_user.id)
    return [convert_need_to_public(need) for need in needs]


# ==================== 儀表板統計 ====================

@router.get("/company_dashboard_stats", response_model=CompanyDashboardStats)
async def get_company_dashboard_stats(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_company_user)
):
    """獲取企業儀表板統計"""
    stats = await get_company_stats(session, current_user.id)
    return stats


@router.get("/school_dashboard_stats", response_model=SchoolDashboardStats)
async def get_school_dashboard_stats(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_school_user)
):
    """獲取學校儀表板統計"""
    stats = await get_school_stats(session, current_user.id)
    return SchoolDashboardStats(**stats)


@router.get("/platform_stats", response_model=PlatformStats)
async def get_platform_stats_endpoint(
    session: AsyncSession = Depends(get_session)
):
    """獲取平台整體統計數據"""
    stats = await get_platform_stats(session)
    return PlatformStats(**stats)


# ==================== AI 推薦需求 ====================

@router.get("/ai_recommended_needs", response_model=List[NeedPublic])
async def get_ai_recommended_needs(
    session: AsyncSession = Depends(get_session)
):
    """獲取 AI 推薦需求（只包含真實用戶需求）"""
    # 暫時返回所有真實需求，後續可以實現 AI 推薦邏輯
    needs = await get_all_needs(session)
    return [convert_need_to_public(need) for need in needs]


@router.get("/company_ai_recommended_needs", response_model=List[NeedPublic])
async def get_company_ai_recommended_needs(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_company_user)
):
    """獲取企業 AI 推薦需求（包括模擬用戶需求）"""
    # 暫時返回所有需求（包括模擬需求），後續可以實現 AI 推薦邏輯
    needs = await get_all_needs_for_companies(session)
    return [convert_need_to_public(need) for need in needs]


# ==================== 加入計劃 ====================

@router.post("/sponsor_need/{need_id}", response_model=DonationPublic, status_code=status.HTTP_201_CREATED)
async def sponsor_need(
    need_id: str,
    donation_data: dict,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_company_user)
):
    """企業加入計劃"""
    
    try:
        need_uuid = uuid.UUID(need_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid need ID format"
        )
    
    # 創建計劃記錄
    from app.schemas.donation_schemas import DonationCreate
    from app.crud.donation_crud import create_donation
    
    donation_create = DonationCreate(
        need_id=need_uuid,
        donation_type=donation_data.get("donation_type", "經費"),
        description=donation_data.get("description", "企業計劃專案")
    )
    
    donation = await create_donation(session, donation_create, current_user.id)
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add to plan"
        )
    
    return DonationPublic(
        id=donation.id,
        company_id=donation.company_id,
        need_id=donation.need_id,
        donation_type=donation.donation_type,
        description=donation.description,
        progress=donation.progress,
        status=donation.status,
        created_at=donation.created_at,
        updated_at=donation.updated_at
    )


# ==================== 最近專案 ====================

@router.get("/recent_projects")
async def get_recent_projects():
    """獲取最近專案"""
    # 暫時返回模擬數據，後續可以從數據庫獲取
    return RECENT_PROJECTS


# ==================== 影響力故事 ====================

@router.get("/impact_stories")
async def get_impact_stories():
    """獲取影響力故事"""
    # 暫時返回模擬數據，後續可以從數據庫獲取
    return IMPACT_STORIES


# ==================== 企業捐贈 ====================

@router.get("/company_donations", response_model=List[DonationPublic])
async def get_company_donations(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_company_user)
):
    """獲取企業捐贈記錄"""
    donations = await get_donations_by_company(session, current_user.id)
    return donations


# ==================== 最近活動 ====================

@router.get("/recent_activity", response_model=List[ActivityLogPublic])
async def get_recent_activity(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """獲取最近活動"""
    activities = await get_user_activity(session, current_user.id)
    return activities


# ==================== AI 智能探索 API (Proxy to AI Core) ====================

from pydantic import BaseModel
from typing import Optional
import httpx
import os

# AI Core 服務地址
AI_CORE_URL = os.getenv("AI_CORE_URL", "http://localhost:8000")

class AgentChatRequest(BaseModel):
    """AI 對話請求"""
    query: str
    session_id: Optional[str] = None

@router.post("/ai/agent")
async def chat_with_agent(
    request: AgentChatRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    與 AI Core 進行對話
    將請求轉發給獨立的 AI Core 服務
    """
    print(f"[API] 收到 AI 對話請求: {request.query}")
    
    try:
        async with httpx.AsyncClient() as client:
            # 呼叫 AI Core 服務
            response = await client.post(
                f"{AI_CORE_URL}/agent/query",
                json={
                    "query": request.query,
                    "session_id": request.session_id
                },
                timeout=120.0 # 給予足夠的時間讓 AI 思考與查詢
            )
            
            if response.status_code != 200:
                print(f"[API] AI Core 返回錯誤: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI Core Error: {response.text}"
                )
                
            result = response.json()
            return result
            
    except httpx.RequestError as e:
        print(f"[API] 連接 AI Core 失敗: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"無法連接到 AI Core 服務: {str(e)}"
        )
    except Exception as e:
        print(f"[API] 處理 AI 請求失敗: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 請求處理失敗: {str(e)}"
        )

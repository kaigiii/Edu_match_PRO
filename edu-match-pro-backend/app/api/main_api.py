"""
簡化的主 API 文件
包含所有前端需要的 API 端點
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.db import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.need_schemas import NeedPublic, NeedCreate, NeedUpdate
from app.schemas.dashboard_schemas import SchoolDashboardStats, CompanyDashboardStats
from app.schemas.donation_schemas import DonationPublic
from app.schemas.activity_log_schemas import ActivityLogPublic
from app.schemas.story_schemas import ImpactStoryPublic

from app.crud.need_crud import (
    create_need, get_need_by_id, get_needs_by_school, 
    get_all_needs, update_need, delete_need
)
from app.crud.dashboard_crud import get_school_dashboard_stats, get_company_dashboard_stats
from app.crud.donation_crud import get_donations_by_company
from app.crud.activity_log_crud import get_recent_activity

# 創建主路由器
router = APIRouter(tags=["Main API"])

# ==================== 健康檢查 ====================

@router.get("/health")
async def health_check():
    """健康檢查"""
    return {"status": "ok", "message": "Edu-Match-Pro API is running"}

# ==================== 學校需求相關 ====================

@router.get("/school_needs", response_model=List[NeedPublic])
async def get_school_needs(
    session: AsyncSession = Depends(get_session)
):
    """獲取所有學校需求"""
    needs = await get_all_needs(session)
    return [
        NeedPublic(
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
        for need in needs
    ]


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


@router.post("/school_needs", response_model=NeedPublic, status_code=status.HTTP_201_CREATED)
async def create_school_need(
    need_in: NeedCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """創建新需求"""
    if current_user.role != "school":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only schools can create needs"
        )
    
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
    current_user: User = Depends(get_current_user)
):
    """獲取我的需求"""
    if current_user.role != "school":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only school users can access their needs"
        )
    
    needs = await get_needs_by_school(session, current_user.id)
    return [
        NeedPublic(
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
        for need in needs
    ]


# ==================== 儀表板統計 ====================

@router.get("/company_dashboard_stats", response_model=CompanyDashboardStats)
async def get_company_dashboard_stats(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """獲取企業儀表板統計"""
    if current_user.role != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company users can access company dashboard"
        )
    
    stats = await get_company_dashboard_stats(session, current_user.id)
    return CompanyDashboardStats(**stats)


@router.get("/school_dashboard_stats", response_model=SchoolDashboardStats)
async def get_school_dashboard_stats(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """獲取學校儀表板統計"""
    if current_user.role != "school":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only school users can access school dashboard"
        )
    
    stats = await get_school_dashboard_stats(session, current_user.id)
    return SchoolDashboardStats(**stats)


# ==================== AI 推薦需求 ====================

@router.get("/ai_recommended_needs", response_model=List[NeedPublic])
async def get_ai_recommended_needs(
    session: AsyncSession = Depends(get_session)
):
    """獲取 AI 推薦需求"""
    # 暫時返回所有需求，後續可以實現 AI 推薦邏輯
    needs = await get_all_needs(session)
    return [
        NeedPublic(
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
        for need in needs
    ]


# ==================== 最近專案 ====================

@router.get("/recent_projects")
async def get_recent_projects():
    """獲取最近專案"""
    # 暫時返回模擬數據，後續可以從數據庫獲取
    return [
        {
            "id": "project-001",
            "title": "數位設備捐贈專案",
            "school": "台東縣太麻里國小",
            "status": "completed",
            "progress": 100,
            "studentsBenefited": 120,
            "completionDate": "2024-01-15"
        },
        {
            "id": "project-002", 
            "title": "圖書資源支援專案",
            "school": "花蓮縣秀林國中",
            "status": "in_progress",
            "progress": 75,
            "studentsBenefited": 85,
            "completionDate": None
        }
    ]


# ==================== 影響力故事 ====================

@router.get("/impact_stories")
async def get_impact_stories():
    """獲取影響力故事"""
    # 暫時返回模擬數據，後續可以從數據庫獲取
    return [
        {
            "id": "story-001",
            "title": "數位教育改變偏鄉學童未來",
            "schoolName": "台東縣太麻里國小",
            "companyName": "科技公司",
            "imageUrl": "/images/impact-stories/background-wall/01.jpg",
            "summary": "透過平板電腦捐贈，提升偏鄉學童數位學習能力...",
            "storyDate": "2024-01-01",
            "impact": {
                "studentsBenefited": 120,
                "equipmentDonated": "平板電腦 50 台",
                "duration": "3 個月"
            }
        }
    ]


# ==================== 企業捐贈 ====================

@router.get("/company_donations", response_model=List[DonationPublic])
async def get_company_donations(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """獲取企業捐贈記錄"""
    if current_user.role != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company users can access donations"
        )
    
    donations = await get_donations_by_company(session, current_user.id)
    return donations


# ==================== 最近活動 ====================

@router.get("/recent_activity", response_model=List[ActivityLogPublic])
async def get_recent_activity(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """獲取最近活動"""
    activities = await get_recent_activity(session, current_user.id)
    return activities

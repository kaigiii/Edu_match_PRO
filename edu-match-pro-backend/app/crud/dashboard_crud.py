import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.need import Need, NeedStatus
from app.models.donation import Donation, DonationStatus


async def _get_need_stats(session: AsyncSession, school_id: uuid.UUID = None, company_id: uuid.UUID = None) -> Dict[str, int]:
    """獲取需求統計數據的通用函數"""
    base_query = select(Need)
    if school_id:
        base_query = base_query.where(Need.school_id == school_id)
    
    # 總需求數
    total_result = await session.execute(
        select(func.count(Need.id)).where(base_query.where() if school_id else Need.id.isnot(None))
    )
    total = total_result.scalar() or 0
    
    # 活躍需求數
    active_result = await session.execute(
        select(func.count(Need.id)).where(
            base_query.where() if school_id else Need.id.isnot(None),
            Need.status == NeedStatus.active
        )
    )
    active = active_result.scalar() or 0
    
    # 已完成需求數
    completed_result = await session.execute(
        select(func.count(Need.id)).where(
            base_query.where() if school_id else Need.id.isnot(None),
            Need.status == NeedStatus.completed
        )
    )
    completed = completed_result.scalar() or 0
    
    # 受益學生數
    students_result = await session.execute(
        select(func.coalesce(func.sum(Need.student_count), 0)).where(
            base_query.where() if school_id else Need.id.isnot(None),
            Need.status == NeedStatus.completed
        )
    )
    students = students_result.scalar() or 0
    
    return {
        "total": total,
        "active": active,
        "completed": completed,
        "students": students
    }


async def get_school_dashboard_stats(session: AsyncSession, school_id: uuid.UUID) -> Dict[str, Any]:
    """獲取學校儀表板統計數據"""
    
    # 串行查詢所有統計數據（避免 SQLAlchemy 並行問題）
    # 查詢總需求數
    total_needs_result = await session.execute(
        select(func.count(Need.id)).where(Need.school_id == school_id)
    )
    total_needs = total_needs_result.scalar() or 0
    
    # 查詢活躍需求數
    active_needs_result = await session.execute(
        select(func.count(Need.id)).where(
            Need.school_id == school_id,
            Need.status == NeedStatus.active
        )
    )
    active_needs = active_needs_result.scalar() or 0
    
    # 查詢已完成需求數
    completed_needs_result = await session.execute(
        select(func.count(Need.id)).where(
            Need.school_id == school_id,
            Need.status == NeedStatus.completed
        )
    )
    completed_needs = completed_needs_result.scalar() or 0
    
    # 查詢受益學生數（已完成需求的學生數總和）
    students_benefited_result = await session.execute(
        select(func.coalesce(func.sum(Need.student_count), 0)).where(
            Need.school_id == school_id,
            Need.status == NeedStatus.completed
        )
    )
    students_benefited = students_benefited_result.scalar() or 0
    
    return {
        "totalNeeds": total_needs,
        "activeNeeds": active_needs,
        "completedNeeds": completed_needs,
        "studentsBenefited": students_benefited,
        "avgResponseTime": 0,  # 暫時設為 0，需要更複雜的計算
        "successRate": round((completed_needs / total_needs * 100) if total_needs > 0 else 0, 2)
    }


async def get_company_dashboard_stats(session: AsyncSession, company_id: uuid.UUID) -> Dict[str, Any]:
    """獲取企業儀表板統計數據（優化版本）"""
    
    try:
        # 優化：使用 JOIN 查詢一次性獲取所有關聯數據，避免 N+1 查詢
        result = await session.execute(
            select(Donation, Need)
            .join(Need, Donation.need_id == Need.id)
            .where(Donation.company_id == company_id)
        )
        donations_with_needs = result.all()
        
        # 分離數據
        donations = [row[0] for row in donations_with_needs]
        needs = [row[1] for row in donations_with_needs]
        
        # 計算基本統計
        total_donations = len(donations)
        completed_donations = len([d for d in donations if d.status == DonationStatus.completed])
        
        # 計算受惠學生數和 SDG 貢獻（優化版本）
        students_helped = 0
        sdg_contributions = {}
        
        # 創建 need_id 到 need 的映射，避免重複查詢
        need_map = {need.id: need for need in needs}
        
        for donation in donations:
            if donation.status == DonationStatus.completed:
                need = need_map.get(donation.need_id)
                if need:
                    students_helped += need.student_count
                    
                    # 統計 SDG 貢獻
                    if need.sdgs:
                        for sdg in need.sdgs:
                            sdg_key = str(sdg)
                            sdg_contributions[sdg_key] = sdg_contributions.get(sdg_key, 0) + 1
        
        # 計算平均專案天數
        completed_with_dates = [
            d for d in donations 
            if d.status == DonationStatus.completed and d.created_at and d.updated_at
        ]
        
        avg_project_duration = 0
        if completed_with_dates:
            total_days = sum([
                (d.updated_at - d.created_at).days 
                for d in completed_with_dates
            ])
            avg_project_duration = total_days // len(completed_with_dates)
        
        # 計算成功率
        success_rate = (completed_donations / total_donations * 100) if total_donations > 0 else 0
        
        return {
            "completedProjects": completed_donations,
            "studentsHelped": students_helped,
            "totalDonation": 0,  # 暫時設為 0，需要添加金額字段
            "volunteerHours": 0,  # 暫時設為 0，需要添加志工時數字段
            "avgProjectDuration": avg_project_duration,
            "successRate": round(success_rate, 2),
            "sdgContributions": sdg_contributions
        }
        
    except Exception as e:
        print(f"查詢企業統計數據時發生錯誤: {e}")
        # 返回默認值
        return {
            "completedProjects": 0,
            "studentsHelped": 0,
            "totalDonation": 0,
            "volunteerHours": 0,
            "avgProjectDuration": 0,
            "successRate": 0,
            "sdgContributions": {}
        }


async def get_platform_stats(session: AsyncSession) -> Dict[str, Any]:
    """獲取平台整體統計數據"""
    
    try:
        # 串行查詢所有統計數據（避免 SQLAlchemy 並行問題）
        # 查詢總學校數（有需求的學校）
        total_schools_result = await session.execute(
            select(func.count(func.distinct(Need.school_id)))
        )
        total_schools = total_schools_result.scalar() or 0
        
        # 查詢總需求數
        total_needs_result = await session.execute(
            select(func.count(Need.id))
        )
        total_needs = total_needs_result.scalar() or 0
        
        # 查詢已完成捐贈數
        completed_donations_result = await session.execute(
            select(func.count(Donation.id)).where(Donation.status == DonationStatus.completed)
        )
        completed_donations = completed_donations_result.scalar() or 0
        
        # 查詢受益學生數（已完成需求的學生數總和）
        students_benefited_result = await session.execute(
            select(func.coalesce(func.sum(Need.student_count), 0)).where(
                Need.status == NeedStatus.completed
            )
        )
        students_benefited = students_benefited_result.scalar() or 0
        
        # 計算配對成功率
        success_rate = round((completed_donations / total_needs * 100) if total_needs > 0 else 0, 2)
        
        return {
            "schoolsWithNeeds": total_schools,
            "completedMatches": completed_donations,
            "studentsBenefited": students_benefited,
            "successRate": success_rate
        }
        
    except Exception as e:
        print(f"查詢平台統計數據時發生錯誤: {e}")
        # 返回默認值
        return {
            "schoolsWithNeeds": 0,
            "completedMatches": 0,
            "studentsBenefited": 0,
            "successRate": 0
        }

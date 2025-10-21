import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.donation import Donation, DonationStatus
from app.models.need import Need, NeedStatus
from app.models.activity_log import ActivityType
from app.schemas.donation_schemas import DonationCreate
from app.crud.activity_log_crud import create_activity_log
from app.crud.base_crud import BaseCRUD

# 創建 Donation CRUD 實例
donation_crud = BaseCRUD(Donation)


async def create_donation(session: AsyncSession, donation_in: DonationCreate, company_id: uuid.UUID) -> Optional[Donation]:
    """建立新的捐贈專案"""
    # 查詢關聯的 Need，使用 with_for_update 來鎖定記錄
    need_result = await session.execute(
        select(Need).where(Need.id == donation_in.need_id).with_for_update()
    )
    need = need_result.scalar_one_or_none()
    
    # 檢查 Need 是否存在
    if not need:
        return None
    
    # 檢查 Need 狀態是否為 active 或 in_progress
    if need.status not in [NeedStatus.active, NeedStatus.in_progress]:
        return None
    
    # 更新 Need 狀態為 in_progress
    need.status = NeedStatus.in_progress
    
    # 建立新的 Donation 物件
    db_donation = Donation(
        company_id=company_id,
        need_id=donation_in.need_id,
        donation_type=donation_in.donation_type,
        description=donation_in.description,
        status=DonationStatus.pending,
        progress=0
    )
    
    # 將 Donation 物件加入 session
    session.add(db_donation)
    
    # 提交交易
    await session.commit()
    await session.refresh(db_donation)
    
    # 記錄活動日誌 - 為企業和學校都記錄
    await create_activity_log(
        session=session,
        user_id=company_id,
        activity_type=ActivityType.donation_created,
        description=f"企業認捐了需求：{need.title}",
        extra_data=f'{{"donation_id": "{db_donation.id}", "need_id": "{need.id}"}}'
    )
    
    await create_activity_log(
        session=session,
        user_id=need.school_id,
        activity_type=ActivityType.donation_created,
        description=f"需求被企業認捐：{need.title}",
        extra_data=f'{{"donation_id": "{db_donation.id}", "need_id": "{need.id}"}}'
    )
    
    return db_donation


async def get_donations_by_company(session: AsyncSession, company_id: uuid.UUID) -> List[Donation]:
    """獲取特定企業的所有捐贈專案"""
    result = await session.execute(
        select(Donation)
        .where(Donation.company_id == company_id)
        .options(
            selectinload(Donation.need),
            selectinload(Donation.company)
        )
        .order_by(Donation.created_at.desc())
    )
    return result.scalars().all()


async def get_donation_by_id(session: AsyncSession, donation_id: uuid.UUID) -> Optional[Donation]:
    """根據 ID 獲取捐贈專案"""
    result = await session.execute(
        select(Donation)
        .where(Donation.id == donation_id)
        .options(
            selectinload(Donation.need),
            selectinload(Donation.company)
        )
    )
    return result.scalar_one_or_none()


async def update_donation_progress(session: AsyncSession, donation_id: uuid.UUID, progress: int) -> Optional[Donation]:
    """更新捐贈專案進度"""
    result = await session.execute(
        select(Donation).where(Donation.id == donation_id).with_for_update()
    )
    donation = result.scalar_one_or_none()
    
    if not donation:
        return None
    
    # 更新進度
    donation.progress = progress
    
    # 如果進度達到 100%，標記為完成
    if progress >= 100:
        donation.status = DonationStatus.completed
        donation.completion_date = datetime.utcnow()
    
    await session.commit()
    await session.refresh(donation)
    
    return donation

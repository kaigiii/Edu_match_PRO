"""
統一的 CRUD 基礎類
提供通用的數據庫操作和錯誤處理
"""
import uuid
from typing import TypeVar, Generic, List, Optional, Type, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError, NoResultFound
from fastapi import HTTPException, status
from app.models.base import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class BaseCRUD(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """統一的 CRUD 基礎類"""
    
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    async def get(self, session: AsyncSession, id: uuid.UUID) -> Optional[ModelType]:
        """根據 ID 獲取單個記錄"""
        try:
            result = await session.execute(
                select(self.model).where(self.model.id == id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get {self.model.__name__}: {str(e)}"
            )
    
    async def get_multi(
        self, 
        session: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        joins: Optional[List[Any]] = None
    ) -> List[ModelType]:
        """獲取多個記錄（優化版本）"""
        try:
            query = select(self.model)
            
            # 應用 JOIN 查詢（性能優化）
            if joins:
                for join_model in joins:
                    query = query.join(join_model)
            
            # 應用過濾條件
            if filters:
                for key, value in filters.items():
                    if hasattr(self.model, key):
                        query = query.where(getattr(self.model, key) == value)
            
            # 應用排序
            if order_by:
                if hasattr(self.model, order_by):
                    query = query.order_by(getattr(self.model, order_by).desc())
            else:
                query = query.order_by(self.model.created_at.desc())
            
            # 應用分頁
            query = query.offset(skip).limit(limit)
            
            result = await session.execute(query)
            return result.scalars().all()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get {self.model.__name__} list: {str(e)}"
            )
    
    async def create(self, session: AsyncSession, obj_in: CreateSchemaType) -> ModelType:
        """創建新記錄"""
        try:
            # 將 Pydantic 模型轉換為 SQLModel 實例
            if hasattr(obj_in, 'dict'):
                obj_data = obj_in.dict()
            else:
                obj_data = obj_in
            
            db_obj = self.model(**obj_data)
            session.add(db_obj)
            await session.commit()
            await session.refresh(db_obj)
            return db_obj
        except IntegrityError as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Data integrity error: {str(e)}"
            )
        except Exception as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create {self.model.__name__}: {str(e)}"
            )
    
    async def update(
        self, 
        session: AsyncSession, 
        db_obj: ModelType, 
        obj_in: UpdateSchemaType
    ) -> ModelType:
        """更新記錄"""
        try:
            if hasattr(obj_in, 'dict'):
                update_data = obj_in.dict(exclude_unset=True)
            else:
                update_data = obj_in
            
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            await session.commit()
            await session.refresh(db_obj)
            return db_obj
        except Exception as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update {self.model.__name__}: {str(e)}"
            )
    
    async def delete(self, session: AsyncSession, id: uuid.UUID) -> bool:
        """刪除記錄"""
        try:
            result = await session.execute(
                select(self.model).where(self.model.id == id)
            )
            db_obj = result.scalar_one_or_none()
            
            if not db_obj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"{self.model.__name__} not found"
                )
            
            await session.delete(db_obj)
            await session.commit()
            return True
        except HTTPException:
            raise
        except Exception as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete {self.model.__name__}: {str(e)}"
            )
    
    async def count(self, session: AsyncSession, filters: Optional[Dict[str, Any]] = None) -> int:
        """統計記錄數量"""
        try:
            query = select(func.count(self.model.id))
            
            if filters:
                for key, value in filters.items():
                    if hasattr(self.model, key):
                        query = query.where(getattr(self.model, key) == value)
            
            result = await session.execute(query)
            return result.scalar() or 0
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to count {self.model.__name__}: {str(e)}"
            )
    
    async def exists(self, session: AsyncSession, id: uuid.UUID) -> bool:
        """檢查記錄是否存在"""
        try:
            result = await session.execute(
                select(self.model.id).where(self.model.id == id)
            )
            return result.scalar_one_or_none() is not None
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to check {self.model.__name__} existence: {str(e)}"
            )

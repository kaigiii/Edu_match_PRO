"""
統一的異常處理
"""
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, NoResultFound
import logging

logger = logging.getLogger(__name__)


class EduMatchProException(Exception):
    """自定義基礎異常類"""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(EduMatchProException):
    """數據驗證錯誤"""
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)


class NotFoundError(EduMatchProException):
    """資源未找到錯誤"""
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class UnauthorizedError(EduMatchProException):
    """未授權錯誤"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(EduMatchProException):
    """禁止訪問錯誤"""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


class ConflictError(EduMatchProException):
    """資源衝突錯誤"""
    def __init__(self, message: str):
        super().__init__(message, status.HTTP_409_CONFLICT)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """全局異常處理器"""
    
    # 記錄異常
    logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}", exc_info=True)
    
    # 處理自定義異常
    if isinstance(exc, EduMatchProException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.message,
                "type": type(exc).__name__,
                "status_code": exc.status_code
            }
        )
    
    # 處理 SQLAlchemy 異常
    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "Data integrity violation",
                "type": "IntegrityError",
                "status_code": status.HTTP_400_BAD_REQUEST
            }
        )
    
    if isinstance(exc, NoResultFound):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": "Resource not found",
                "type": "NoResultFound",
                "status_code": status.HTTP_404_NOT_FOUND
            }
        )
    
    # 處理 FastAPI HTTP 異常
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "type": "HTTPException",
                "status_code": exc.status_code
            }
        )
    
    # 處理其他未知異常
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "type": "InternalServerError",
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
        }
    )


def create_error_response(
    message: str, 
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    error_type: str = "Error"
) -> HTTPException:
    """創建標準化的錯誤響應"""
    return HTTPException(
        status_code=status_code,
        detail={
            "error": message,
            "type": error_type,
            "status_code": status_code
        }
    )

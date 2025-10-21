from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.main_api import router as main_router
from app.api.auth_api import router as auth_router
from app.core.exceptions import EduMatchProException, global_exception_handler
from app.core.config import settings

app = FastAPI(title="Edu-Match-Pro API", version="1.0.0")

# 設定 CORS（優化版本）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # 使用配置中的 CORS 來源
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# 添加全局異常處理器
app.add_exception_handler(EduMatchProException, global_exception_handler)

# 包含 API 路由 (直接掛載到根路徑)
app.include_router(main_router)
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Edu-Match-Pro API"}

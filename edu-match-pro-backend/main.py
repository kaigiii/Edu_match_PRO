from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.main_api import router as main_router
from app.api.auth_api import router as auth_router
from app.core.exceptions import EduMatchProException, global_exception_handler
from app.core.config import settings

app = FastAPI(title="Edu-Match-Pro API", version="1.0.0")

# 設定 CORS（使用配置文件中的設定）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # 使用配置中的 CORS 來源
    allow_credentials=True,
    allow_methods=["*"],  # 允許所有 HTTP 方法，包括 OPTIONS (preflight)
    allow_headers=["*"],  # 允許所有 headers，確保瀏覽器發送的所有 headers 都被接受
    expose_headers=["*"],  # 暴露所有 headers
    max_age=600,  # preflight 請求緩存時間（秒）
)

# 添加全局異常處理器
app.add_exception_handler(EduMatchProException, global_exception_handler)

# 包含 API 路由 (直接掛載到根路徑)
app.include_router(main_router)
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Edu-Match-Pro API"}

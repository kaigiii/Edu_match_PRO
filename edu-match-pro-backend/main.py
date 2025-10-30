from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.main_api import router as main_router
from app.api.auth_api import router as auth_router
from app.core.exceptions import EduMatchProException, global_exception_handler
from app.core.config import settings

app = FastAPI(title="Edu-Match-Pro API", version="1.0.0")

origins = [
    # 必須加入您的 ngrok 前端網址
    "https://charlesetta-indignant-horacio.ngrok-free.dev", 
    'https://pedigreed-uncompulsively-reece.ngrok-free.dev', #後端（這列可刪除）

    # (可選) 您本地的前端網址，方便本地開發
    "http://localhost:5173", 
]

# 設定 CORS（優化版本）
app.add_middleware(
    CORSMiddleware,
    #allow_origins=settings.cors_origins,  # 使用配置中的 CORS 來源
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # 允許所有 HTTP 方法，包括 OPTIONS (preflight)
    allow_headers=["*"],  # 允許所有 headers，確保瀏覽器發送的所有 headers 都被接受
    expose_headers=["X-Process-Time"],  # 只暴露必要的 headers
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

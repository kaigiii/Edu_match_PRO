from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.main_api import router as main_router
from app.api.auth_api import router as auth_router

app = FastAPI(title="Edu-Match-Pro API", version="1.0.0")

# 設定 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174"
    ],  # 前端開發伺服器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含 API 路由 (直接掛載到根路徑)
app.include_router(main_router)
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Edu-Match-Pro API"}

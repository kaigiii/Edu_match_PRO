from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, needs, donations, dashboard, stories, activity, frontend_compat

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

# 包含 API 路由
app.include_router(auth.router, prefix="/api/v1")
app.include_router(needs.router, prefix="/api/v1")
app.include_router(donations.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(stories.router, prefix="/api/v1")
app.include_router(activity.router, prefix="/api/v1")

# 前端兼容性路由 (直接掛載到根路徑)
app.include_router(frontend_compat.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Edu-Match-Pro API"}

from fastapi import FastAPI, Depends, HTTPException
from app.database import get_db
from app.models import AgentQueryRequest, AgentQueryResponse
from app.agents.coordinator import coordinator_agent
from app.context import db_session_var
from app.core.session import session_manager
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict

# 初始化 FastAPI 應用程式
app = FastAPI(title="Taiwan Rural Education Impact Agent")

@app.post("/agent/query", response_model=AgentQueryResponse)
async def query_agent(request: AgentQueryRequest, db: AsyncSession = Depends(get_db)):
    """
    代理人查詢接口 (Agent Query Endpoint)
    
    接收使用者的查詢請求，將其轉發給協調者代理人 (Coordinator Agent)，
    並返回代理人的回應。
    
    此接口使用 ContextVar 來傳遞資料庫連線 (AsyncSession)，
    確保在深層的工具調用中也能安全地訪問資料庫。
    
    Args:
        request (AgentQueryRequest): 包含使用者查詢字串的請求物件。
        db (AsyncSession): 由依賴注入提供的資料庫連線。
        
    Returns:
        AgentQueryResponse: 包含代理人回應文字的回應物件。
    """
    try:
        # 設定 ContextVar
        # 將當前的資料庫連線存入 db_session_var，供後續工具調用使用
        token = db_session_var.set(db)
        try:
            # 取得或建立 Agent Session
            agent = coordinator_agent # Default to global (legacy fallback)
            if request.session_id:
                agent = session_manager.get_or_create_session(request.session_id)
                
            # 發送訊息給協調者代理人
            # 代理人會根據需要調用工具 (如 SQL 查詢)，這些工具會從 ContextVar 中獲取 db session
            response = await agent.send_message(request.query)
            return AgentQueryResponse(response=response.text)
        finally:
            # 重置 ContextVar
            # 請求結束後，務必重置變數，避免污染其他請求的 Context
            db_session_var.reset(token)
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # 啟動開發伺服器
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

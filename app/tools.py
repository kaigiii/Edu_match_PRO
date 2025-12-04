from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import re

from app.context import db_session_var

async def execute_education_query(sql_query: str):
    """
    執行教育數據庫查詢 (Execute Education Database Query)
    
    這是一個唯讀 (Read-Only) 的 SQL 查詢工具，用於從教育數據庫中檢索數據。
    它包含安全檢查以防止破壞性操作 (如 DROP, DELETE 等)。
    
    Args:
        sql_query (str): 要執行的 SQL 查詢語句。
        
    Returns:
        str: 查詢結果的字串表示 (通常是 list of tuples)，或者錯誤訊息。
    """
    # 0. 獲取資料庫連線 (Get Session)
    # 從 ContextVar 中獲取當前請求的資料庫連線
    session = db_session_var.get()
    if not session:
        return "Error: No database session available."

    # 1. 安全檢查 (Security Check)
    # 禁止執行任何可能修改或刪除數據的 SQL 指令
    forbidden_keywords = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE", "GRANT", "REVOKE"]
    if any(keyword in sql_query.upper() for keyword in forbidden_keywords):
        return "Error: Only SELECT queries are allowed."
    
    # 2. 執行查詢 (Execute Query)
    try:
        result = await session.execute(text(sql_query))
        rows = result.fetchall()
        print(f"DEBUG: execute_education_query result: {rows}")
        return str(rows)
    except Exception as e:
        print(f"DEBUG: execute_education_query error: {e}")
        # 如果發生錯誤 (例如交易失敗)，嘗試回滾 (Rollback) 以避免影響後續操作
        try:
            await session.rollback()
        except Exception as rollback_error:
            print(f"DEBUG: Rollback failed: {rollback_error}")
        return f"Error executing SQL: {e}"

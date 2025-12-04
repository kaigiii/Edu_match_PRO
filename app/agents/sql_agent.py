from app.agents.base import BaseAgent
from app.tools import execute_education_query
from app.core.prompts import SQL_SYSTEM_PROMPT
from app.core.config import MODEL_NAME

class SQLAgent(BaseAgent):
    """
    SQL 專家代理人 (SQL Specialist Agent)
    
    專門負責將自然語言問題轉換為 PostgreSQL 查詢語句，
    並執行查詢以獲取數據。
    """
    def __init__(self):
        super().__init__(
            system_instruction=SQL_SYSTEM_PROMPT,
            tools=[execute_education_query],
            model_name=MODEL_NAME,
            name="SQLAgent"
        )

# 初始化 SQL 專家代理人實例
sql_agent = SQLAgent()

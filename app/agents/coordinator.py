from app.agents.base import BaseAgent
from app.agents.sql_agent import sql_agent
# from app.agents.analysis_agent import analysis_agent # Deprecated
from app.agents.strategy_agents import strategy_agent_a, strategy_agent_b, strategy_agent_c
from app.core.prompts import COORDINATOR_SYSTEM_PROMPT
from app.core.config import MODEL_NAME
from app.context import last_sql_result_var
import asyncio

async def ask_sql_specialist(question: str):
    """
    詢問 SQL 專家 (Ask SQL Specialist)
    
    此函數作為工具提供給協調者代理人使用。
    它將自然語言問題轉發給 SQL 專家代理人，並返回查詢結果。
    
    Args:
        question (str): 要詢問 SQL 專家的問題 (e.g., "南投縣有多少學校?")
        
    Returns:
        str: SQL 專家的回答 (包含查詢到的數據)
    """
    print(f"Coordinator asking SQL Agent: {question}")
    response = await sql_agent.send_message(question)
    print(f"SQL Agent response: {response.text}")
    
    # 儲存結果到 ContextVar (Thread-safe / Async-safe)
    last_sql_result_var.set(response.text)
    return response.text

async def generate_comprehensive_proposal(context: str):
    """
    生成綜合提案 (Generate Comprehensive Proposal)
    
    當收集到足夠的數據後，調用此函數。
    它會並行諮詢三位策略專家 (A/B/C)，並將結果整合成一份完整的報告。
    
    Args:
        context (str): 包含使用者需求與 SQL 查詢結果的上下文資訊。
        
    Returns:
        str: 包含三個方案的完整報告。
    """
    # 從 ContextVar 獲取最新的 SQL 結果
    sql_result = last_sql_result_var.get()
    
    # 自動附加最新的 SQL 結果
    full_context = f"{context}\n\n[SYSTEM INJECTED SQL DATA]:\n{sql_result}"
    
    print(f"Coordinator orchestrating Strategy Agents with context length: {len(full_context)}")
    
    # 為了避免觸發 API Rate Limit (429 Too Many Requests)，改為順序執行並加入延遲
    
    # Strategy A
    print("Calling Strategy Agent A...")
    response_a_obj = await strategy_agent_a.send_message(full_context)
    response_a = response_a_obj.text
    await asyncio.sleep(1) # 休息 1 秒
    
    # Strategy B
    print("Calling Strategy Agent B...")
    response_b_obj = await strategy_agent_b.send_message(full_context)
    response_b = response_b_obj.text
    await asyncio.sleep(1) # 休息 1 秒
    
    # Strategy C
    print("Calling Strategy Agent C...")
    response_c_obj = await strategy_agent_c.send_message(full_context)
    response_c = response_c_obj.text
    
    print("All Strategy Agents responded.")
    
    # 組合最終報告
    final_report = f"""
### 專業捐贈策略分析報告

根據您的需求與資料庫分析，我們為您規劃了以下三個具體方案：

{response_a}

---

{response_b}

---

{response_c}

---
---
希望這份分析報告能協助您做出最好的捐贈決策。感謝您的愛心！
"""
    return final_report

class CoordinatorAgent(BaseAgent):
    """
    協調者代理人 (Coordinator Agent)
    
    負責與使用者互動，理解需求，並指揮 SQL 專家獲取數據。
    最後根據數據制定捐款計畫。
    """
    def __init__(self):
        super().__init__(
            system_instruction=COORDINATOR_SYSTEM_PROMPT,
            tools=[ask_sql_specialist, generate_comprehensive_proposal],
            model_name=MODEL_NAME,
            name="CoordinatorAgent"
        )

# 初始化協調者代理人實例
coordinator_agent = CoordinatorAgent()

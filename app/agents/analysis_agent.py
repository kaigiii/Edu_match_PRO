from app.agents.base import BaseAgent
from app.core.prompts import ANALYSIS_SYSTEM_PROMPT
from app.core.config import MODEL_NAME

class AnalysisAgent(BaseAgent):
    """
    解析代理人 (Analysis Agent)
    
    負責接收協調者提供的「使用者需求」與「SQL 查詢結果」，
    並根據「三方案架構」制定捐款策略。
    """
    def __init__(self):
        super().__init__(
            system_instruction=ANALYSIS_SYSTEM_PROMPT,
            tools=[], # 解析代理人不需要額外工具，純粹做邏輯分析
            model_name=MODEL_NAME,
            name="AnalysisAgent"
        )

# 初始化解析代理人實例
analysis_agent = AnalysisAgent()

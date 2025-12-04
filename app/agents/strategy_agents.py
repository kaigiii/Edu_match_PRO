from app.agents.base import BaseAgent
from app.core.prompts import STRATEGY_A_PROMPT, STRATEGY_B_PROMPT, STRATEGY_C_PROMPT
from app.core.config import MODEL_NAME

class StrategyAgentA(BaseAgent):
    """
    策略代理人 A (集中火力型)
    """
    def __init__(self):
        super().__init__(
            system_instruction=STRATEGY_A_PROMPT,
            tools=[],
            model_name=MODEL_NAME,
            name="StrategyAgentA"
        )

class StrategyAgentB(BaseAgent):
    """
    策略代理人 B (區域共好型)
    """
    def __init__(self):
        super().__init__(
            system_instruction=STRATEGY_B_PROMPT,
            tools=[],
            model_name=MODEL_NAME,
            name="StrategyAgentB"
        )

class StrategyAgentC(BaseAgent):
    """
    策略代理人 C (雪中送炭型)
    """
    def __init__(self):
        super().__init__(
            system_instruction=STRATEGY_C_PROMPT,
            tools=[],
            model_name=MODEL_NAME,
            name="StrategyAgentC"
        )

# 初始化實例
strategy_agent_a = StrategyAgentA()
strategy_agent_b = StrategyAgentB()
strategy_agent_c = StrategyAgentC()

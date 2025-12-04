import google.generativeai as genai
import os
from typing import List, Optional, Callable, Any

class BaseAgent:
    """
    代理人基類 (Base Agent Class)
    
    封裝了 Google Generative AI 模型的初始化和對話管理。
    特別實現了手動工具調用循環 (Manual Tool Execution Loop)，以支持異步工具 (Async Tools)。
    """
    def __init__(self, system_instruction: str, tools: Optional[List[Callable]] = None, model_name: str = "gemini-2.0-flash", name: str = "BaseAgent"):
        """
        初始化代理人 (Initialize Agent)
        
        Args:
            system_instruction (str): 系統提示詞 (System Prompt)，定義代理人的角色和行為。
            tools (Optional[List[Callable]]): 可供代理人使用的工具函數列表。
            model_name (str): 使用的模型名稱，預設為 "gemini-2.0-flash"。
            name (str): 代理人名稱 (僅用於識別，不影響邏輯)。
        """
        self.name = name
        # 建立工具映射表 (Tools Map)，方便後續根據函數名稱查找對應的函數物件
        self.tools_map = {t.__name__: t for t in (tools or [])}
        
        # 初始化 Generative Model
        self.model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_instruction,
            tools=tools
        )
        
        # 啟動對話 (Start Chat)
        # 注意: 我們將 enable_automatic_function_calling 設為 False，
        # 因為我們需要手動處理異步工具調用。
        self.chat = self.model.start_chat(enable_automatic_function_calling=False)

    async def send_message(self, message: str) -> Any:
        """
        發送訊息給代理人 (Send Message to Agent)
        
        發送使用者訊息，並處理可能產生的工具調用 (Function Calls)。
        如果代理人決定調用工具，此函數會執行該工具並將結果回傳給代理人，
        直到代理人產生最終的文字回應。
        
        Args:
            message (str): 使用者的輸入訊息。
            
        Returns:
            Any: 代理人的最終回應物件 (包含 text 屬性)。
        """
        response = await self.chat.send_message_async(message)
        
        # 工具調用處理循環 (Tool Execution Loop)
        while True:
            # 檢查回應是否包含候選內容 (Candidates) 和部分 (Parts)
            if not response.candidates or not response.candidates[0].content.parts:
                return response

            # 尋找包含 Function Call 的部分
            function_call_part = None
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    function_call_part = part
                    break
            
            # 如果有 Function Call，則執行對應的工具
            if function_call_part:
                function_call = function_call_part.function_call
                function_name = function_call.name
                function_args = function_call.args
                
                print(f"DEBUG: Agent {self.name} received function call: {function_name}")
                
                if function_name in self.tools_map:
                    func = self.tools_map[function_name]
                    print(f"Executing tool: {function_name} with args: {function_args}")
                    try:
                        # 執行工具函數
                        # 檢查函數是否為異步函數 (Coroutine Function)
                        import inspect
                        if inspect.iscoroutinefunction(func):
                            function_response = await func(**function_args)
                        else:
                            function_response = func(**function_args)
                        
                        # 將工具執行結果回傳給代理人
                        response = await self.chat.send_message_async(
                            genai.protos.Content(
                                parts=[genai.protos.Part(
                                    function_response=genai.protos.FunctionResponse(
                                        name=function_name,
                                        response={"result": function_response}
                                    )
                                )]
                            )
                        )
                    except Exception as e:
                        print(f"Error executing tool {function_name}: {e}")
                        # 如果工具執行失敗，將錯誤訊息回傳給代理人
                        response = await self.chat.send_message_async(
                            genai.protos.Content(
                                parts=[genai.protos.Part(
                                    function_response=genai.protos.FunctionResponse(
                                        name=function_name,
                                        response={"error": str(e)}
                                    )
                                )]
                            )
                        )
                else:
                    print(f"Tool {function_name} not found")
                    # 如果找不到工具，中斷循環 (避免無窮迴圈)
                    break
            else:
                # 如果沒有 Function Call，表示代理人已生成最終回應，直接返回
                return response

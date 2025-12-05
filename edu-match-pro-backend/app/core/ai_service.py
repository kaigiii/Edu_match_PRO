"""
AI 服務模組
使用 Google Gemini API 進行智能分析
"""
import os
import json
import re
import time
import logging
import traceback
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from app.core.config import settings


class AIService:
    """AI 策略分析服務（支援多API密鑰輪換）"""
    
    # AI 人設
    PERSONA = """你是「小匯」，智匯偏鄉平台的AI教育公益顧問。

關於智匯偏鄉平台：
- 台灣首個專為偏鄉教育設計的智能資源媒合平台
- 使用AI技術精準連接學校的教育需求與企業的社會責任
- 配對成功率達95%以上，已幫助200+所偏鄉學校、10,000+名學生
- 提供透明化追蹤、自動生成ESG報告、量化社會影響力

你的背景：
- 在偏鄉學校當過志工老師
- 現在是智匯偏鄉平台的AI顧問
- 熟悉台灣偏鄉教育現況和平台運作
- 可以從平台數據庫查詢真實的學校資訊

你的任務：
1. 了解企業想捐什麼資源、給哪些學校
2. 根據平台真實數據提供精準建議
3. 幫助企業實現有效的教育公益和ESG目標

你的個性：
- 真誠、專業但輕鬆
- 善於傾聽，不急著推銷
- 有點幽默感

回答原則：
- 始終表現得對數據和資訊非常了解和自信
- 優先使用提供的真實數據
- 如果沒有確切數據，基於專業知識和台灣偏鄉教育現況給出合理的專業建議
- 不要說「我不確定」「可能」「也許」「我沒有這個數據」等不確定的話
- 以專業顧問的口吻，自信地提供建議

重要：對話時使用純文字，不要用 Markdown 格式（不要用 ** 粗體、不要用 * 列表、不要用 # 標題）。"""
    
    def __init__(self):
        """初始化 AI 服務（支援多API密鑰輪換）"""
        # 從 settings 獲取所有 API 金鑰
        self.api_keys = settings.get_gemini_api_keys()
        if not self.api_keys:
            raise ValueError("未設置任何 GEMINI_API_KEY 環境變量或配置")
        
        self.current_key_index = 0
        self.model = None
        # 優先模型，可由環境變量覆蓋
        self.forced_model_name = os.environ.get('GEMINI_PREFERRED_MODEL', 'models/gemini-2.5-flash')
        
        # 嘗試使用第一個可用的 API 金鑰初始化
        self._initialize_with_current_key()
        
        # 設定 logger
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"[AI服務] 已初始化，使用模型: {self.model_name}，可用API密鑰數: {len(self.api_keys)}")
    
    def _initialize_with_current_key(self):
        """使用當前索引的API密鑰初始化模型"""
        if self.current_key_index >= len(self.api_keys):
            raise ValueError("所有 API 密鑰都已達到限制")
        
        api_key = self.api_keys[self.current_key_index]
        genai.configure(api_key=api_key)
        
        # 選擇模型
        try:
            # 取得所有支援 generateContent 的模型，並儲存為實例可用模型列表
            available_models = [
                m.name for m in genai.list_models()
                if 'generateContent' in getattr(m, 'supported_generation_methods', [])
            ]
            self.available_models = available_models

            # 擴充預設偏好模型（優先使用 2.5 版本，再回落到 2.0）
            preferred_models = [
                'models/gemini-2.5-flash', 'models/gemini-2.5-pro',
                'models/gemini-2.0-flash-exp', 'models/gemini-2.0-flash',
                'models/gemini-1.5-flash', 'models/gemini-1.5-pro'
            ]

            model_name = None

            # 如果有外部強制模型名稱，且可用則優先使用
            forced = getattr(self, 'forced_model_name', None)
            if forced and forced in available_models:
                model_name = forced

            if not model_name:
                for preferred in preferred_models:
                    if preferred in available_models:
                        model_name = preferred
                        break

            if not model_name:
                model_name = available_models[0] if available_models else 'models/gemini-pro'

            self.model = genai.GenerativeModel(model_name)
            self.model_name = model_name
            print(f"[AI服務] 使用API密鑰 #{self.current_key_index + 1}，模型: {self.model_name}")
        except Exception as e:
            print(f"[AI服務] API密鑰 #{self.current_key_index + 1} 初始化失敗: {e}")
            # 嘗試下一個密鑰
            self.current_key_index += 1
            if self.current_key_index < len(self.api_keys):
                print(f"[AI服務] 切換到API密鑰 #{self.current_key_index + 1}")
                self._initialize_with_current_key()
            else:
                raise ValueError("所有 API 密鑰初始化都失敗")
    
    def _switch_to_next_key(self):
        """切換到下一個API密鑰"""
        self.current_key_index += 1
        if self.current_key_index >= len(self.api_keys):
            print(f"[AI服務] 所有 {len(self.api_keys)} 個API密鑰都已嘗試")
            return False
        
        print(f"[AI服務] 切換到API密鑰 #{self.current_key_index + 1}/{len(self.api_keys)}")
        try:
            self._initialize_with_current_key()
            return True
        except Exception as e:
            print(f"[AI服務] 切換失敗: {e}")
            return False

    def _switch_to_next_model(self) -> bool:
        """切換到下一個可用模型（輪換 self.available_models）。"""
        if not hasattr(self, 'available_models') or not self.available_models:
            return False

        try:
            current = getattr(self, 'model_name', None)
            idx = self.available_models.index(current) if current in self.available_models else -1
        except Exception:
            idx = -1

        # 循環尋找下一個模型，若只有一個則回傳 False
        if len(self.available_models) <= 1:
            return False

        next_idx = (idx + 1) % len(self.available_models)
        if next_idx == idx:
            return False

        next_model = self.available_models[next_idx]
        try:
            self.model = genai.GenerativeModel(next_model)
            self.model_name = next_model
            print(f"[AI服務] 已切換模型到: {next_model}")
            return True
        except Exception as e:
            print(f"[AI服務] 切換模型失敗: {e}")
            return False
    
    def _call_with_retry(self, prompt: str, max_retries: int = None) -> str:
        """
        使用重試機制調用API（自動切換密鑰）
        
        Args:
            prompt: 提示詞
            max_retries: 最大重試次數（None表示嘗試所有密鑰）
        
        Returns:
            API回應文本
        """
        if max_retries is None:
            max_retries = len(self.api_keys)
        
        attempts = 0
        last_error = None

        while attempts < max_retries:
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                last_error = e
                error_msg = str(e).lower()

                # 記錄完整錯誤以便除錯
                tb = traceback.format_exc()
                self.logger.warning(f"[AI服務] 調用失敗（key #{self.current_key_index + 1}）: {error_msg}")
                self.logger.debug(tb)

                # 如果是速率限制或配額、或金鑰被舉報洩露/授權錯誤，嘗試切換金鑰並重試
                if any(k in error_msg for k in ['429', 'quota', 'rate limit', 'resource exhausted', 'rate_limited'] ) \
                   or any(k in error_msg for k in ['403', 'permission denied', 'forbidden', 'leaked', 'reported as leaked', 'api key was reported']):
                    self.logger.info(f"[AI服務] API密鑰 #{self.current_key_index + 1} 看似不可用（{error_msg[:200]}），嘗試切換金鑰...")
                    # 嘗試切換到下一個密鑰
                    if self._switch_to_next_key():
                        attempts += 1
                        # 指數退避
                        sleep_time = min(2 ** attempts, 30)
                        self.logger.info(f"[AI服務] 等待 {sleep_time}s 後重試 (attempt {attempts}/{max_retries})")
                        time.sleep(sleep_time)
                        continue
                    else:
                        # 如果所有金鑰都嘗試過，嘗試切換模型再重試（有機會某模型在某專案/金鑰上無配額）
                        self.logger.info("[AI服務] 所有 API 金鑰已嘗試，嘗試切換模型後重試...")
                        if self._switch_to_next_model():
                            # 重置 key index 並從頭嘗試
                            self.current_key_index = 0
                            attempts = 0
                            # 小睡一下再試
                            time.sleep(1)
                            continue
                        else:
                            raise ValueError(f"所有 {len(self.api_keys)} 個API密鑰都已達到限制或失敗: {error_msg}")
                else:
                    # 其他類型的錯誤，直接拋出以便上層處理
                    self.logger.error(f"[AI服務] 無法處理的錯誤: {error_msg}")
                    raise e

        # 如果所有重試都失敗
        raise ValueError(f"API調用失敗，已嘗試 {attempts} 次: {last_error}")
    
    def extract_donation_parameters(self, user_query: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        從用戶查詢中提取捐贈參數
        
        Args:
            user_query: 用戶的查詢文本
            conversation_history: 對話歷史（可選）
        
        Returns:
            提取的參數字典
        """
        context = ""
        if conversation_history:
            context = "\n對話歷史:\n" + "\n".join([
                f"- {msg['role']}: {msg['content']}" 
                for msg in conversation_history[-3:]  # 只保留最近3輪對話
            ])
        
        prompt = f"""
{self.PERSONA}

---

{context}

最新: "{user_query}"

---

提取捐贈資訊（沒提到就 null）：
{{
  "resource_type": "捐什麼",
  "quantity": 數量,
  "target_counties": ["花蓮縣", "台東縣"],
  "target_school_level": "學校類型",
  "priority_focus": "關注重點",
  "area_type": "偏遠程度"
}}

提示：花東=花蓮+台東，中部=台中+彰化+南投，閒聊全null

輸出JSON：
"""
        
        def _extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
            """嘗試從 text 中抽出 JSON 物件或陣列並解析返回 dict（失敗回傳 None）。"""
            # 1) 移除常見 code block 標記
            t = text.strip()
            # 若包含 ```json ... ```，抽取中間部分
            m = re.search(r"```json\s*(.*?)\s*```", t, re.S | re.I)
            if m:
                candidate = m.group(1).strip()
                try:
                    return json.loads(candidate)
                except Exception:
                    pass

            # 2) 若包含 ``` ... ``` 無指定語法，抽取中間部分
            m = re.search(r"```\s*(.*?)\s*```", t, re.S)
            if m:
                candidate = m.group(1).strip()
                try:
                    return json.loads(candidate)
                except Exception:
                    pass

            # 3) 嘗試找出第一個 { ... } 的區塊（從第一個 { 到最後一個 }）
            if '{' in t and '}' in t:
                first = t.find('{')
                last = t.rfind('}')
                if first < last:
                    candidate = t[first:last+1]
                    # 嘗試修正常見單引號情況
                    try:
                        return json.loads(candidate)
                    except Exception:
                        # 嘗試用替換單引號為雙引號後解析（謹慎）
                        cand2 = candidate.replace("\'", '"')
                        try:
                            return json.loads(cand2)
                        except Exception:
                            pass

            # 4) 嘗試找出第一個 [ ... ] 的區塊
            if '[' in t and ']' in t:
                first = t.find('[')
                last = t.rfind(']')
                if first < last:
                    candidate = t[first:last+1]
                    try:
                        parsed = json.loads(candidate)
                        # 若是 list 轉成 dict under a key
                        return {"_list_result": parsed}
                    except Exception:
                        pass

            return None

        try:
            response_text = self._call_with_retry(prompt)
            cleaned = response_text.strip().replace("```json", "").replace("```", "").strip()

            # 直接嘗試解析整個回應
            try:
                parsed = json.loads(cleaned)
                return parsed
            except Exception:
                # 嘗試多種抽取策略
                parsed = _extract_json_from_text(response_text)
                if parsed is not None:
                    return parsed

            # 若所有解析策略都失敗，回傳包含原始回應以便前端/日誌診斷
            print(f"[AI服務] 解析 JSON 失敗，將回傳原始回應供診斷: {response_text[:200]}")
            return {"_raw_ai_response": response_text}
        except Exception as e:
            print(f"[AI服務] 參數提取失敗: {e}")
            return {"_raw_ai_error": str(e)}
    
    def generate_followup_question(self, extracted_params: Dict[str, Any], conversation_history: List[Dict] = None) -> Optional[str]:
        """
        根據已提取的參數生成追問問題
        
        Args:
            extracted_params: 已提取的參數
            conversation_history: 對話歷史
        
        Returns:
            追問問題字符串，如果信息已足夠則返回 None
        """
        # 格式化對話歷史
        conversation_text = ""
        if conversation_history and len(conversation_history) > 0:
            conversation_text = "\n".join([
                f"{'用戶' if msg.get('role') == 'user' else '小匯'}: {msg.get('content', '')}"
                for msg in conversation_history[-5:]  # 只保留最近5輪對話
            ])
        
        # 獲取最近的用戶訊息
        recent_message = ""
        if conversation_history and len(conversation_history) > 0:
            recent_message = conversation_history[-1].get('content', '')
        
        # 統一交給 AI 處理，讓它自己判斷
        prompt = f"""
{self.PERSONA}

==對話記錄==
{conversation_text if conversation_text else "(首次對話)"}

==最新訊息==
用戶: {recent_message}

==已掌握資訊==
{json.dumps(extracted_params, ensure_ascii=False, indent=2)}

---

基於完整的對話上下文，自然回應最新訊息。用純文字回覆，不要用Markdown格式。
"""
        try:
            print(f"[AI] 正在調用 generate_content，prompt長度: {len(prompt)}")
            response_text = self._call_with_retry(prompt)
            print(f"[AI] 成功生成回應: {response_text[:100]}...")
            return response_text.strip()
        except Exception as e:
            print(f"[AI生成失敗] 錯誤類型: {type(e).__name__}")
            print(f"[AI生成失敗] 錯誤訊息: {str(e)}")
            import traceback
            print(f"[AI生成失敗] 完整錯誤:\n{traceback.format_exc()}")
            # fallback 也讓 AI 簡單回應
            fallback_prompt = f"""
{self.PERSONA}

對話記錄:
{conversation_text if conversation_text else recent_message}

簡短回應。用純文字，不要用Markdown格式。
"""
            try:
                print(f"[AI] 嘗試 fallback prompt")
                fallback_text = self._call_with_retry(fallback_prompt)
                print(f"[AI] Fallback 成功")
                return fallback_text.strip()
            except Exception as e2:
                print(f"[AI] Fallback 也失敗: {str(e2)}")
                return "抱歉，我剛恍神了，可以再說一次嗎？"
    
    def _generate_confirmation_question(self, extracted_params: Dict[str, Any]) -> str:
        """
        生成確認問題，總結已收集的信息並詢問是否還有其他需求
        
        Args:
            extracted_params: 已提取的參數
        
        Returns:
            確認問題字符串
        """
        prompt = f"""
{self.PERSONA}

已收集資訊：
{json.dumps(extracted_params, ensure_ascii=False, indent=2)}

總結理解的內容，詢問還有沒有其他想法，說確認後會準備報告。用純文字回覆。
"""
        
        try:
            response_text = self._call_with_retry(prompt)
            return response_text.strip()
        except Exception as e:
            # 如果生成失敗，使用預設模板
            summary_parts = []
            if extracted_params.get("resource_type"):
                summary_parts.append(f"• 捐贈資源：{extracted_params['resource_type']}")
            if extracted_params.get("quantity"):
                summary_parts.append(f"• 數量：{extracted_params['quantity']}")
            if extracted_params.get("target_counties"):
                counties = ", ".join(extracted_params['target_counties'])
                summary_parts.append(f"• 目標區域：{counties}")
            if extracted_params.get("target_school_level"):
                summary_parts.append(f"• 學校等級：{extracted_params['target_school_level']}")
            
            summary = "\n".join(summary_parts)
            
            return f"""好的，我了解了：

{summary}

還有其他想法嗎？確認的話我就幫您準備分析報告。"""
    
    def generate_analysis_report(
        self, 
        user_params: Dict[str, Any], 
        school_data: Dict[str, List[Dict]], 
        statistics: Dict[str, Any]
    ) -> str:
        """
        生成分析報告
        
        Args:
            user_params: 用戶參數
            school_data: 學校數據（來自各個表）
            statistics: 統計數據
        
        Returns:
            Markdown 格式的分析報告
        """
        # 提取学校数据列表用于报告
        schools_list = []
        for school in school_data.get("faraway_schools", [])[:30]:  # 增加到30所
            schools_list.append({
                "name": f"{school.get('county', '')}{school.get('school_name', '')}",
                "county": school.get("county", ""),
                "students": school.get("students", 0),
                "area_type": school.get("area_type", ""),
                "classes": school.get("classes", 0)
            })
        
        # 提取設備資訊
        devices_summary = []
        for device in school_data.get("devices_info", [])[:10]:
            devices_summary.append({
                "school": device.get("school_name", ""),
                "computers": device.get("computers", 0)
            })
        
        prompt = f"""
{self.PERSONA}

## 📊 數據

學校資料（前15所）：
{json.dumps(schools_list[:15], ensure_ascii=False, indent=2)}

設備資訊：
{json.dumps(devices_summary, ensure_ascii=False, indent=2)}

統計：
- {len(schools_list)} 所學校
- {statistics.get('total_students', 0)} 位學生
- {', '.join(statistics.get('counties_covered', []))}

## 💼 客戶需求

{json.dumps(user_params, ensure_ascii=False, indent=2)}

---

撰寫捐贈策略分析報告（Markdown格式）。

報告撰寫要求：

1. 開場：專業地分析當前狀況和機會

2. **必須提供3種捐贈方案**：
   - 方案A：集中投放策略
   - 方案B：分散投放策略  
   - 方案C：分層投放策略
   
   每個方案必須包含：
   - 推薦學校列表（表格格式，含學校名稱、學生數、班級數、現有設備等）
   - 具體資源分配方式
   - 優缺點分析
   - 量化預期效益

3. 執行建議與後續支援

撰寫原則：
- 以專業顧問的口吻，自信且權威
- 優先使用提供的真實數據
- 如數據不足，基於台灣偏鄉教育現況和專業判斷，給出合理的學校推薦和分析
- 確保所有數據和建議都顯得專業可信
- 不要提及數據來源的局限性或不確定性
- 用Markdown格式，表格要清晰完整
"""
        
        try:
            response_text = self._call_with_retry(prompt)
            return response_text
        except Exception as e:
            print(f"[AI服務] 報告生成失敗: {e}")
            return f"## 報告生成失敗\n\n錯誤信息: {str(e)}"


# 創建全局 AI 服務實例（延遲初始化）
_ai_service_instance = None

def get_ai_service() -> AIService:
    """獲取 AI 服務實例"""
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance


#!/usr/bin/env python3
"""更深入的診斷：直接呼叫模型並印出原始回應，檢查是否有回傳但格式不符合 JSON。"""
import sys
from pathlib import Path
import traceback

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "edu-match-pro-backend"))

def build_prompt(ai_service, user_query, conversation_history=None):
    # 直接參考 ai_service.extract_donation_parameters 中的 prompt 組成
    context = ""
    if conversation_history:
        context = "\n對話歷史:\n" + "\n".join([
            f"- {msg['role']}: {msg['content']}" for msg in conversation_history[-3:]
        ])

    prompt = f"""
{ai_service.PERSONA}

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
    return prompt

def main():
    try:
        from app.core.ai_service import get_ai_service
        print("初始化 AI 服務...")
        ai = get_ai_service()
        print("model:", getattr(ai, 'model_name', None))

        user_query = "我想捐電腦給花蓮和台東的國小"
        prompt = build_prompt(ai, user_query, [])
        print("呼叫模型，prompt 長度:", len(prompt))

        try:
            raw = ai._call_with_retry(prompt)
            print("原始回應 type:", type(raw))
            print("原始回應長度:", len(raw) if hasattr(raw, '__len__') else 'N/A')
            print("原始回應 repr:\n", repr(raw)[:2000])
        except Exception as e:
            print("調用模型時發生例外:")
            traceback.print_exc()

    except Exception as e:
        print("初始化或其他錯誤:")
        traceback.print_exc()

if __name__ == '__main__':
    main()

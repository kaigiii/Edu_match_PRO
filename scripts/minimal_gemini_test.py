#!/usr/bin/env python3
"""最小測試：使用 google.generativeai 直接呼叫模型並印出原始回應。

用法：
  - 確保已設定環境變數 `GEMINI_API_KEY`（或將 key 當作第一個參數傳入）
  - 在專案根目錄執行：
      .venv/bin/python scripts/minimal_gemini_test.py
"""
import os
import sys
import traceback

def main():
    try:
        import google.generativeai as genai
    except Exception as e:
        print("請先在虛擬環境安裝 google-generativeai，或使用 requirements.txt 安裝相依。錯誤：", e)
        sys.exit(1)

    api_key = os.environ.get('GEMINI_API_KEY') or (sys.argv[1] if len(sys.argv) > 1 else None)
    if not api_key:
        print("需要 GEMINI_API_KEY 環境變數或作為參數傳入")
        sys.exit(2)

    try:
        genai.configure(api_key=api_key)

        print("列出可用模型（部分）：")
        all_models = list(genai.list_models())
        # 篩選出支援 generateContent 的模型
        models = [m for m in all_models if hasattr(m, 'supported_generation_methods') and 'generateContent' in getattr(m, 'supported_generation_methods', [])]
        models = models[:10]
        print([m.name for m in models])

        # 建立簡單呼叫：短 prompt 測試是否會得到回應
        model_name = models[0].name if models else None
        if not model_name:
            print("找不到任何支援的模型")
            sys.exit(3)

        print(f"使用模型 {model_name} 呼叫 generate_content...")
        model = genai.GenerativeModel(model_name)

        prompt = "請用一句話回答：你好嗎？"
        try:
            resp = model.generate_content(prompt)
            # 印出回應的 repr 與部分內容
            print("回應型別:", type(resp))
            # 嘗試印出文字欄位
            text = getattr(resp, 'text', None)
            print("resp.text (first 1000 chars):\n", repr(text)[:1000])
            print("完整 repr (截短 2000 chars):\n", repr(resp)[:2000])
        except Exception as e:
            print("呼叫模型時發生例外:")
            traceback.print_exc()
            sys.exit(4)

    except Exception as e:
        print("初始化或其他錯誤:")
        traceback.print_exc()
        sys.exit(5)

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""診斷 AI 服務初始化與簡單呼叫，用於在本地重現錯誤並輸出完整 traceback。"""
import sys
import traceback
from pathlib import Path

# 確保能 import 專案模組
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "edu-match-pro-backend"))

def main():
    try:
        from app.core.ai_service import get_ai_service
        print("嘗試初始化 AI 服務...")
        ai = get_ai_service()
        print("AI 服務初始化成功，模型:", getattr(ai, 'model_name', None))

        print("嘗試呼叫參數提取示例...")
        res = ai.extract_donation_parameters("我想捐電腦給花蓮和台東的國小", [])
        print("提取結果:", res)
    except Exception as e:
        print("發生錯誤:")
        traceback.print_exc()

if __name__ == '__main__':
    main()

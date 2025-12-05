#!/usr/bin/env python3
"""Test parsing logic of extract_donation_parameters by monkeypatching _call_with_retry."""
import os
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "edu-match-pro-backend"))

from app.core.ai_service import AIService

class DummyAI(AIService):
    def __init__(self):
        # avoid init that reads env keys
        self.PERSONA = AIService.PERSONA

    def _call_with_retry(self, prompt: str, max_retries: int = None):
        raise RuntimeError("should be monkeypatched")


def run_case(resp_text):
    ai = DummyAI()
    # monkeypatch method
    ai._call_with_retry = lambda p: resp_text
    out = ai.extract_donation_parameters("測試", [])
    print("INPUT:\n", resp_text)
    print("PARSED:\n", out)
    print('-'*60)

if __name__ == '__main__':
    cases = [
        # pure json
        '{"resource_type": "laptops", "target_counties": ["花蓮縣"]}',
        # json with backticks
        "Here is the result:\n```json\n{\"resource_type\": \"laptops\", \"target_counties\": [\"花蓮縣\"]}\n```",
        # extra text surrounding json
        "我建議如下：\n{\n  \"resource_type\": \"books\",\n  \"target_counties\": [\"台東縣\"]\n}\n謝謝",
        # non-json reply
        "謝謝，我很好。",
        # list result
        "[ {\"resource_type\": \"computers\"} ]",
    ]

    for c in cases:
        run_case(c)


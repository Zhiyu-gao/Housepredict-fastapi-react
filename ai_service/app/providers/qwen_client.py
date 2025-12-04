# ai_service/app/providers/qwen_client.py
from typing import List, Dict
from openai import OpenAI

from app.config import QWEN_CONFIG


def get_qwen_client() -> OpenAI:
    return OpenAI(
        base_url=QWEN_CONFIG.base_url,
        api_key=QWEN_CONFIG.api_key,
    )


def qwen_chat(messages: List[Dict[str, str]]) -> str:
    client = get_qwen_client()
    completion = client.chat.completions.create(
        model=QWEN_CONFIG.model,
        messages=messages,
    )
    return completion.choices[0].message.content or ""

# ai_service/app/providers/qwen_client.py
from openai import OpenAI
from app.config import QWEN_CONFIG


def qwen_chat(prompt: str) -> str:
    """
    DashScope Qwen 的【唯一正确】OpenAI 兼容调用方式
    """

    client = OpenAI(
        api_key=QWEN_CONFIG.api_key,
        base_url=QWEN_CONFIG.base_url,
    )

    completion = client.chat.completions.create(
        model=QWEN_CONFIG.model,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.7,
    )

    return completion.choices[0].message.content

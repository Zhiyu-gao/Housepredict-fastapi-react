# ai_service/app/price_analysis_service.py
import logging

from app.schemas import AiProvider, HouseFeatures
from app.prompts.price_analysis import (
    SYSTEM_PROMPT,
    build_price_analysis_user_prompt,
)
from app.providers.kimi_client import kimi_chat
from app.providers.qwen_client import qwen_chat_messages
from app.providers.deepseek_client import deepseek_chat

logger = logging.getLogger(__name__)


def _call_provider(provider: AiProvider, messages: list[dict[str, str]]) -> str:
    try:
        if provider == AiProvider.kimi:
            return kimi_chat(messages)
        if provider == AiProvider.qwen:
            return qwen_chat_messages(messages)
        if provider == AiProvider.deepseek:
            return deepseek_chat(messages)
        raise ValueError(f"unsupported provider: {provider}")
    except Exception as exc:
        logger.exception("AI provider call failed: provider=%s", provider)
        raise RuntimeError(f"AI provider call failed: {provider}") from exc



def analyze_price_with_ai(
    provider: AiProvider,
    features: HouseFeatures,
    predicted_price: float,
) -> str:
    try:
        features_dict = {
            "area_sqm": features.area_sqm,
            "bedrooms": features.bedrooms,
            "age_years": features.age_years,
        }

        user_prompt = build_price_analysis_user_prompt(
            features=features_dict,
            predicted_price=predicted_price,
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        content = _call_provider(provider, messages)

        if not content or not isinstance(content, str):
            raise ValueError("AI response is empty or invalid")

        return content.strip()

    except Exception as exc:
        logger.exception(
            "AI price analysis failed: provider=%s, features=%s, predicted_price=%s",
            provider,
            features,
            predicted_price,
        )
        raise RuntimeError("AI price analysis failed") from exc

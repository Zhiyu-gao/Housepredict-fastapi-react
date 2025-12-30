# ai_service/app/price_analysis_service.py
from typing import Dict, Any
import logging

from app.schemas import HouseFeatures, AiProvider
from app.prompts.price_analysis import (
    SYSTEM_PROMPT,
    build_price_analysis_user_prompt,
)
from app.providers.kimi_client import kimi_chat
from app.providers.qwen_client import qwen_chat
from app.providers.deepseek_client import deepseek_chat

logger = logging.getLogger(__name__)

def _call_provider(provider: AiProvider, messages: list[dict[str, str]]) -> str:
    try:
        if provider == AiProvider.kimi:
            return kimi_chat(messages)
        if provider == AiProvider.qwen:
            return qwen_chat(messages)
        if provider == AiProvider.deepseek:
            return deepseek_chat(messages)
        raise ValueError(f"unsupported provider: {provider}")
    except Exception as e:
        logger.exception("AI provider call failed: provider=%s", provider)
        logger.exception("Qwen raw exception: %r", e)

        raise RuntimeError(f"AI provider call failed: {provider}") from e



def analyze_price_with_ai(
    provider: AiProvider,
    features: HouseFeatures,
    predicted_price: float,
) -> str:
    """
    统一入口：给定 provider + 房屋特征 + 预测价格
    返回 AI 分析结果（Markdown 文本）
    """
    try:
        logger.error("🔥 LOGGER TEST: analyze_price_with_ai called with provider=%s, features=%s, predicted_price=%s", provider, features, predicted_price)
        logger.info("🔥 ENTER analyze_price_with_ai")
        features_dict: Dict[str, Any] = {
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

    except Exception as e:
        logger.exception(
            "AI price analysis failed: provider=%s, features=%s, predicted_price=%s",
            provider,
            features,
            predicted_price,
        )
        # 对外抛出统一异常，方便 FastAPI 转 HTTPException
        raise RuntimeError("AI price analysis failed") from e

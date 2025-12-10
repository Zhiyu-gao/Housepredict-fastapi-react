# ai_service/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PriceAnalysisRequest, PriceAnalysisResponse
from app.price_analysis_service import analyze_price_with_ai

app = FastAPI(title="AI House Price Service")

# 允许前端访问（和你 backend 的 CORS 一样）
origins = [
    "http://20.2.82.150",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/price-analysis", response_model=PriceAnalysisResponse)
def price_analysis(body: PriceAnalysisRequest):
    """
    输入：
    - provider: kimi / qwen / deepseek
    - features: 房屋特征（面积/卧室/房龄/距离地铁）
    - predicted_price: 已经由 backend 预测好的价格

    输出：
    - provider
    - predicted_price
    - analysis_markdown: AI 生成的分析（Markdown 文本）
    """
    analysis = analyze_price_with_ai(
        provider=body.provider,
        features=body.features,
        predicted_price=body.predicted_price,
    )

    return PriceAnalysisResponse(
        provider=body.provider,
        predicted_price=body.predicted_price,
        analysis_markdown=analysis,
    )

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PriceAnalysisRequest, PriceAnalysisResponse
from app.price_analysis_service import analyze_price_with_ai
from app.chat import router as chat_router

load_dotenv()

app = FastAPI(title="AI House Price Service")
origins = [
    "http://20.2.82.150",
    "http://20.2.82.150:80",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:80",
    "http://127.0.0.1:80",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.include_router(chat_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/price-analysis", response_model=PriceAnalysisResponse)
def price_analysis(body: PriceAnalysisRequest):
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

# app/main.py
from dotenv import load_dotenv
import os
from pathlib import Path
# 仅在没有 DB_HOST 的情况下才加载 .env
if not os.getenv("DB_HOST"):
    BASE_DIR = Path(__file__).resolve().parents[1]
    ENV_PATH = BASE_DIR / ".env"
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, annotations, crawl_house, predict
from app.routers.auth import get_current_user
from app.schemas import UserOut
from app import models

app = FastAPI(title="House Price API")

# ======================
# 路由注册
# ======================
app.include_router(auth.router)
app.include_router(annotations.router)
app.include_router(crawl_house.router)
app.include_router(predict.router)

# ======================
# CORS
# ======================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# 当前用户
# ======================
@app.get("/me", response_model=UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user

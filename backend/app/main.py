import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_password_hash, verify_password
from app.db import get_db
from app.routers import annotations, auth, crawl_house, houses, predict
from app.routers.auth import get_current_user
from app.schemas import PasswordUpdate, UserOut, UserUpdate

if not os.getenv("DB_HOST"):
    BASE_DIR = Path(__file__).resolve().parents[1]
    ENV_PATH = BASE_DIR / ".env"
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

app = FastAPI(title="House Price API")

app.include_router(auth.router)
app.include_router(annotations.router)
app.include_router(crawl_house.router)
app.include_router(houses.router)
app.include_router(predict.router)

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


@app.get("/me", response_model=UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current_user.email = payload.email
    current_user.full_name = payload.full_name
    try:
        db.commit()
        db.refresh(current_user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="更新用户信息失败")
    return current_user


@app.put("/me/password")
def update_password(
    payload: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="原密码错误",
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="修改密码失败")
    return {"ok": True}

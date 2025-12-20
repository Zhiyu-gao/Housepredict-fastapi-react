# app/main.py
from dotenv import load_dotenv
load_dotenv()  # ✅ 唯一一次加载 .env，必须在最顶部

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, crud
from app.db import Base, engine, get_db
from app.train import load_model
from app.routers import auth
from app.routers.auth import get_current_user
from app.core.security import verify_password, get_password_hash

app = FastAPI(title="House Price API")

# 路由
app.include_router(auth.router)

# CORS
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

# 建表
Base.metadata.create_all(bind=engine)

# 加载模型
model = load_model()

# ========================= 房源 CRUD =========================

@app.get("/houses", response_model=List[schemas.House])
def read_houses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_houses(db, skip=skip, limit=limit)

@app.post("/houses", response_model=schemas.House)
def create_house(house: schemas.HouseCreate, db: Session = Depends(get_db)):
    return crud.create_house(db, house)

# ========================= 预测 =========================

@app.post("/predict")
def predict_price(features: schemas.HouseFeatures):
    import numpy as np
    X = np.array([[features.area_sqm, features.bedrooms, features.age_years, features.distance_to_metro_km]])
    y_pred = model.predict(X)[0]
    return {"predicted_price": float(y_pred)}

# ========================= 用户 =========================

@app.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user

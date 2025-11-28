# app/main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, crud
from .db import Base, engine, get_db
from .train import load_model
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth  # 根据你的路径调整


app = FastAPI(title="House Price API")

app.include_router(auth.router)


origins = [
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

# 建表（实际生产建议用 Alembic，这里先简单一点）
Base.metadata.create_all(bind=engine)

# 提前加载模型
model = load_model()


@app.get("/houses", response_model=List[schemas.House])
def read_houses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    houses = crud.get_houses(db, skip=skip, limit=limit)
    # current_user: models.User = Depends(get_current_user)

    return houses


@app.get("/houses/{house_id}", response_model=schemas.House)
def read_house(house_id: int, db: Session = Depends(get_db)):
    db_house = crud.get_house(db, house_id)
    if db_house is None:
        raise HTTPException(status_code=404, detail="House not found")
    return db_house


@app.post("/houses", response_model=schemas.House)
def create_house(house: schemas.HouseCreate, db: Session = Depends(get_db)):
    return crud.create_house(db, house)


@app.put("/houses/{house_id}", response_model=schemas.House)
def update_house(house_id: int, house: schemas.HouseUpdate, db: Session = Depends(get_db)):
    db_house = crud.update_house(db, house_id, house)
    if db_house is None:
        raise HTTPException(status_code=404, detail="House not found")
    return db_house


@app.delete("/houses/{house_id}")
def delete_house(house_id: int, db: Session = Depends(get_db)):
    db_house = crud.delete_house(db, house_id)
    if db_house is None:
        raise HTTPException(status_code=404, detail="House not found")
    return {"detail": "deleted"}


@app.post("/predict")
def predict_price(features: schemas.HouseFeatures):
    import numpy as np

    X = np.array([
        [
            features.area_sqm,
            features.bedrooms,
            features.age_years,
            features.distance_to_metro_km,
        ]
    ])
    y_pred = model.predict(X)[0]
    return {"predicted_price": float(y_pred)}

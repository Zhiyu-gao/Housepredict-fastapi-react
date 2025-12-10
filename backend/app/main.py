from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, crud
from .db import Base, engine, get_db
from .train import load_model
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth  # 你已有的
from app.routers.auth import get_current_user  # 根据你的文件结构调整导入
from app.core.security import verify_password, get_password_hash  # 如果你放在别处，记得改路径

app = FastAPI(title="House Price API")

app.include_router(auth.router)


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

# ========================= 用户信息相关 =========================

@app.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    """
    获取当前登录用户信息（不返回密码）
    """
    return current_user

@app.put("/me", response_model=schemas.UserOut)
def update_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    更新当前用户的邮箱 & 姓名
    """
    # 检查邮箱是否被其他用户占用（可选）
    existing = (
        db.query(models.User)
        .filter(models.User.email == user_update.email, models.User.id != current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被其他账号使用",
        )

    current_user.email = user_update.email
    current_user.full_name = user_update.full_name
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.put("/me/password")
def change_password(
    payload: schemas.PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    修改当前用户密码，需要提供原密码 + 新密码
    """
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="原密码不正确",
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    return {"detail": "密码已更新"}

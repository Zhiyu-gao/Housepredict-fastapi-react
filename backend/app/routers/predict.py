from fastapi import APIRouter
from fastapi import HTTPException
from app.schemas import PredictRequest
from app.train import load_model
import numpy as np

router = APIRouter(tags=["predict"])

try:
    model = load_model()
except FileNotFoundError:
    model = None

@router.post("/predict")
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="模型文件不存在，请先运行训练脚本生成 model.pkl",
        )

    X = np.array([[req.area_sqm, req.bedrooms, req.age_years]])
    price = model.predict(X)[0]
    return {"predicted_price": float(price)}

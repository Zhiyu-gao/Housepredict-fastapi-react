import logging

import joblib
import numpy as np
from sqlalchemy.orm import Session
from sklearn.linear_model import LinearRegression

from app.db import SessionLocal
from app.models import House

MODEL_PATH = "model.pkl"
logger = logging.getLogger(__name__)


def train_and_save() -> None:
    db: Session = SessionLocal()
    try:
        houses = db.query(House).all()
        if not houses:
            raise ValueError("训练数据为空，无法训练模型")

        X = np.array([[h.area_sqm, h.bedrooms, h.age_years] for h in houses])
        y = np.array([h.price for h in houses])

        model = LinearRegression()
        model.fit(X, y)

        joblib.dump(model, MODEL_PATH)
        logger.info("Model saved to %s", MODEL_PATH)
    finally:
        db.close()


def load_model():
    return joblib.load(MODEL_PATH)

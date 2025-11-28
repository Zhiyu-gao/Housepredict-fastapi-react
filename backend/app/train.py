# app/ml_model.py
from pathlib import Path
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "house_prices.csv"
MODEL_PATH = BASE_DIR / "data" / "house_price_model.pkl"


def train_model_from_csv():
    df = pd.read_csv(DATA_PATH)

    feature_cols = ["area_sqm", "bedrooms", "age_years", "distance_to_metro_km"]
    X = df[feature_cols]
    y = df["price"]

    model = LinearRegression()
    model.fit(X, y)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print("✅ 模型训练完成，并保存到:", MODEL_PATH)


def load_model():
    if not MODEL_PATH.exists():
        # 如果还没训练过，先训练一次
        train_model_from_csv()
    model = joblib.load(MODEL_PATH)
    return model


# 单独跑训练
if __name__ == "__main__":
    train_model_from_csv()

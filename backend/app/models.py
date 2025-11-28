# app/models.py
from sqlalchemy import Column, Integer, Float, String, DateTime, func
from .db import Base


class House(Base):
    __tablename__ = "houses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    area_sqm = Column(Float, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    age_years = Column(Integer, nullable=False)
    distance_to_metro_km = Column(Float, nullable=False)
    price = Column(Float, nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Integer, default=1)  # 1 表示可用，0 表示禁用
    created_at = Column(DateTime(timezone=True), server_default=func.now())
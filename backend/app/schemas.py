# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# ===== 用户相关 =====
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    is_active: int

    class Config:
        from_attributes = True  # SQLAlchemy 2.x: 原来的 orm_mode=True


# ===== JWT Token 相关 =====
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[EmailStr] = None
    
class HouseBase(BaseModel):
    area_sqm: float
    bedrooms: int
    age_years: int
    distance_to_metro_km: float


class HouseCreate(HouseBase):
    price: float


class HouseUpdate(HouseBase):
    price: float


class House(HouseBase):
    id: int
    price: float

    class Config:
        from_attributes = True  # SQLAlchemy 对象 -> Pydantic 模型


class HouseFeatures(BaseModel):
    """给 /predict 用的特征（不含 price）"""
    area_sqm: float
    bedrooms: int
    age_years: int
    distance_to_metro_km: float

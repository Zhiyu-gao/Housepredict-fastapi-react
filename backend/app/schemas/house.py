from pydantic import BaseModel, ConfigDict

class HouseCreate(BaseModel):
    area_sqm: float
    bedrooms: int
    age_years: int
    price: float

class HouseOut(HouseCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

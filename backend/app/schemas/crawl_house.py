from pydantic import BaseModel, ConfigDict

class CrawlHouseOut(BaseModel):
    house_id: str
    title: str
    area_sqm: float
    layout: str
    build_year: int
    total_price_wan: float
    unit_price: float
    district: str

    model_config = ConfigDict(from_attributes=True)

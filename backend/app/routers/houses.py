from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.db import get_db
from app.routers.auth import get_current_user
from app.schemas import HouseCreate, HouseOut

router = APIRouter(prefix="/houses", tags=["houses"])


@router.get("", response_model=list[HouseOut])
def list_houses(db: Session = Depends(get_db), _user: models.User = Depends(get_current_user)):
    return db.query(models.House).order_by(models.House.id.desc()).all()


@router.post("", response_model=HouseOut, status_code=status.HTTP_201_CREATED)
def create_house(
    payload: HouseCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    house = models.House(**payload.model_dump())
    db.add(house)
    try:
        db.commit()
        db.refresh(house)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="创建房源失败")
    return house


@router.put("/{house_id}", response_model=HouseOut)
def update_house(
    house_id: int,
    payload: HouseCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    house = db.query(models.House).filter(models.House.id == house_id).first()
    if house is None:
        raise HTTPException(status_code=404, detail="房源不存在")

    for field, value in payload.model_dump().items():
        setattr(house, field, value)

    try:
        db.commit()
        db.refresh(house)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="更新房源失败")
    return house


@router.delete("/{house_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_house(
    house_id: int,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    house = db.query(models.House).filter(models.House.id == house_id).first()
    if house is None:
        raise HTTPException(status_code=404, detail="房源不存在")

    db.delete(house)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="删除房源失败")

from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.fare_service import FareService
from app.schemas.schemas import FlightFareSchema, FareUpdateRequest, FareUpdateResponse, PriceHistorySchema

router = APIRouter(prefix="/fares", tags=["fares"])


@router.get("/{route_id}", response_model=list[FlightFareSchema])
def get_fares_by_route(route_id: str, date: date, db: Session = Depends(get_db)):
    service = FareService(db)
    return service.get_fares_by_route_date(route_id, date)


@router.put("/{flight_id}", response_model=FareUpdateResponse)
def update_fare(flight_id: str, body: FareUpdateRequest, db: Session = Depends(get_db)):
    service = FareService(db)
    try:
        return service.update_fare(flight_id, body.class_code, body.new_price, body.updated_by)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{flight_id}/history", response_model=list[PriceHistorySchema])
def get_price_history(flight_id: str, db: Session = Depends(get_db)):
    service = FareService(db)
    return service.get_price_history(flight_id)

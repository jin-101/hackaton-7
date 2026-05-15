from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.competitor_service import CompetitorService
from app.schemas.schemas import CompetitorPriceSchema, PriceComparisonSchema

router = APIRouter(prefix="/competitors", tags=["competitors"])


@router.get("/{route_id}", response_model=list[CompetitorPriceSchema])
def get_competitors(route_id: str, date: date, db: Session = Depends(get_db)):
    service = CompetitorService(db)
    return service.get_competitors_by_route(route_id, date)


@router.get("/{route_id}/comparison", response_model=PriceComparisonSchema)
def get_price_comparison(route_id: str, date: date, db: Session = Depends(get_db)):
    service = CompetitorService(db)
    return service.get_price_comparison(route_id, date)

from __future__ import annotations
from datetime import date
from sqlalchemy.orm import Session

from app.repositories.competitor_repository import CompetitorRepository
from app.repositories.fare_repository import FareRepository
from app.schemas.schemas import CompetitorPriceSchema, PriceComparisonSchema


class CompetitorService:
    def __init__(self, db: Session):
        self.competitor_repo = CompetitorRepository(db)
        self.fare_repo = FareRepository(db)

    def get_competitors_by_route(self, route_id: str, query_date: date) -> list[CompetitorPriceSchema]:
        prices = self.competitor_repo.get_by_route_date(route_id, query_date)
        return [
            CompetitorPriceSchema(
                route=route_id,
                airline=p.airline,
                booking_class=p.booking_class,
                fare=p.fare,
                date=p.observed_date.isoformat(),
            )
            for p in prices
        ]

    def get_price_comparison(self, route_id: str, query_date: date) -> PriceComparisonSchema:
        competitors = self.get_competitors_by_route(route_id, query_date)
        flights = self.fare_repo.get_flights_by_route_date(route_id, query_date)
        my_fares: dict[str, int] = {}
        for flight in flights:
            tiers = self.fare_repo.get_fare_tiers_by_flight(flight.id)
            for tier in tiers:
                if tier.class_code not in my_fares:
                    my_fares[tier.class_code] = tier.current_price
        return PriceComparisonSchema(
            route=route_id,
            date=query_date.isoformat(),
            my_fares=my_fares,
            competitors=competitors,
        )

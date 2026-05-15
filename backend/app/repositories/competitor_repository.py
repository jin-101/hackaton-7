from __future__ import annotations
from sqlalchemy.orm import Session
from app.models.models import CompetitorPrice


class CompetitorRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_route_date(self, route_id: str, observed_date) -> list[CompetitorPrice]:
        return (
            self.db.query(CompetitorPrice)
            .filter(
                CompetitorPrice.route_id == route_id,
                CompetitorPrice.observed_date == observed_date,
            )
            .all()
        )

    def get_airlines_by_route(self, route_id: str) -> list[str]:
        rows = (
            self.db.query(CompetitorPrice.airline)
            .filter(CompetitorPrice.route_id == route_id)
            .distinct()
            .all()
        )
        return [r[0] for r in rows]

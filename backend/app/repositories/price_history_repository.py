from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import PriceHistory, ChangeType


class PriceHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        fare_tier_id: str,
        change_type: ChangeType,
        price_before: int,
        price_after: int,
        changed_by: str,
    ) -> PriceHistory:
        entry = PriceHistory(
            id=str(uuid.uuid4()),
            fare_tier_id=fare_tier_id,
            change_type=change_type,
            price_before=price_before,
            price_after=price_after,
            changed_by=changed_by,
            changed_at=datetime.utcnow(),
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_by_fare_tier(self, fare_tier_id: str) -> list[PriceHistory]:
        return (
            self.db.query(PriceHistory)
            .filter(PriceHistory.fare_tier_id == fare_tier_id)
            .order_by(PriceHistory.changed_at.desc())
            .all()
        )

    def get_by_flight(self, flight_id: str) -> list[PriceHistory]:
        return (
            self.db.query(PriceHistory)
            .join(PriceHistory.fare_tier)
            .filter(PriceHistory.fare_tier.has(flight_id=flight_id))
            .order_by(PriceHistory.changed_at.desc())
            .all()
        )

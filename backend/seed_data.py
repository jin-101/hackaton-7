"""Seed database with mock data for 9 routes × 90 days."""
import sys
import os
import uuid
import random
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine
from app.models.models import Base, Route, Flight, FareTier, TierCode, AiRecommendation, RecommendationStatus, CompetitorPrice

Base.metadata.create_all(bind=engine)

ROUTES = [
    ("GMP-CJU", "GMP", "CJU"),
    ("GMP-PUS", "GMP", "PUS"),
    ("GMP-CJJ", "GMP", "CJJ"),
    ("GMP-TAE", "GMP", "TAE"),
    ("GMP-KWJ", "GMP", "KWJ"),
    ("ICN-CJU", "ICN", "CJU"),
    ("ICN-PUS", "ICN", "PUS"),
    ("GMP-KPO", "GMP", "KPO"),
    ("GMP-RSU", "GMP", "RSU"),
]

ROUTE_BASE_PRICE = {
    "GMP-CJU": 98_000, "ICN-CJU": 105_000, "GMP-PUS": 82_000,
    "GMP-CJJ": 78_000, "GMP-TAE": 75_000, "GMP-KWJ": 70_000,
    "ICN-PUS": 80_000, "GMP-KPO": 72_000, "GMP-RSU": 68_000,
}

SCHEDULES = [
    ("07:30", "morning"), ("10:15", "forenoon"),
    ("13:45", "afternoon"), ("18:20", "evening"),
]

TIER_CONFIG = [
    ("C", TierCode.PRESTIGE, 8),
    ("Y", TierCode.ECONOMY_FULL, 60),
    ("B", TierCode.ECONOMY_DISCOUNT, 50),
    ("V", TierCode.ECONOMY_SPECIAL, 55),
]

COMPETITORS = ["아시아나항공", "제주항공", "진에어"]
COMPETITOR_BOOKING_CLASSES = ["Y", "B", "V"]

PEAK_MONTHS = {1, 7, 8, 12}
PEAK_DAYS = {5, 6}  # Friday=4, Saturday=5 (0=Monday in isoweekday)


def random_lf(base: float, variance: float = 0.2) -> float:
    return min(1.0, max(0.1, base + random.uniform(-variance, variance)))


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Route).first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        print("Seeding routes...")
        for route_id, origin, dest in ROUTES:
            db.add(Route(id=route_id, origin=origin, destination=dest))
        db.commit()

        start_date = date(2026, 5, 1)
        flight_count = 0
        tier_count = 0

        print("Seeding flights and fare tiers...")
        for route_id, _, _ in ROUTES:
            base_price = ROUTE_BASE_PRICE[route_id]
            for day_offset in range(90):
                dep_date = start_date + timedelta(days=day_offset)
                is_peak = dep_date.month in PEAK_MONTHS or dep_date.isoweekday() in PEAK_DAYS
                lf_base = 0.75 if is_peak else 0.55

                for sched_time, time_slot in SCHEDULES:
                    flight_no_idx = SCHEDULES.index((sched_time, time_slot)) + 1
                    flight_no = f"KE{1200 + (list(dict.fromkeys([r[0] for r in ROUTES])).index(route_id)) * 10 + flight_no_idx}"
                    flight_id = str(uuid.uuid4())[:8]
                    lf = random_lf(lf_base + (0.1 if time_slot in ("morning", "evening") else 0))
                    base_cost = round(base_price * 120 * 0.85 * (1 + day_offset * 0.001))
                    db.add(Flight(
                        id=flight_id,
                        route_id=route_id,
                        flight_number=flight_no,
                        departure_date=dep_date,
                        departure_time=sched_time,
                        time_slot=time_slot,
                        load_factor=round(lf * 100, 1),
                        pace=round(random.uniform(-8, 15), 1),
                        base_cost=base_cost,
                    ))
                    flight_count += 1

                    time_mult = 1.15 if time_slot == "evening" else 1.0 if time_slot == "morning" else 0.95
                    peak_mult = 1.10 if is_peak else 1.0

                    for class_code, tier, total_seats in TIER_CONFIG:
                        if tier == TierCode.PRESTIGE:
                            price = round(base_price * 1.95 * time_mult * peak_mult / 1000) * 1000
                        elif tier == TierCode.ECONOMY_FULL:
                            price = round(base_price * 1.20 * time_mult * peak_mult / 1000) * 1000
                        elif tier == TierCode.ECONOMY_DISCOUNT:
                            price = round(base_price * 0.95 * time_mult * peak_mult / 1000) * 1000
                        else:
                            price = round(base_price * 0.68 * time_mult * peak_mult / 1000) * 1000

                        sold = round(total_seats * lf * random.uniform(0.8, 1.1))
                        sold = min(sold, total_seats)
                        status = "sold_out" if sold >= total_seats else "closed" if lf > 0.9 and tier == TierCode.ECONOMY_SPECIAL else "open"

                        ai_price = None
                        if lf > 0.80 and random.random() > 0.6:
                            ai_price = round(price * random.uniform(1.05, 1.20) / 1000) * 1000
                        elif lf < 0.50 and random.random() > 0.6:
                            ai_price = round(price * random.uniform(0.82, 0.95) / 1000) * 1000

                        db.add(FareTier(
                            id=str(uuid.uuid4())[:12],
                            flight_id=flight_id,
                            class_code=class_code,
                            tier=tier,
                            current_price=price,
                            ai_recommended_price=ai_price,
                            total_seats=total_seats,
                            sold_seats=sold,
                            status=status,
                        ))
                        tier_count += 1

        db.commit()

        print("Seeding competitor prices...")
        comp_count = 0
        for route_id, _, _ in ROUTES:
            base_price = ROUTE_BASE_PRICE[route_id]
            for airline in COMPETITORS:
                for day_offset in range(90):
                    obs_date = start_date + timedelta(days=day_offset)
                    for cls in COMPETITOR_BOOKING_CLASSES:
                        if cls == "Y":
                            fare = round(base_price * random.uniform(0.90, 1.10) / 1000) * 1000
                        elif cls == "B":
                            fare = round(base_price * random.uniform(0.72, 0.88) / 1000) * 1000
                        else:
                            fare = round(base_price * random.uniform(0.48, 0.62) / 1000) * 1000
                        db.add(CompetitorPrice(
                            id=str(uuid.uuid4())[:12],
                            route_id=route_id,
                            airline=airline,
                            booking_class=cls,
                            fare=fare,
                            observed_date=obs_date,
                        ))
                        comp_count += 1

        db.commit()

        print("Seeding AI recommendations...")
        db.add(AiRecommendation(
            id="REC001",
            flight_id="",
            class_code="Y",
            current_price=98_000,
            recommended_price=113_000,
            rationale="출발 5일 전 저조한 탑승률(54%). 수요 탄력성 분석 결과 가격 인하 시 LF 75% 달성 예상.",
            change_percent=15.3,
            confidence=87.0,
            predicted_load_factor=75.0,
            status=RecommendationStatus.PENDING,
        ))
        db.commit()

        print(f"Seeding complete: {flight_count} flights, {tier_count} fare tiers, {comp_count} competitor prices.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

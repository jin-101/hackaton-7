from __future__ import annotations
import uuid
from datetime import date, datetime
from sqlalchemy.orm import Session

from app.models.models import Report
from app.schemas.schemas import (
    ReportSchema, RoutePerformanceSchema, YieldTrendSchema,
    AiStatsSchema, RevenueDataPointSchema,
)

MOCK_ROUTE_PERFORMANCE = [
    {"route": "GMP-CJU", "revenue": 182_400_000, "target": 160_000_000, "load_factor": 87.0},
    {"route": "GMP-PUS", "revenue": 94_500_000, "target": 110_000_000, "load_factor": 58.0},
    {"route": "ICN-CJU", "revenue": 138_200_000, "target": 130_000_000, "load_factor": 86.0},
    {"route": "GMP-TAE", "revenue": 41_800_000, "target": 50_000_000, "load_factor": 48.0},
]

MOCK_YIELD_TREND = [
    {"month": "2월", "yield_": 82.0, "target": 78.0},
    {"month": "3월", "yield_": 89.0, "target": 82.0},
    {"month": "4월", "yield_": 85.0, "target": 84.0},
    {"month": "5월", "yield_": 91.0, "target": 86.0},
]

MOCK_REVENUE_HISTORY = [
    {"date": "5/8",  "revenue": 42_800_000, "bookings": 412},
    {"date": "5/9",  "revenue": 38_500_000, "bookings": 378},
    {"date": "5/10", "revenue": 51_200_000, "bookings": 498},
    {"date": "5/11", "revenue": 47_900_000, "bookings": 461},
    {"date": "5/12", "revenue": 63_400_000, "bookings": 612},
    {"date": "5/13", "revenue": 71_200_000, "bookings": 687},
    {"date": "5/14", "revenue": 58_700_000, "bookings": 563},
    {"date": "5/15", "revenue": 44_300_000, "bookings": 425},
]


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def generate_report(self, route: str | None, period_start: date, period_end: date) -> ReportSchema:
        perf = MOCK_ROUTE_PERFORMANCE if route is None else [r for r in MOCK_ROUTE_PERFORMANCE if r["route"] == route]
        total_revenue = sum(r["revenue"] for r in perf)
        total_target = sum(r["target"] for r in perf)
        achieve_rate = round((total_revenue / total_target) * 100, 1) if total_target else 0.0
        report_id = str(uuid.uuid4())
        report = Report(
            id=report_id,
            route_id=route,
            period_start=period_start,
            period_end=period_end,
            total_revenue=total_revenue,
            total_target=total_target,
            achieve_rate=achieve_rate,
            created_at=datetime.utcnow(),
        )
        self.db.add(report)
        self.db.commit()
        return ReportSchema(
            report_id=report_id,
            route=route,
            period_start=period_start.isoformat(),
            period_end=period_end.isoformat(),
            total_revenue=total_revenue,
            total_target=total_target,
            achieve_rate=achieve_rate,
            route_performance=[RoutePerformanceSchema(**r) for r in perf],
            yield_trend=[YieldTrendSchema(**y) for y in MOCK_YIELD_TREND],
            ai_stats=AiStatsSchema(approved_count=3, rejected_count=1),
            revenue_history=[RevenueDataPointSchema(**d) for d in MOCK_REVENUE_HISTORY],
            created_at=datetime.utcnow().isoformat(),
        )

    def send_email(self, report_id: str, recipient_email: str) -> bool:
        print(f"[ReportService] Sending report {report_id} to {recipient_email}")
        return True

from __future__ import annotations
import uuid
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import Report, Flight, FareTier, AiRecommendation, RecommendationStatus
from app.schemas.schemas import (
    ReportSchema, RoutePerformanceSchema, YieldTrendSchema,
    AiStatsSchema, RevenueDataPointSchema,
)

# Revenue targets per route per day (won) — based on route capacity/KPI baseline
ROUTE_DAILY_TARGET: dict[str, int] = {
    "GMP-CJU": 9_000_000,
    "GMP-PUS": 5_500_000,
    "ICN-CJU": 8_000_000,
    "GMP-TAE": 2_800_000,
    "GMP-KWJ": 2_400_000,
    "ICN-PUS": 4_500_000,
    "GMP-KPO": 2_200_000,
    "GMP-RSU": 2_000_000,
}
DEFAULT_DAILY_TARGET = 3_000_000


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def _get_route_ids(self, route: str | None) -> list[str]:
        from app.models.models import Route
        q = self.db.query(Route.id)
        if route:
            q = q.filter(Route.id == route)
        return [r[0] for r in q.all()]

    def generate_report(self, route: str | None, period_start: date, period_end: date) -> ReportSchema:
        route_ids = self._get_route_ids(route)

        # --- route performance ---
        route_perf: list[RoutePerformanceSchema] = []
        for rid in route_ids:
            flights = (
                self.db.query(Flight)
                .filter(
                    Flight.route_id == rid,
                    Flight.departure_date >= period_start,
                    Flight.departure_date <= period_end,
                )
                .all()
            )
            if not flights:
                continue
            fids = [f.id for f in flights]
            tiers = self.db.query(FareTier).filter(FareTier.flight_id.in_(fids)).all()
            rev = sum(t.current_price * t.sold_seats for t in tiers)
            lfs = [f.load_factor for f in flights]
            avg_lf = round(sum(lfs) / len(lfs), 1) if lfs else 0.0
            days = (period_end - period_start).days + 1
            target = ROUTE_DAILY_TARGET.get(rid, DEFAULT_DAILY_TARGET) * days
            route_perf.append(RoutePerformanceSchema(
                route=rid, revenue=rev, target=target, load_factor=avg_lf,
            ))

        total_revenue = sum(r.revenue for r in route_perf)
        total_target = sum(r.target for r in route_perf)
        achieve_rate = round((total_revenue / total_target) * 100, 1) if total_target else 0.0

        # --- yield trend: last 4 months up to period_end ---
        yield_trend = self._compute_yield_trend(route, period_end)

        # --- ai stats ---
        ai_stats = self._compute_ai_stats()

        # --- revenue history: one entry per day in period ---
        revenue_history = self._compute_revenue_history(route_ids, period_start, period_end)

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
            route_performance=route_perf,
            yield_trend=yield_trend,
            ai_stats=ai_stats,
            revenue_history=revenue_history,
            created_at=datetime.utcnow().isoformat(),
        )

    def _compute_yield_trend(self, route: str | None, ref_date: date) -> list[YieldTrendSchema]:
        MONTH_KO = ["1월", "2월", "3월", "4월", "5월", "6월",
                    "7월", "8월", "9월", "10월", "11월", "12월"]
        YIELD_TARGETS = [78.0, 80.0, 82.0, 84.0, 86.0, 84.0,
                         82.0, 84.0, 86.0, 83.0, 81.0, 79.0]
        trend = []
        for i in range(3, -1, -1):
            # go back i months from ref_date's month
            m = ref_date.month - i
            y = ref_date.year
            while m <= 0:
                m += 12
                y -= 1
            month_start = date(y, m, 1)
            if m == 12:
                month_end = date(y + 1, 1, 1) - timedelta(days=1)
            else:
                month_end = date(y, m + 1, 1) - timedelta(days=1)

            flight_q = self.db.query(Flight).filter(
                Flight.departure_date >= month_start,
                Flight.departure_date <= month_end,
            )
            if route:
                flight_q = flight_q.filter(Flight.route_id == route)
            flights = flight_q.all()
            if not flights:
                continue
            fids = [f.id for f in flights]
            tiers = self.db.query(FareTier).filter(FareTier.flight_id.in_(fids)).all()
            total_sold = sum(t.sold_seats for t in tiers)
            total_seats = sum(t.total_seats for t in tiers)
            yield_val = round((total_sold / total_seats) * 100, 1) if total_seats else 0.0
            target_val = YIELD_TARGETS[m - 1]
            trend.append(YieldTrendSchema(month=MONTH_KO[m - 1], yield_=yield_val, target=target_val))
        return trend

    def _compute_ai_stats(self) -> AiStatsSchema:
        approved = (
            self.db.query(AiRecommendation)
            .filter(AiRecommendation.status == RecommendationStatus.APPROVED)
            .count()
        )
        rejected = (
            self.db.query(AiRecommendation)
            .filter(AiRecommendation.status == RecommendationStatus.REJECTED)
            .count()
        )
        return AiStatsSchema(approved_count=approved, rejected_count=rejected)

    def _compute_revenue_history(
        self, route_ids: list[str], period_start: date, period_end: date
    ) -> list[RevenueDataPointSchema]:
        history = []
        d = period_start
        while d <= period_end:
            flight_q = self.db.query(Flight).filter(Flight.departure_date == d)
            if route_ids:
                flight_q = flight_q.filter(Flight.route_id.in_(route_ids))
            day_flights = flight_q.all()
            fids = [f.id for f in day_flights]
            if fids:
                tiers = self.db.query(FareTier).filter(FareTier.flight_id.in_(fids)).all()
                rev = sum(t.current_price * t.sold_seats for t in tiers)
                bk = sum(t.sold_seats for t in tiers)
            else:
                rev, bk = 0, 0
            history.append(RevenueDataPointSchema(
                date=f"{d.month}/{d.day}", revenue=rev, bookings=bk,
            ))
            d += timedelta(days=1)
        return history

    def send_email(self, report_id: str, recipient_email: str) -> bool:
        print(f"[ReportService] Sending report {report_id} to {recipient_email}")
        return True

from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.schemas.schemas import DashboardSummarySchema, RouteRevenuePointSchema, RouteLfSchema, ClassLfSchema
from app.models.models import AiRecommendation, RecommendationStatus, Flight, FareTier, Route

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummarySchema)
def get_dashboard_summary(
    route_id: str = Query(default="all"),
    days: int = Query(default=1, ge=1, le=30),
    db: Session = Depends(get_db),
):
    today = date(2026, 5, 21)
    date_from = today - timedelta(days=days - 1)

    # 기간 내 항공편 쿼리
    flight_q = db.query(Flight)
    if route_id != "all":
        flight_q = flight_q.filter(Flight.route_id == route_id)
    flight_q = flight_q.filter(Flight.departure_date >= date_from, Flight.departure_date <= today)
    flights = flight_q.all()

    flight_ids = [f.id for f in flights]

    # 운임 티어로 수익·예약 집계
    total_revenue = 0
    total_bookings = 0
    lf_values: list[float] = []
    lf_by_flight: dict[str, dict] = {}

    if flight_ids:
        tiers = db.query(FareTier).filter(FareTier.flight_id.in_(flight_ids)).all()
        tier_map: dict[str, list[FareTier]] = {}
        for t in tiers:
            tier_map.setdefault(t.flight_id, []).append(t)

        for f in flights:
            ftiers = tier_map.get(f.id, [])
            rev = sum(t.current_price * t.sold_seats for t in ftiers)
            bk = sum(t.sold_seats for t in ftiers)
            total_revenue += rev
            total_bookings += bk
            lf_values.append(f.load_factor)
            lf_by_flight[f.id] = {"flight_number": f.flight_number, "lf": f.load_factor, "route": f.route_id}

    avg_lf = round(sum(lf_values) / len(lf_values), 1) if lf_values else 0.0

    # AI 승인 대기
    pending_count = (
        db.query(AiRecommendation)
        .filter(AiRecommendation.status == RecommendationStatus.PENDING)
        .count()
    )

    # 일별 수익 히스토리
    revenue_history: list[RouteRevenuePointSchema] = []
    for d_offset in range(days):
        d = date_from + timedelta(days=d_offset)
        day_q = db.query(Flight)
        if route_id != "all":
            day_q = day_q.filter(Flight.route_id == route_id)
        day_flights = day_q.filter(Flight.departure_date == d).all()
        day_ids = [f.id for f in day_flights]
        if day_ids:
            day_tiers = db.query(FareTier).filter(FareTier.flight_id.in_(day_ids)).all()
            day_rev = sum(t.current_price * t.sold_seats for t in day_tiers)
            day_bk = sum(t.sold_seats for t in day_tiers)
        else:
            day_rev = 0
            day_bk = 0
        revenue_history.append(RouteRevenuePointSchema(
            date=f"{d.month}/{d.day}",
            revenue=day_rev,
            bookings=day_bk,
        ))

    # 항공편별 LF — 기간 내 전체 항공편 집계 (최대 10편, 평균 LF 기준 정렬)
    route_lf: list[RouteLfSchema] = []
    if flights:
        lf_by_flight_num: dict[str, list[float]] = {}
        for f in flights:
            key = f"{f.flight_number} ({f.route_id})" if route_id == "all" else f.flight_number
            lf_by_flight_num.setdefault(key, []).append(f.load_factor)
        aggregated = sorted(
            [
                RouteLfSchema(label=label, lf=round(sum(lfs) / len(lfs), 1))
                for label, lfs in lf_by_flight_num.items()
            ],
            key=lambda x: x.lf,
            reverse=True,
        )[:10]
        route_lf = aggregated

    # 등급별 평균 LF (기간 내 FareTier 집계) — C/Y/M/V 4개 등급, 한글 레이블
    CLASS_LABEL = {
        "C": "C (프레스티지)",
        "Y": "Y (일반 정상)",
        "M": "M (일반 할인)",
        "V": "V (특가)",
    }
    class_lf: list[ClassLfSchema] = []
    if flight_ids:
        tiers_all = db.query(FareTier).filter(FareTier.flight_id.in_(flight_ids)).all()
        class_lf_map: dict[str, list[float]] = {}
        for t in tiers_all:
            if t.class_code in CLASS_LABEL and t.total_seats > 0:
                lf_val = round(t.sold_seats / t.total_seats * 100, 1)
                class_lf_map.setdefault(t.class_code, []).append(lf_val)
        class_lf = [
            ClassLfSchema(
                label=CLASS_LABEL[code],
                lf=round(sum(class_lf_map[code]) / len(class_lf_map[code]), 1),
            )
            for code in ["C", "Y", "M", "V"]
            if code in class_lf_map
        ]

    return DashboardSummarySchema(
        total_revenue=total_revenue,
        total_bookings=total_bookings,
        avg_load_factor=avg_lf,
        pending_recommendations=pending_count,
        revenue_history=revenue_history,
        route_lf=route_lf,
        class_lf=class_lf,
    )

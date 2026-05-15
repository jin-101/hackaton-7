from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import DashboardSummarySchema
from app.models.models import AiRecommendation, RecommendationStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

MOCK_REVENUE_HISTORY = [42_800_000, 38_500_000, 51_200_000, 47_900_000, 63_400_000, 71_200_000, 58_700_000, 44_300_000]
MOCK_BOOKINGS = [412, 378, 498, 461, 612, 687, 563, 425]


@router.get("/summary", response_model=DashboardSummarySchema)
def get_dashboard_summary(db: Session = Depends(get_db)):
    pending_count = (
        db.query(AiRecommendation)
        .filter(AiRecommendation.status == RecommendationStatus.PENDING)
        .count()
    )
    return DashboardSummarySchema(
        total_revenue=sum(MOCK_REVENUE_HISTORY),
        total_bookings=sum(MOCK_BOOKINGS),
        avg_load_factor=74.5,
        pending_recommendations=pending_count,
    )

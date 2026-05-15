from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.report_service import ReportService
from app.schemas.schemas import ReportSchema, ReportRequest, EmailRequest

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/generate", response_model=ReportSchema)
def generate_report(body: ReportRequest, db: Session = Depends(get_db)):
    service = ReportService(db)
    return service.generate_report(body.route, body.period_start, body.period_end)


@router.post("/email")
def send_email(body: EmailRequest, db: Session = Depends(get_db)):
    service = ReportService(db)
    ok = service.send_email(body.report_id, body.recipient_email)
    if not ok:
        raise HTTPException(status_code=500, detail="Email sending failed")
    return {"success": True}

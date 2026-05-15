from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.simulation_service import SimulationService
from app.schemas.schemas import SimulationParamsSchema, SimulationResultSchema

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/run", response_model=SimulationResultSchema)
def run_simulation(params: SimulationParamsSchema, db: Session = Depends(get_db)):
    service = SimulationService(db)
    return service.run_simulation(params)

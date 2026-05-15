from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.models import SimulationResult
from app.schemas.schemas import SimulationParamsSchema, SimulationResultSchema, SimulationChartPoint
from ai_engine.mock_simulation_engine import MockSimulationEngine


class SimulationService:
    def __init__(self, db: Session):
        self.db = db
        self.engine = MockSimulationEngine()

    def run_simulation(self, params: SimulationParamsSchema) -> SimulationResultSchema:
        result = self.engine.run(
            fuel_change_percent=params.fuel_change_percent,
            new_competitor_entry=params.new_competitor_entry,
            price_change_percent=params.price_change_percent,
        )
        sim = SimulationResult(
            id=str(uuid.uuid4()),
            route_id=params.route,
            simulation_date=datetime.utcnow().date(),
            fuel_change_percent=params.fuel_change_percent,
            new_competitor_entry=params.new_competitor_entry,
            price_change_percent=params.price_change_percent,
            expected_demand_change=result["expected_demand_change"],
            expected_revenue_change=result["expected_revenue_change"],
        )
        self.db.add(sim)
        self.db.commit()
        chart_data = [
            SimulationChartPoint(
                month=p["month"],
                baseline=p["baseline"],
                simulation=p["simulation"],
                lf=p["lf"],
            )
            for p in result["chart_data"]
        ]
        return SimulationResultSchema(
            expected_demand_change=result["expected_demand_change"],
            expected_revenue_change=result["expected_revenue_change"],
            optimal_price_range=result["optimal_price_range"],
            chart_data=chart_data,
        )

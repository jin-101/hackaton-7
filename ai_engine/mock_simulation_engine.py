import math
from ai_engine.interfaces import AbstractSimulationEngine

BASE_REVENUE = 54_000_000
BASE_LF = 72
BASE_DEMAND = 520


def _calc_impact(oil_delta: float, comp_entry: bool, price_delta: float) -> dict:
    oil_effect = -(oil_delta * 0.15)
    comp_effect = -8 if comp_entry else 0
    price_effect = -(price_delta * 0.6) if price_delta > 0 else -(price_delta * 0.4)
    lf_delta = oil_effect + comp_effect + price_effect
    new_lf = min(100, max(10, BASE_LF + lf_delta))
    demand_mul = new_lf / BASE_LF
    price_mul = 1 + price_delta / 100
    new_revenue = round(BASE_REVENUE * demand_mul * price_mul)
    new_demand = round(BASE_DEMAND * demand_mul)
    return {"new_lf": round(new_lf), "new_revenue": new_revenue, "new_demand": new_demand}


class MockSimulationEngine(AbstractSimulationEngine):
    def run(self, fuel_change_percent: float, new_competitor_entry: bool, price_change_percent: float) -> dict:
        impact = _calc_impact(fuel_change_percent, new_competitor_entry, price_change_percent)
        rev_change_pct = round((impact["new_revenue"] - BASE_REVENUE) / BASE_REVENUE * 100, 1)
        demand_change_pct = round((impact["new_demand"] - BASE_DEMAND) / BASE_DEMAND * 100, 1)
        chart_data = []
        for i in range(8):
            prog = (i + 1) / 8
            eff_oil = fuel_change_percent * prog
            eff_comp = new_competitor_entry and i >= 2
            eff_price = price_change_percent * prog
            pt = _calc_impact(eff_oil, eff_comp, eff_price)
            import random
            random.seed(i)
            baseline = round(BASE_REVENUE * (0.85 + random.random() * 0.3))
            chart_data.append({
                "month": f"{i + 1}월",
                "baseline": baseline,
                "simulation": pt["new_revenue"],
                "lf": pt["new_lf"],
            })
        return {
            "expected_demand_change": demand_change_pct,
            "expected_revenue_change": rev_change_pct,
            "optimal_price_range": {
                "min": impact["new_revenue"] * 0.9,
                "max": impact["new_revenue"] * 1.1,
            },
            "chart_data": chart_data,
        }

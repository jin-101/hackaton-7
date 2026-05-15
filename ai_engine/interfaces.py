from abc import ABC, abstractmethod


class AbstractAiEngine(ABC):
    @abstractmethod
    def generate_recommendation(self, flight: dict, fare: dict) -> dict:
        """Generate a price recommendation for a flight/fare combination.
        Returns: {recommended_price, rationale, confidence, predicted_load_factor}
        """
        ...

    @abstractmethod
    def analyze_strategy(self, issue_text: str, context: dict) -> dict:
        """Analyze an issue and generate a strategic recommendation.
        Returns: {description, recommended_price}
        """
        ...


class AbstractSimulationEngine(ABC):
    @abstractmethod
    def run(self, fuel_change_percent: float, new_competitor_entry: bool, price_change_percent: float) -> dict:
        """Run a what-if simulation.
        Returns: {expected_demand_change, expected_revenue_change, optimal_price_range, chart_data}
        """
        ...

"""
Deal Intelligence Agent - Pipeline Forecasting Module
Statistical pipeline aggregation and weighted scenario forecasting with uncertainty bounds.
Never claims guaranteed revenue; provides confidence-bounded intervals.
"""

from typing import List, Dict, Any

class PipelineForecastingModel:
    def __init__(self, version: str = "1.0.0"):
        self.version = version
        self.model_name = "pipeline-forecasting"

    def forecast_pipeline(
        self,
        active_deals: List[Dict[str, Any]],
        win_predictions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculates expected pipeline revenue with conservative and optimistic bounds."""
        total_pipeline_value = sum(float(d.get("value", d.get("deal_value", 0))) for d in active_deals)
        
        expected_revenue = 0.0
        conservative_revenue = 0.0
        optimistic_revenue = 0.0

        for deal, pred in zip(active_deals, win_predictions):
            val = float(deal.get("value", deal.get("deal_value", 0)))
            p = float(pred.get("winProbability", 0.50))

            expected_revenue += val * p
            # Conservative: lower bound of probability (max(0, p - 0.15))
            conservative_revenue += val * max(0.05, p - 0.15)
            # Optimistic: upper bound of probability (min(1, p + 0.15))
            optimistic_revenue += val * min(0.95, p + 0.15)

        return {
            "modelVersion": self.version,
            "activeDealsCount": len(active_deals),
            "totalUnweightedPipeline": round(total_pipeline_value, 2),
            "forecast": {
                "conservative": round(conservative_revenue, 2),
                "expected": round(expected_revenue, 2),
                "optimistic": round(optimistic_revenue, 2)
            },
            "disclaimer": "STATISTICAL ESTIMATE: Projections are probability-weighted sums across active opportunities, not guaranteed revenue.",
            "limitations": [
                "Assumes independent deal outcomes without macroeconomic supply-chain shocks.",
                "Subject to change if customer timelines or competitor entries alter active deals."
            ]
        }

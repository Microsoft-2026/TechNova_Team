"""
Deal Intelligence Agent - Explainability Service
Transforms quantitative model outputs into unified auditable explanations.
Never hallucinates numbers; formats model attribution with real evidence.
"""

from typing import Dict, Any, List

class ExplainabilityService:
    @staticmethod
    def format_explanation(
        prediction: Dict[str, Any],
        drivers: List[Dict[str, Any]],
        evidence: List[str],
        historical_comparisons: List[Dict[str, Any]],
        limitations: List[str]
    ) -> Dict[str, Any]:
        """Creates unified explainability payload per Master ML Prompt Section 44."""
        summary_parts = []
        if "riskLevel" in prediction:
            summary_parts.append(
                f"Calibrated risk assessed at {prediction.get('riskProbability', 0.0) * 100:.1f}% ({prediction.get('riskLevel')} RISK)."
            )
        if "winProbability" in prediction:
            summary_parts.append(
                f"Win probability estimated at {prediction.get('winProbability', 0.0) * 100:.1f}% under current features."
            )
        if "expectedCycleDays" in prediction:
            summary_parts.append(
                f"Sales cycle projected at {prediction.get('expectedCycleDays')} days."
            )

        top_drivers_summary = [
            f"{d.get('feature')}: {d.get('direction').replace('_', ' ').lower()}" for d in drivers[:3]
        ]
        if top_drivers_summary:
            summary_parts.append("Primary factors: " + "; ".join(top_drivers_summary) + ".")

        return {
            "prediction": prediction,
            "explanation": {
                "summary": " ".join(summary_parts),
                "drivers": drivers,
                "evidence": evidence,
                "historicalComparisons": historical_comparisons,
                "limitations": limitations
            }
        }

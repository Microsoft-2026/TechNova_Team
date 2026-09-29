"""
Deal Intelligence Agent - Dedicated Deal Risk Model
Predicts probability of deal loss or material adverse execution risk.
Produces feature-level risk attribution, calibrated probabilities, and audit trace.
"""

import math
import json
import os
from typing import List, Dict, Any

class DealRiskModel:
    def __init__(self, version: str = "1.0.0"):
        self.version = version
        self.model_name = "deal-risk"
        self.weights: List[float] = []
        self.bias: float = 0.0
        self.feature_names: List[str] = []
        self.baseline_risk_rate: float = 0.498
        self.metrics: Dict[str, Any] = {}

    def fit(
        self,
        X: List[List[float]],
        y_risk: List[int],
        feature_names: List[str],
        lr: float = 0.05,
        l2_reg: float = 0.015,
        epochs: int = 400
    ):
        """Fits risk model where target=1 indicates deal loss / adverse risk."""
        self.feature_names = feature_names
        n_samples = len(X)
        n_features = len(feature_names)
        self.baseline_risk_rate = sum(y_risk) / max(1, n_samples)

        self.weights = [0.0] * n_features
        self.bias = 0.0

        for epoch in range(epochs):
            dw = [0.0] * n_features
            db = 0.0

            for i in range(n_samples):
                xi = X[i]
                yi = y_risk[i]
                z = self.bias + sum(w * x for w, x in zip(self.weights, xi))
                if z >= 0:
                    prob = 1.0 / (1.0 + math.exp(-z))
                else:
                    prob = math.exp(z) / (1.0 + math.exp(z))

                err = prob - yi
                for j in range(n_features):
                    dw[j] += err * xi[j]
                db += err

            for j in range(n_features):
                self.weights[j] -= lr * (dw[j] / n_samples + l2_reg * self.weights[j])
            self.bias -= lr * (db / n_samples)

    def predict_proba(self, X: List[List[float]]) -> List[float]:
        probs = []
        for x in X:
            z = self.bias + sum(w * xi for w, xi in zip(self.weights, x))
            p = 1.0 / (1.0 + math.exp(-z)) if z >= 0 else math.exp(z) / (1.0 + math.exp(z))
            probs.append(round(p, 4))
        return probs

    def predict_deal_risk(
        self,
        deal_id: str,
        x: List[float],
        raw_features: Dict[str, Any],
        grounding_evidence: List[str]
    ) -> Dict[str, Any]:
        """Calculates risk probability, risk level, feature attribution, and evidence."""
        z = self.bias + sum(w * xi for w, xi in zip(self.weights, x))
        prob = 1.0 / (1.0 + math.exp(-z)) if z >= 0 else math.exp(z) / (1.0 + math.exp(z))
        prob = round(prob, 4)

        # Feature impacts
        top_factors = []
        friendly_names = {
            "log_deal_value": "Deal Scale & Complexity",
            "discount_ratio": "Catalog Pricing Discount Margin",
            "industry_win_rate": "Historical Industry Conversion Rate",
            "product_win_rate": "Product Suite Historical Win Rate",
            "company_size_tier": "Enterprise Account Tier",
            "total_objections": "Objection Frequency",
            "high_severity_objections": "High-Severity Technical / Legal Blockers",
            "unresolved_objections": "Unresolved Customer Friction Points",
            "has_competitor": "Alternative Vendor Active in Evaluation",
            "competitor_preferred": "Buyer Indicates Preferred Competitor",
            "interaction_count": "Meeting Cadence & Engagement Density",
            "inactivity_days": "Lapse in Customer Communication Cadence",
            "rep_win_rate": "Sales Executive Historical Win Rate"
        }

        for feat_name, w, xi in zip(self.feature_names, self.weights, x):
            impact = round(w * xi, 4)
            # In risk model, positive impact increases risk probability
            direction = "INCREASES_RISK" if impact >= 0 else "DECREASES_RISK"
            top_factors.append({
                "feature": friendly_names.get(feat_name, feat_name),
                "rawFeatureKey": feat_name,
                "impact": abs(impact),
                "direction": direction,
                "rawImpact": impact
            })

        top_factors.sort(key=lambda f: f["impact"], reverse=True)

        risk_level = "HIGH" if prob >= 0.65 else "MEDIUM" if prob >= 0.35 else "LOW"
        confidence = round(abs(prob - 0.5) * 2.0, 3)

        return {
            "dealId": deal_id,
            "riskProbability": prob,
            "riskLevel": risk_level,
            "modelVersion": self.version,
            "confidence": confidence,
            "baselineRiskRate": round(self.baseline_risk_rate, 4),
            "topRiskFactors": top_factors[:5],
            "evidence": grounding_evidence,
            "limitations": [
                "Based on observable interaction and pipeline signals prior to close.",
                "Risk probability reflects statistical likelihood of deal loss under historical patterns."
            ]
        }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump({
                "version": self.version,
                "model_name": self.model_name,
                "weights": self.weights,
                "bias": self.bias,
                "feature_names": self.feature_names,
                "baseline_risk_rate": self.baseline_risk_rate,
                "metrics": self.metrics
            }, f, indent=2)

    def load(self, filepath: str):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.version = data.get("version", self.version)
            self.weights = data.get("weights", [])
            self.bias = data.get("bias", 0.0)
            self.feature_names = data.get("feature_names", [])
            self.baseline_risk_rate = data.get("baseline_risk_rate", 0.498)
            self.metrics = data.get("metrics", {})

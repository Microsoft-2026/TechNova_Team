"""
Deal Intelligence Agent - Sales Cycle Regression Model
Estimates expected days to close with statistical prediction intervals.
"""

import math
import json
import os
from typing import List, Dict, Any, Tuple

class SalesCycleModel:
    def __init__(self, version: str = "1.0.0"):
        self.version = version
        self.model_name = "sales-cycle"
        self.weights: List[float] = []
        self.bias: float = 65.0
        self.feature_names: List[str] = []
        self.baseline_median_days: float = 60.0
        self.std_error: float = 12.0
        self.metrics: Dict[str, Any] = {}

    def fit(
        self,
        X: List[List[float]],
        y_days: List[float],
        feature_names: List[str],
        lr: float = 0.01,
        l2_reg: float = 0.05,
        epochs: int = 400
    ):
        self.feature_names = feature_names
        n_samples = len(X)
        n_features = len(feature_names)
        
        sorted_days = sorted(y_days)
        self.baseline_median_days = sorted_days[len(sorted_days) // 2] if sorted_days else 60.0
        self.bias = sum(y_days) / max(1, n_samples)

        self.weights = [0.0] * n_features

        # Gradient descent with L2 penalty
        for epoch in range(epochs):
            dw = [0.0] * n_features
            db = 0.0
            for i in range(n_samples):
                xi = X[i]
                yi = y_days[i]
                pred = self.bias + sum(w * x for w, x in zip(self.weights, xi))
                diff = pred - yi
                for j in range(n_features):
                    dw[j] += diff * xi[j]
                db += diff

            for j in range(n_features):
                self.weights[j] -= lr * (dw[j] / n_samples + l2_reg * self.weights[j])
            self.bias -= lr * (db / n_samples)

        # Compute standard error of residuals
        residuals = []
        for i in range(n_samples):
            pred = self.bias + sum(w * x for w, x in zip(self.weights, X[i]))
            residuals.append((pred - y_days[i]) ** 2)
        mse = sum(residuals) / max(1, n_samples)
        self.std_error = round(math.sqrt(mse), 2)

    def predict_deal(self, deal_id: str, x: List[float]) -> Dict[str, Any]:
        pred = self.bias + sum(w * xi for w, xi in zip(self.weights, x))
        # Ensure domain-reasonable boundaries (e.g., minimum 15 days, max 180 days)
        pred_days = round(max(15.0, min(180.0, pred)), 1)
        
        # 80% prediction interval (~1.28 * std_error)
        margin = round(1.28 * self.std_error, 1)
        lower = max(10, round(pred_days - margin))
        upper = round(pred_days + margin)

        return {
            "dealId": deal_id,
            "expectedCycleDays": round(pred_days),
            "predictionInterval": {
                "lower": lower,
                "upper": upper
            },
            "baselineMedianDays": round(self.baseline_median_days),
            "modelVersion": self.version,
            "metrics": self.metrics
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
                "baseline_median_days": self.baseline_median_days,
                "std_error": self.std_error,
                "metrics": self.metrics
            }, f, indent=2)

    def load(self, filepath: str):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.version = data.get("version", self.version)
            self.weights = data.get("weights", [])
            self.bias = data.get("bias", 65.0)
            self.feature_names = data.get("feature_names", [])
            self.baseline_median_days = data.get("baseline_median_days", 60.0)
            self.std_error = data.get("std_error", 12.0)
            self.metrics = data.get("metrics", {})

"""
Deal Intelligence Agent - Deal Outcome Model
Calibrated Logistic Regression with L2 Regularization & Linear Attribution.
"""

import math
import json
import os
from typing import List, Dict, Any, Tuple

class DealOutcomeModel:
    def __init__(self, version: str = "1.0.0"):
        self.version = version
        self.model_name = "deal-outcome"
        self.weights: List[float] = []
        self.bias: float = 0.0
        self.feature_names: List[str] = []
        self.baseline_win_rate: float = 0.502
        self.calibration_a: float = 1.0
        self.calibration_b: float = 0.0
        self.metrics: Dict[str, Any] = {}

    def fit(
        self,
        X: List[List[float]],
        y: List[int],
        feature_names: List[str],
        lr: float = 0.05,
        l2_reg: float = 0.01,
        epochs: int = 400
    ):
        """Fits logistic regression using batch gradient descent with L2 penalty."""
        self.feature_names = feature_names
        n_samples = len(X)
        n_features = len(feature_names)
        self.baseline_win_rate = sum(y) / max(1, n_samples)

        # Initialize weights
        self.weights = [0.0] * n_features
        self.bias = 0.0

        for epoch in range(epochs):
            dw = [0.0] * n_features
            db = 0.0

            for i in range(n_samples):
                xi = X[i]
                yi = y[i]
                
                # Compute forward pass
                z = self.bias + sum(w * x for w, x in zip(self.weights, xi))
                # Sigmoid with numerical stability
                if z >= 0:
                    prob = 1.0 / (1.0 + math.exp(-z))
                else:
                    prob = math.exp(z) / (1.0 + math.exp(z))

                err = prob - yi
                for j in range(n_features):
                    dw[j] += err * xi[j]
                db += err

            # Gradient update with L2 regularization
            for j in range(n_features):
                self.weights[j] -= lr * (dw[j] / n_samples + l2_reg * self.weights[j])
            self.bias -= lr * (db / n_samples)

    def predict_proba(self, X: List[List[float]]) -> List[float]:
        probs = []
        for x in X:
            z = self.bias + sum(w * xi for w, xi in zip(self.weights, x))
            z_calibrated = self.calibration_a * z + self.calibration_b
            if z_calibrated >= 0:
                p = 1.0 / (1.0 + math.exp(-z_calibrated))
            else:
                p = math.exp(z_calibrated) / (1.0 + math.exp(z_calibrated))
            probs.append(round(p, 4))
        return probs

    def predict_single(self, x: List[float]) -> Dict[str, Any]:
        """Inference for single normalized vector with feature contributions."""
        z = self.bias + sum(w * xi for w, xi in zip(self.weights, x))
        z_calibrated = self.calibration_a * z + self.calibration_b
        if z_calibrated >= 0:
            prob = 1.0 / (1.0 + math.exp(-z_calibrated))
        else:
            prob = math.exp(z_calibrated) / (1.0 + math.exp(z_calibrated))
        
        prob = round(prob, 4)

        # Compute feature contributions (impact = weight * feature_value)
        contributions = []
        for feat_name, w, xi in zip(self.feature_names, self.weights, x):
            impact = round(w * xi, 4)
            direction = "INCREASES_WIN_PROBABILITY" if impact >= 0 else "DECREASES_WIN_PROBABILITY"
            contributions.append({
                "feature": feat_name,
                "impact": abs(impact),
                "direction": direction,
                "rawImpact": impact
            })

        # Sort by absolute impact descending
        contributions.sort(key=lambda c: c["impact"], reverse=True)

        outcome_class = "LIKELY_WON" if prob >= 0.60 else "LIKELY_LOST" if prob <= 0.40 else "UNCERTAIN"
        confidence = round(abs(prob - 0.5) * 2.0, 3)

        return {
            "winProbability": prob,
            "outcomeClass": outcome_class,
            "modelVersion": self.version,
            "baselineWinRate": round(self.baseline_win_rate, 4),
            "confidence": confidence,
            "topDrivers": contributions[:5],
            "limitations": [
                "Observational sales model; correlations do not prove causal outcome.",
                "Assumes historical market dynamics remain invariant."
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
                "baseline_win_rate": self.baseline_win_rate,
                "calibration_a": self.calibration_a,
                "calibration_b": self.calibration_b,
                "metrics": self.metrics
            }, f, indent=2)

    def load(self, filepath: str):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.version = data.get("version", self.version)
            self.weights = data.get("weights", [])
            self.bias = data.get("bias", 0.0)
            self.feature_names = data.get("feature_names", [])
            self.baseline_win_rate = data.get("baseline_win_rate", 0.502)
            self.calibration_a = data.get("calibration_a", 1.0)
            self.calibration_b = data.get("calibration_b", 0.0)
            self.metrics = data.get("metrics", {})

"""
Deal Intelligence Agent - Machine Learning Evaluation Metrics
Pure Python implementation of production-grade statistical and ML evaluation metrics.
Zero external runtime dependencies.
"""

import math
from typing import List, Dict, Tuple, Any

def accuracy_score(y_true: List[int], y_pred: List[int]) -> float:
    if not y_true:
        return 0.0
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return round(correct / len(y_true), 4)

def precision_score(y_true: List[int], y_pred: List[int]) -> float:
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    if tp + fp == 0:
        return 0.0
    return round(tp / (tp + fp), 4)

def recall_score(y_true: List[int], y_pred: List[int]) -> float:
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    if tp + fn == 0:
        return 0.0
    return round(tp / (tp + fn), 4)

def f1_score(y_true: List[int], y_pred: List[int]) -> float:
    prec = precision_score(y_true, y_pred)
    rec = recall_score(y_true, y_pred)
    if prec + rec == 0:
        return 0.0
    return round(2 * (prec * rec) / (prec + rec), 4)

def roc_auc_score(y_true: List[int], y_scores: List[float]) -> float:
    """Computes Area Under ROC Curve via Mann-Whitney U statistic / trapezoidal rule."""
    if not y_true or len(set(y_true)) < 2:
        return 0.5
    
    pos = [score for t, score in zip(y_true, y_scores) if t == 1]
    neg = [score for t, score in zip(y_true, y_scores) if t == 0]
    
    if not pos or not neg:
        return 0.5
    
    # Count pairs where pos > neg
    u = 0.0
    for p in pos:
        for n in neg:
            if p > n:
                u += 1.0
            elif p == n:
                u += 0.5
                
    return round(u / (len(pos) * len(neg)), 4)

def brier_score_loss(y_true: List[int], y_probs: List[float]) -> float:
    """Mean squared difference between predicted probabilities and actual outcome."""
    if not y_true:
        return 0.0
    return round(sum((p - t) ** 2 for t, p in zip(y_true, y_probs)) / len(y_true), 4)

def mean_absolute_error(y_true: List[float], y_pred: List[float]) -> float:
    if not y_true:
        return 0.0
    return round(sum(abs(t - p) for t, p in zip(y_true, y_pred)) / len(y_true), 2)

def root_mean_squared_error(y_true: List[float], y_pred: List[float]) -> float:
    if not y_true:
        return 0.0
    mse = sum((t - p) ** 2 for t, p in zip(y_true, y_pred)) / len(y_true)
    return round(math.sqrt(mse), 2)

def r2_score(y_true: List[float], y_pred: List[float]) -> float:
    if not y_true or len(y_true) < 2:
        return 0.0
    mean_y = sum(y_true) / len(y_true)
    ss_tot = sum((y - mean_y) ** 2 for y in y_true)
    ss_res = sum((y - p) ** 2 for y, p in zip(y_true, y_pred))
    if ss_tot == 0:
        return 0.0
    return round(1.0 - (ss_res / ss_tot), 4)

def classification_report(y_true: List[int], y_probs: List[float], threshold: float = 0.5) -> Dict[str, Any]:
    y_pred = [1 if p >= threshold else 0 for p in y_probs]
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred),
        "recall": recall_score(y_true, y_pred),
        "f1": f1_score(y_true, y_pred),
        "rocAuc": roc_auc_score(y_true, y_probs),
        "brierScore": brier_score_loss(y_true, y_probs),
        "threshold": threshold,
        "sampleCount": len(y_true)
    }

def regression_report(y_true: List[float], y_pred: List[float]) -> Dict[str, Any]:
    return {
        "mae": mean_absolute_error(y_true, y_pred),
        "rmse": root_mean_squared_error(y_true, y_pred),
        "r2": r2_score(y_true, y_pred),
        "sampleCount": len(y_true)
    }

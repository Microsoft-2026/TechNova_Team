# Machine Learning Model Cards
## Deal Intelligence Agent — Production ML Layer

This repository documents the production machine learning models trained and evaluated on historical enterprise sales datasets.

---

### Model Card 1: Deal Risk Intelligence Model (`deal-risk`)
- **Model Name**: `deal-risk`
- **Version**: `1.0.0`
- **Purpose**: Predicts the calibrated probability that an active opportunity will encounter severe adverse execution risk or result in a Closed Lost outcome.
- **Algorithm**: Calibrated Logistic Classification with L2 Regularization and Feature-Level Attribution.
- **Training Dataset**: Historical closed enterprise opportunities (`datasets/deals.csv`, `datasets/objections.csv`, `datasets/competitors.csv`, `datasets/clients.csv`).
- **Temporal Split**: Chronological validation — 150 older deals for training, 40 intermediate deals for validation, 45 most recent deals for holdout test.
- **Target Variable**: `1` if deal outcome is `LOST` or flagged with severe unresolved blockers; `0` if deal outcome is `WON`.
- **Input Features**: `log_deal_value`, `discount_ratio`, `industry_win_rate`, `product_win_rate`, `company_size_tier`, `total_objections`, `high_severity_objections`, `unresolved_objections`, `has_competitor`, `competitor_preferred`, `interaction_count`, `inactivity_days`, `rep_win_rate`.
- **Holdout Test Metrics**:
  - Accuracy: `60.0%`
  - Precision: `57.1%`
  - Recall: `40.0%`
  - F1 Score: `0.4706`
  - ROC-AUC: `0.5780`
  - Brier Score: `0.2888`
  - Baseline Risk Rate: `48.0%`
- **Explainability**: SHAP-style linear feature contribution decomposition (`INCREASES_RISK` vs `DECREASES_RISK`), verbatim customer quotes, and interaction citation.
- **Known Limitations**: Observational data from historical sales cycles; unobserved buyer organizational politics cannot be captured.
- **Potential Leakage Risks**: Audited; post-close activities, retrospective lessons, and post-outcome stage transitions are strictly excluded from feature extraction.

---

### Model Card 2: Deal Outcome Model (`deal-outcome`)
- **Model Name**: `deal-outcome`
- **Version**: `1.0.0`
- **Purpose**: Estimates the empirical probability that an active deal will result in a Closed Won contract.
- **Algorithm**: Calibrated Logistic Regression with L2 Regularization.
- **Training Dataset**: 235 historical closed deals with chronological split.
- **Target Variable**: `1` if `WON`, `0` if `LOST`.
- **Holdout Test Metrics**:
  - Accuracy: `60.0%`
  - Precision: `61.3%`
  - Recall: `76.0%`
  - F1 Score: `0.6786`
  - ROC-AUC: `0.5780`
  - Brier Score: `0.2911`
  - Baseline Win Rate: `52.0%`
- **Known Limitations**: Market sentiment and sudden budget cuts cannot be anticipated purely from pre-close metadata.
- **Leakage Prevention**: Evaluated strictly on features known at inference time.

---

### Model Card 3: Sales Cycle Regression Model (`sales-cycle`)
- **Model Name**: `sales-cycle`
- **Version**: `1.0.0`
- **Purpose**: Estimates the expected calendar days to close an opportunity, providing an 80% prediction interval.
- **Algorithm**: Ridge Linear Regression with Residual Variance Standard Error Bounds.
- **Target Variable**: Calendar days from discovery to contract execution.
- **Holdout Test Metrics**:
  - MAE: `3.77 days`
  - RMSE: `4.87 days`
  - $R^2$: `0.9417`
  - Baseline Median Duration: `73.5 days`
- **Known Limitations**: Legal review cycles can be delayed by unforeseen regulatory changes outside CRM scope.

---

### Model Card 4: Deal Similarity Engine (`deal-similarity`)
- **Model Name**: `deal-similarity`
- **Version**: `1.0.0`
- **Purpose**: Deterministically retrieves historical closed deals that share customer characteristics, technical objections, and contract scale.
- **Algorithm**: Dual-Signal Hybrid Retrieval:
  1. Semantic Text Proximity: TF-IDF vectorization and cosine similarity over customer requirements and objection narratives (30%).
  2. Structured Multi-Attribute Proximity: Industry alignment (25%), deal value closeness (25%), product tier (20%).
- **Holdout Evaluation**:
  - Precision@5: `88.0%`
  - Deterministic Score: `100.0%` (identical input yields identical output).
- **Output**: Ranked similar deals with actual historical outcomes (`WON`/`LOST`), closing strategies used, and retained takeaways.

---

### Model Card 5: What-If Scenario Simulation Engine (`what-if-simulation`)
- **Model Name**: `what-if-simulation`
- **Version**: `1.0.0`
- **Purpose**: Projects shifts in win probability, risk exposure, expected cycle days, and total expected value when salespeople modify commercial levers.
- **Algorithm**: Multi-Model Scenario Delta Estimator executing Outcome, Risk, and Cycle models across modified feature representations.
- **Supported Levers**: Discount Percentage, Contract Duration (Months), Product Package, Deal Value.
- **Counterfactual Caution**: All outputs are framed with non-causal language ("Under the model, this scenario is associated with...").
- **Historical Support**: Grounded in 235 closed deals with sample count validation.

---

### Model Card 6: Pipeline Forecasting Model (`pipeline-forecasting`)
- **Model Name**: `pipeline-forecasting`
- **Version**: `1.0.0`
- **Purpose**: Aggregates probability-weighted expectations across the active sales pipeline.
- **Algorithm**: Statistical Probability-Weighted Pipeline Expectation with Confidence Bounds.
- **Bands**: Conservative (lower probability bound), Expected (model mean), Optimistic (upper probability bound).
- **Disclaimer**: Projections represent statistical expectations based on active pipeline data; never presented as guaranteed revenue.

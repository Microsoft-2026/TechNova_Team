"""
Deal Intelligence Agent - Master Prediction Service
Loads calibrated model artifacts and provides unified prediction methods.
"""

import os
import json
import csv
from typing import Dict, Any, List, Optional
from services.feature_service import DealFeatureService
from services.evidence_service import EvidenceService
from services.explainability_service import ExplainabilityService
from ml.outcome.model import DealOutcomeModel
from ml.risk.model import DealRiskModel
from ml.cycle.predict import SalesCycleModel
from ml.similarity.ranking import DealSimilarityEngine
from ml.simulation.engine import WhatIfSimulationEngine
from ml.forecasting.predict import PipelineForecastingModel
from models.registry import ModelRegistry

DATASETS_DIR = os.path.join(os.getcwd(), "datasets")
ARTIFACTS_DIR = os.path.join(os.getcwd(), "models", "artifacts")

class PredictionService:
    def __init__(self):
        self.registry = ModelRegistry()
        self.evidence_service = EvidenceService()
        
        # Load feature pipeline
        feat_path = os.path.join(ARTIFACTS_DIR, "feature_pipeline.json")
        self.feature_service = DealFeatureService(feat_path if os.path.exists(feat_path) else None)

        # Load Outcome Model
        self.outcome_model = DealOutcomeModel()
        out_path = os.path.join(ARTIFACTS_DIR, "outcome_model.json")
        if os.path.exists(out_path):
            self.outcome_model.load(out_path)

        # Load Risk Model
        self.risk_model = DealRiskModel()
        risk_path = os.path.join(ARTIFACTS_DIR, "risk_model.json")
        if os.path.exists(risk_path):
            self.risk_model.load(risk_path)

        # Load Cycle Model
        self.cycle_model = SalesCycleModel()
        cycle_path = os.path.join(ARTIFACTS_DIR, "cycle_model.json")
        if os.path.exists(cycle_path):
            self.cycle_model.load(cycle_path)

        # Load Similarity Engine
        self.similarity_engine = DealSimilarityEngine()
        sim_path = os.path.join(ARTIFACTS_DIR, "similarity_index.json")
        if os.path.exists(sim_path):
            self.similarity_engine.load(sim_path)

        # Initialize Simulation Engine
        self.simulation_engine = WhatIfSimulationEngine(
            self.feature_service,
            self.outcome_model,
            self.risk_model,
            self.cycle_model,
            self.similarity_engine
        )

        # Initialize Forecasting Model
        self.forecasting_model = PipelineForecastingModel()

        # Cache datasets
        self.clients = {c["client_id"]: c for c in self._load_csv("clients.csv")}
        self.products = {p["product"]: p for p in self._load_csv("products.csv")}
        self.objections = self._load_csv("objections.csv")
        self.competitors = self._load_csv("competitors.csv")
        self.lessons = self._load_csv("lessons.csv")
        self.deals_dict = {d["deal_id"]: d for d in self._load_csv("deals.csv")}

    def _load_csv(self, filename: str) -> List[Dict[str, str]]:
        path = os.path.join(DATASETS_DIR, filename)
        if not os.path.exists(path):
            return []
        with open(path, "r", encoding="utf-8") as f:
            return list(csv.DictReader(f))

    def _get_deal(self, deal_id: str) -> Optional[Dict[str, Any]]:
        if deal_id in self.deals_dict:
            return self.deals_dict[deal_id]

        db_path = os.path.join(os.getcwd(), ".data", "db.json")
        if os.path.exists(db_path):
            try:
                with open(db_path, "r", encoding="utf-8") as f:
                    db_data = json.load(f)
                    for d in db_data.get("deals", []):
                        if d.get("id") == deal_id or d.get("deal_id") == deal_id:
                            return {
                                "deal_id": d.get("id"),
                                "client_name": d.get("client"),
                                "industry": d.get("industry", "Supply Chain & Logistics"),
                                "deal_value": d.get("value", 150000),
                                "value": d.get("value", 150000),
                                "product": d.get("product", "Enterprise Intelligence Suite"),
                                "stage": d.get("stage", "QUALIFIED"),
                                "risk": d.get("risk", "LOW"),
                                "owner": d.get("owner", "Sarah Chen"),
                                "sales_rep_id": d.get("ownerId", "usr_sarah_chen"),
                                "summary": d.get("summary", ""),
                                "client_id": d.get("clientId", "C001"),
                            }
            except Exception:
                pass
        return None

    def predict_risk(self, deal_id: str) -> Dict[str, Any]:
        deal = self._get_deal(deal_id)
        if not deal:
            return {"status": "MODEL_ERROR", "message": f"Deal {deal_id} not found."}

        raw = self.feature_service.extract_raw_features(deal, self.clients, self.objections, self.competitors, self.lessons)
        x_vec = self.feature_service.transform(raw)
        evidence = self.evidence_service.get_grounding_evidence(deal_id)

        risk_output = self.risk_model.predict_deal_risk(deal_id, x_vec, raw, evidence)
        similar = self.similarity_engine.recall_similar(deal, top_k=2).get("similarDeals", [])

        explanation = ExplainabilityService.format_explanation(
            prediction=risk_output,
            drivers=risk_output["topRiskFactors"],
            evidence=evidence,
            historical_comparisons=similar,
            limitations=risk_output["limitations"]
        )
        return {
            **risk_output,
            "explanationDetails": explanation["explanation"]
        }

    def predict_outcome(self, deal_id: str) -> Dict[str, Any]:
        deal = self._get_deal(deal_id)
        if not deal:
            return {"status": "MODEL_ERROR", "message": f"Deal {deal_id} not found."}

        raw = self.feature_service.extract_raw_features(deal, self.clients, self.objections, self.competitors, self.lessons)
        x_vec = self.feature_service.transform(raw)

        outcome_output = self.outcome_model.predict_single(x_vec)
        outcome_output["dealId"] = deal_id
        similar = self.similarity_engine.recall_similar(deal, top_k=2).get("similarDeals", [])
        evidence = self.evidence_service.get_grounding_evidence(deal_id)

        explanation = ExplainabilityService.format_explanation(
            prediction=outcome_output,
            drivers=outcome_output["topDrivers"],
            evidence=evidence,
            historical_comparisons=similar,
            limitations=outcome_output["limitations"]
        )
        return {
            **outcome_output,
            "explanationDetails": explanation["explanation"]
        }

    def predict_cycle(self, deal_id: str) -> Dict[str, Any]:
        deal = self._get_deal(deal_id)
        if not deal:
            return {"status": "MODEL_ERROR", "message": f"Deal {deal_id} not found."}

        raw = self.feature_service.extract_raw_features(deal, self.clients, self.objections, self.competitors, self.lessons)
        x_vec = self.feature_service.transform(raw)
        return self.cycle_model.predict_deal(deal_id, x_vec)

    def recall_similar(self, deal_id: str, top_k: int = 5) -> Dict[str, Any]:
        deal = self._get_deal(deal_id)
        if not deal:
            return {"status": "MODEL_ERROR", "message": f"Deal {deal_id} not found."}
        return self.similarity_engine.recall_similar(deal, top_k=top_k)

    def simulate(self, deal_id: str, scenario_params: Dict[str, Any]) -> Dict[str, Any]:
        deal = self._get_deal(deal_id)
        if not deal:
            return {"status": "MODEL_ERROR", "message": f"Deal {deal_id} not found."}
        return self.simulation_engine.simulate(
            deal, scenario_params, self.clients, self.objections, self.competitors, self.lessons
        )

    def forecast(self) -> Dict[str, Any]:
        active = [d for d in self.deals_dict.values() if d.get("outcome") == "Active"]
        preds = []
        for d in active:
            raw = self.feature_service.extract_raw_features(d, self.clients, self.objections, self.competitors, self.lessons)
            x_vec = self.feature_service.transform(raw)
            preds.append(self.outcome_model.predict_single(x_vec))
        return self.forecasting_model.forecast_pipeline(active, preds)

    def get_models_status(self) -> Dict[str, Any]:
        all_models = self.registry.get_all()
        return {
            "status": "MODEL_READY",
            "activeModelsCount": len(all_models),
            "models": all_models
        }

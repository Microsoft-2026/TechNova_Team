"""
Deal Intelligence Agent - Model Registry
Auditable catalog of versioned models, metrics, and deployment status.
"""

import json
import os
import datetime
from typing import Dict, Any, List, Optional

REGISTRY_FILE = os.path.join(os.getcwd(), "models", "registry.json")

class ModelRegistry:
    def __init__(self, registry_file: str = REGISTRY_FILE):
        self.registry_file = registry_file
        self.entries: Dict[str, Dict[str, Any]] = {}
        self.load()

    def load(self):
        if os.path.exists(self.registry_file):
            try:
                with open(self.registry_file, "r", encoding="utf-8") as f:
                    self.entries = json.load(f)
            except Exception as e:
                print(f"[ModelRegistry] Error loading registry: {e}")
                self.entries = {}

    def save(self):
        os.makedirs(os.path.dirname(self.registry_file), exist_ok=True)
        with open(self.registry_file, "w", encoding="utf-8") as f:
            json.dump(self.entries, f, indent=2)

    def register(
        self,
        model_name: str,
        version: str,
        algorithm: str,
        features: List[str],
        metrics: Dict[str, Any],
        dataset_version: str = "v1.0-historical-300-deals",
        status: str = "ACTIVE",
        notes: str = ""
    ):
        self.entries[model_name] = {
            "modelName": model_name,
            "version": version,
            "algorithm": algorithm,
            "trainedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "features": features,
            "metrics": metrics,
            "datasetVersion": dataset_version,
            "status": status,
            "notes": notes
        }
        self.save()

    def get_model(self, model_name: str) -> Optional[Dict[str, Any]]:
        return self.entries.get(model_name)

    def get_all(self) -> Dict[str, Dict[str, Any]]:
        return self.entries

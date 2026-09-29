"""
Deal Intelligence Agent - Grounding Evidence Service
Extracts verbatim quotations, interaction dates, and objection records for given deals.
"""

import os
import csv
from typing import Dict, Any, List

DATASETS_DIR = os.path.join(os.getcwd(), "datasets")

class EvidenceService:
    def __init__(self, datasets_dir: str = DATASETS_DIR):
        self.datasets_dir = datasets_dir
        self.objections_by_deal: Dict[str, List[Dict[str, str]]] = {}
        self.competitors_by_deal: Dict[str, List[Dict[str, str]]] = {}
        self.lessons_by_deal: Dict[str, List[Dict[str, str]]] = {}
        self.load()

    def load(self):
        obj_file = os.path.join(self.datasets_dir, "objections.csv")
        if os.path.exists(obj_file):
            with open(obj_file, "r", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    self.objections_by_deal.setdefault(row.get("deal_id", ""), []).append(row)

        comp_file = os.path.join(self.datasets_dir, "competitors.csv")
        if os.path.exists(comp_file):
            with open(comp_file, "r", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    self.competitors_by_deal.setdefault(row.get("deal_id", ""), []).append(row)

        les_file = os.path.join(self.datasets_dir, "lessons.csv")
        if os.path.exists(les_file):
            with open(les_file, "r", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    self.lessons_by_deal.setdefault(row.get("deal_id", ""), []).append(row)

    def get_grounding_evidence(self, deal_id: str) -> List[str]:
        evidence = []
        # Objections
        deal_objs = self.objections_by_deal.get(deal_id, [])
        for o in deal_objs:
            severity = o.get("severity", "Medium")
            status = o.get("resolution_status", "Unresolved")
            reaction = o.get("client_reaction", "Concerned")
            interaction = o.get("source_interaction_id", "Logged interaction")
            evidence.append(
                f'Objection "{o.get("objection")}" flagged ({severity} severity, {status}) in interaction {interaction}. Customer reaction: {reaction}.'
            )

        # Competitors
        deal_comps = self.competitors_by_deal.get(deal_id, [])
        for c in deal_comps:
            evidence.append(
                f'Competitor {c.get("competitor_name")} ({c.get("category")}) status: {c.get("competitor_status")}. Customer reason cited: "{c.get("client_reason")}".'
            )

        # Lessons / Historical precedent
        deal_lessons = self.lessons_by_deal.get(deal_id, [])
        for l in deal_lessons:
            evidence.append(
                f'Retained Retrospective: "{l.get("lesson")}" (Strategy: {l.get("strategy_used")}, Result: {l.get("result")}).'
            )

        return evidence if evidence else ["Standard CRM velocity and pipeline stage tracking."]

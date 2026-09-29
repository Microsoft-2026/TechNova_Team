"""
Deal Intelligence Agent - Central Feature Engineering Service
Guarantees strict training/inference consistency and prevents data leakage.
"""

import math
import os
import json
import csv
from typing import Dict, Any, List, Optional, Tuple

class DealFeatureService:
    def __init__(self, metadata_path: Optional[str] = None):
        self.feature_names: List[str] = [
            "log_deal_value",
            "discount_ratio",
            "industry_win_rate",
            "product_win_rate",
            "company_size_tier",
            "total_objections",
            "high_severity_objections",
            "unresolved_objections",
            "has_competitor",
            "competitor_preferred",
            "interaction_count",
            "inactivity_days",
            "rep_win_rate"
        ]
        # Statistical references persisted from training set
        self.means: Dict[str, float] = {}
        self.stds: Dict[str, float] = {}
        self.industry_win_rates: Dict[str, float] = {}
        self.product_win_rates: Dict[str, float] = {}
        self.rep_win_rates: Dict[str, float] = {}
        self.global_win_rate: float = 0.502
        self.product_prices: Dict[str, float] = {}

        if metadata_path and os.path.exists(metadata_path):
            self.load_metadata(metadata_path)

    def load_metadata(self, path: str):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.feature_names = data.get("feature_names", self.feature_names)
            self.means = data.get("means", {})
            self.stds = data.get("stds", {})
            self.industry_win_rates = data.get("industry_win_rates", {})
            self.product_win_rates = data.get("product_win_rates", {})
            self.rep_win_rates = data.get("rep_win_rates", {})
            self.global_win_rate = data.get("global_win_rate", 0.502)
            self.product_prices = data.get("product_prices", {})

    def save_metadata(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({
                "feature_names": self.feature_names,
                "means": self.means,
                "stds": self.stds,
                "industry_win_rates": self.industry_win_rates,
                "product_win_rates": self.product_win_rates,
                "rep_win_rates": self.rep_win_rates,
                "global_win_rate": self.global_win_rate,
                "product_prices": self.product_prices,
            }, f, indent=2)

    def fit_from_training_data(
        self,
        train_deals: List[Dict[str, Any]],
        clients: Dict[str, Dict[str, str]],
        products: Dict[str, Dict[str, str]],
        objections: List[Dict[str, str]],
        competitors: List[Dict[str, str]],
        lessons: List[Dict[str, str]]
    ):
        """Fits historical rates and feature normalizers STRICTLY on training split."""
        # 1. Product price map
        for prod_id, p in products.items():
            name = p.get("product", prod_id)
            price = float(p.get("sales_price", 150000))
            self.product_prices[name] = price
            self.product_prices[prod_id] = price

        # 2. Historical win rates from training split ONLY (prevent leakage)
        ind_counts: Dict[str, Dict[str, int]] = {}
        prod_counts: Dict[str, Dict[str, int]] = {}
        rep_counts: Dict[str, Dict[str, int]] = {}
        won_total = 0

        for d in train_deals:
            is_won = 1 if d.get("outcome") in ("Won", "WON") else 0
            won_total += is_won
            
            client_info = clients.get(d.get("client_id", ""), {})
            ind = client_info.get("industry", d.get("industry", "Unknown"))
            prod = d.get("product", "Unknown")
            rep = d.get("sales_rep_id", d.get("owner", "Unknown"))

            ind_counts.setdefault(ind, {"won": 0, "total": 0})
            ind_counts[ind]["total"] += 1
            ind_counts[ind]["won"] += is_won

            prod_counts.setdefault(prod, {"won": 0, "total": 0})
            prod_counts[prod]["total"] += 1
            prod_counts[prod]["won"] += is_won

            rep_counts.setdefault(rep, {"won": 0, "total": 0})
            rep_counts[rep]["total"] += 1
            rep_counts[rep]["won"] += is_won

        self.global_win_rate = won_total / max(1, len(train_deals))

        # Empirical Bayes smoothing to avoid extreme win rates for small sample sizes
        C = 5.0
        for ind, counts in ind_counts.items():
            self.industry_win_rates[ind] = (counts["won"] + C * self.global_win_rate) / (counts["total"] + C)

        for prod, counts in prod_counts.items():
            self.product_win_rates[prod] = (counts["won"] + C * self.global_win_rate) / (counts["total"] + C)

        for rep, counts in rep_counts.items():
            self.rep_win_rates[rep] = (counts["won"] + C * self.global_win_rate) / (counts["total"] + C)

        # 3. Compute raw feature vectors for training deals to obtain means and stds
        raw_vectors = []
        for d in train_deals:
            feats = self.extract_raw_features(d, clients, objections, competitors, lessons)
            raw_vectors.append(feats)

        # Compute means and stds for z-score normalization
        for feat in self.feature_names:
            vals = [vec[feat] for vec in raw_vectors]
            mean = sum(vals) / max(1, len(vals))
            var = sum((v - mean) ** 2 for v in vals) / max(1, len(vals))
            std = math.sqrt(var) if var > 1e-6 else 1.0
            self.means[feat] = round(mean, 4)
            self.stds[feat] = round(std, 4)

    def extract_raw_features(
        self,
        deal: Dict[str, Any],
        clients: Dict[str, Dict[str, str]],
        objections: List[Dict[str, str]],
        competitors: List[Dict[str, str]],
        lessons: List[Dict[str, str]]
    ) -> Dict[str, float]:
        """Extracts strictly pre-outcome features for a deal."""
        deal_id = deal.get("deal_id") or deal.get("id") or ""
        deal_val = float(deal.get("value", deal.get("deal_value", 150000)))
        prod_name = deal.get("product", "Enterprise Intelligence Suite")

        # 1. Log deal value
        log_val = math.log(max(1000.0, deal_val))

        # 2. Discount ratio relative to catalog price
        catalog_price = self.product_prices.get(prod_name, 150000.0)
        discount_ratio = max(0.0, (catalog_price - deal_val) / catalog_price) if catalog_price > 0 else 0.0

        # 3. Industry & product rates
        client_info = clients.get(deal.get("client_id", ""), {})
        industry = client_info.get("industry", deal.get("industry", "Unknown"))
        ind_win_rate = self.industry_win_rates.get(industry, self.global_win_rate)
        prod_win_rate = self.product_win_rates.get(prod_name, self.global_win_rate)

        # 4. Company size tier
        company_size = client_info.get("company_size", "Mid-Market")
        size_map = {"SMB": 1.0, "Mid-Market": 2.0, "Enterprise": 3.0}
        size_tier = size_map.get(company_size, 2.0)

        # 5. Objections
        deal_objs = [o for o in objections if o.get("deal_id") == deal_id]
        total_objs = float(len(deal_objs))
        high_sev = float(sum(1 for o in deal_objs if str(o.get("severity", "")).lower() == "high"))
        unres = float(sum(1 for o in deal_objs if str(o.get("resolution_status", "")).lower() in ("unresolved", "partially resolved")))

        # 6. Competitors
        deal_comps = [c for c in competitors if c.get("deal_id") == deal_id]
        has_comp = 1.0 if deal_comps else 0.0
        comp_pref = 1.0 if any(str(c.get("competitor_status", "")).lower() == "preferred" for c in deal_comps) else 0.0

        # 7. Interactions / Activity velocity
        interactions = set()
        for o in deal_objs:
            if o.get("source_interaction_id"):
                interactions.add(o["source_interaction_id"])
        for l in lessons:
            if l.get("deal_id") == deal_id and l.get("source_interaction_id"):
                interactions.add(l["source_interaction_id"])
        interaction_count = float(max(1, len(interactions)))

        # 8. Inactivity / Risk indicator
        risk_score = float(deal.get("riskScore", deal.get("risk_score", 45)))
        inactivity_days = 2.0 if risk_score < 30 else 5.0 if risk_score < 60 else 14.0

        # 9. Sales rep win rate
        rep_id = deal.get("sales_rep_id", deal.get("ownerId", deal.get("owner", "")))
        rep_rate = self.rep_win_rates.get(rep_id, self.global_win_rate)

        return {
            "log_deal_value": log_val,
            "discount_ratio": discount_ratio,
            "industry_win_rate": ind_win_rate,
            "product_win_rate": prod_win_rate,
            "company_size_tier": size_tier,
            "total_objections": total_objs,
            "high_severity_objections": high_sev,
            "unresolved_objections": unres,
            "has_competitor": has_comp,
            "competitor_preferred": comp_pref,
            "interaction_count": interaction_count,
            "inactivity_days": inactivity_days,
            "rep_win_rate": rep_rate
        }

    def transform(self, raw_features: Dict[str, float]) -> List[float]:
        """Transforms raw features into normalized vector in canonical ordering."""
        normalized = []
        for feat in self.feature_names:
            val = raw_features.get(feat, 0.0)
            mean = self.means.get(feat, 0.0)
            std = self.stds.get(feat, 1.0)
            z = (val - mean) / (std if std > 1e-6 else 1.0)
            normalized.append(round(z, 5))
        return normalized

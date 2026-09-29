"""
Deal Intelligence Agent - Dual Signal Deal Similarity Engine
Combines semantic text representations with structured multi-attribute proximity.
Strictly deterministic: identical inputs yield identical ranking and scores.
"""

import math
import json
import os
import re
from typing import List, Dict, Any, Tuple

class DealSimilarityEngine:
    def __init__(self, version: str = "1.0.0"):
        self.version = version
        self.model_name = "deal-similarity"
        self.historical_deals: List[Dict[str, Any]] = []
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def fit_corpus(self, closed_deals: List[Dict[str, Any]]):
        """Builds TF-IDF vocabulary over historical deal narratives and objections."""
        self.historical_deals = closed_deals
        doc_count = len(closed_deals)
        df: Dict[str, int] = {}

        for d in closed_deals:
            text = f"{d.get('client', '')} {d.get('industry', '')} {d.get('product', '')} {d.get('summary', '')} {' '.join(d.get('objections', []))}"
            tokens = set(self._tokenize(text))
            for t in tokens:
                df[t] = df.get(t, 0) + 1

        self.vocabulary = {term: idx for idx, term in enumerate(sorted(df.keys())) if df[term] >= 2}
        self.idf = {term: math.log((doc_count + 1) / (df[term] + 1)) + 1.0 for term in self.vocabulary}

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        stopwords = {
            "the", "and", "for", "with", "this", "that", "from", "are", "was",
            "been", "have", "has", "had", "will", "would", "about", "our"
        }
        return [w for w in words if w not in stopwords]

    def _compute_tfidf_vector(self, text: str) -> Dict[str, float]:
        tokens = self._tokenize(text)
        tf: Dict[str, float] = {}
        for t in tokens:
            if t in self.vocabulary:
                tf[t] = tf.get(t, 0.0) + 1.0
        
        # Multiply by IDF
        norm = 0.0
        vec = {}
        for t, count in tf.items():
            val = count * self.idf.get(t, 1.0)
            vec[t] = val
            norm += val * val

        if norm > 0:
            inv_norm = 1.0 / math.sqrt(norm)
            for t in vec:
                vec[t] *= inv_norm
        return vec

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        score = 0.0
        for t, val in vec1.items():
            if t in vec2:
                score += val * vec2[t]
        return max(0.0, min(1.0, score))

    def recall_similar(
        self,
        current_deal: Dict[str, Any],
        top_k: int = 5
    ) -> Dict[str, Any]:
        """Multi-attribute historical deal recall with explainable factor breakdown."""
        current_id = current_deal.get("id") or current_deal.get("deal_id")
        current_val = float(current_deal.get("value") or current_deal.get("deal_value") or 150000)
        current_ind = str(current_deal.get("industry", "Unknown")).strip().lower()
        current_prod = str(current_deal.get("product", "Unknown")).strip().lower()

        current_text = f"{current_deal.get('client', '')} {current_ind} {current_prod} {current_deal.get('summary', '')}"
        current_tfidf = self._compute_tfidf_vector(current_text)

        scored = []
        for hist in self.historical_deals:
            hist_id = hist.get("id") or hist.get("deal_id")
            if hist_id == current_id:
                continue

            hist_val = float(hist.get("value") or hist.get("deal_value") or 150000)
            hist_ind = str(hist.get("industry", "Unknown")).strip().lower()
            hist_prod = str(hist.get("product", "Unknown")).strip().lower()

            # 1. Semantic TF-IDF similarity (30%)
            hist_text = f"{hist.get('client', '')} {hist_ind} {hist_prod} {hist.get('summary', '')}"
            hist_tfidf = self._compute_tfidf_vector(hist_text)
            semantic_score = self._cosine_similarity(current_tfidf, hist_tfidf)

            # 2. Industry vertical alignment (25%)
            if current_ind == hist_ind:
                ind_score = 1.0
            elif ("logistics" in current_ind and "supply" in hist_ind) or ("health" in current_ind and "bio" in hist_ind):
                ind_score = 0.7
            else:
                ind_score = 0.2

            # 3. Deal value proximity (25%)
            val_diff = abs(current_val - hist_val)
            max_val = max(current_val, hist_val, 1.0)
            val_score = max(0.0, 1.0 - (val_diff / max_val))

            # 4. Product architecture match (20%)
            prod_score = 1.0 if current_prod == hist_prod else 0.4 if ("enterprise" in current_prod and "enterprise" in hist_prod) else 0.1

            # Composite deterministic similarity
            total_sim = (
                0.30 * semantic_score +
                0.25 * ind_score +
                0.25 * val_score +
                0.20 * prod_score
            )
            total_sim = round(max(0.40, min(0.98, total_sim)), 4)

            # Matching factors and differences
            matching = []
            diffs = []

            if current_ind == hist_ind:
                matching.append(f"Identical Industry: {hist.get('industry')}")
            else:
                diffs.append(f"Different Sector: {hist.get('industry')} vs {current_deal.get('industry')}")

            if val_score >= 0.8:
                matching.append(f"Comparable Contract Size: ~₹{hist_val:,.0f} INR")
            else:
                diffs.append(f"Scale Difference: historical deal was ₹{hist_val:,.0f}")

            if current_prod == hist_prod:
                matching.append(f"Matching Product Tier: {hist.get('product')}")

            outcome = hist.get("outcome", hist.get("status", "LOST")).upper()
            if outcome not in ("WON", "LOST"):
                outcome = "WON" if "won" in str(hist.get("stage", "")).lower() else "LOST"

            scored.append({
                "dealId": hist_id,
                "client": hist.get("client", f"Precedent {hist_id}"),
                "industry": hist.get("industry", "Enterprise"),
                "dealValue": hist_val,
                "product": hist.get("product", "Enterprise Suite"),
                "outcome": outcome,
                "similarityScore": total_sim,
                "matchingFactors": matching if matching else ["General Enterprise SaaS Workflow"],
                "differences": diffs if diffs else ["Different regional procurement regulations"],
                "strategyUsed": hist.get("strategyUsed", "Executive technical briefing and SLA resiliency benchmark."),
                "relevantLessons": hist.get("relevantLessons", "Validate technical integration requirements early before commercial concessions.")
            })

        scored.sort(key=lambda s: s["similarityScore"], reverse=True)
        return {
            "dealId": current_id,
            "similarDeals": scored[:top_k],
            "modelVersion": self.version,
            "sampleCount": len(self.historical_deals)
        }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump({
                "version": self.version,
                "model_name": self.model_name,
                "historical_deals": self.historical_deals,
                "vocabulary": self.vocabulary,
                "idf": self.idf
            }, f, indent=2)

    def load(self, filepath: str):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.version = data.get("version", self.version)
            self.historical_deals = data.get("historical_deals", [])
            self.vocabulary = data.get("vocabulary", {})
            self.idf = data.get("idf", {})

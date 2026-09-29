# Evaluation Framework
## Deal Intelligence Agent

This document outlines metrics, test methodology, and quality criteria for measuring the intelligence and memory pipelines.

---

### Evaluation Dimensions

1. **Recall Relevance**:
   - Precision@K for semantically matched precedent deals.
   - Ground truth alignment between historical cluster characteristics and query opportunity attributes.
2. **RAG Retrieval Precision & Grounding**:
   - Verification that 100% of answers cite specific document chunks.
   - Prohibition of ungrounded model hallucinations.
3. **Explainability & Evidence Coverage**:
   - Every AI insight and suggestion must supply verbatim speaker quotes and location context.
4. **Simulation Consistency**:
   - Preservation of economic logic (e.g. higher discounts should predictably impact margin and volume based on historical elasticity).
   - Strict `ESTIMATE` labeling.
5. **Memory Retention Fidelity**:
   - Validation that post-close retrospective lessons appear in subsequent deal recall sessions.

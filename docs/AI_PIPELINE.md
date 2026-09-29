# AI Intelligence Pipeline & Architecture
## Deal Intelligence Agent

This document details the closed-loop intelligence architecture:

```text
UNDERSTAND → RETRIEVE → RECALL → REFLECT → RECOMMEND → SIMULATE → ACT → RETAIN
```

---

### The 7 Core Nodes

#### 1. Understand (Transcript & Communication Intelligence)
- **Input**: Raw text/audio transcript, CRM deal metadata, prior activity logs.
- **Processing**:
  - Linguistic decomposition identifying explicit buyer intent vs unspoken objections.
  - Entity recognition for competitor names, stakeholder titles, and timeline commitments.
  - Verbatim quotation extraction with speaker and timestamp attribution for explainability.
- **Output**: Structured `TranscriptAnalysis` containing intent, pain points, requirements, objections, competitor tactics, and sentiment trajectory.

#### 2. Retrieve (Grounded RAG)
- **Input**: Query topic or detected deal hurdles.
- **Processing**:
  - Semantic vector search + hybrid lexical filtering over company sales playbooks, technical specifications, compliance rules, and pricing matrices.
  - Chunk relevance scoring and snippet isolation.
- **Output**: Grounded answer synthesis accompanied by citation chips (`doc_id`, `chunk_index`, snippet quote).

#### 3. Recall (Previous Deal Memory)
- **Input**: Target deal features (industry, value tier, product family, active objections).
- **Processing**:
  - Multi-dimensional similarity matching against closed historical deals in the tenant's memory bank:
    $$\text{Similarity} = w_1 \cdot \text{Vector}(\text{objections}) + w_2 \cdot \text{IndustryMatch} + w_3 \cdot \text{ValueProximity}$$
  - Strict preservation of mathematical similarity; no fake percentages.
- **Output**: Ranked list of precedent deals with known outcomes (`WON` / `LOST`), closing strategies used, and retained takeaways.

#### 4. Reflect (Historical Outcome Synthesis)
- **Input**: Cluster of matched historical deals from the Recall phase.
- **Processing**:
  - Contrastive analysis separating win catalysts from loss hurdles.
  - Identification of fatal patterns (e.g. discounting before technical validation leading to 80% loss in cluster).
- **Output**: Cluster win rate, positive drivers, fatal hurdles, and tactical advice for the AE.

#### 5. Recommend (Explainable Next-Best-Action)
- **Input**: Understand output + Retrieved Playbooks + Reflective Tactical Advice.
- **Processing**:
  - Determination of highest-impact, immediate action (e.g. Schedule Security Workshop, Address Objection, Involve Executive Sponsor).
  - Explicit synthesis of the **Why?** reasoning and direct linking to verbatim conversation evidence.
- **Output**: High-confidence suggestion cards with direct Apply / Dismiss workflows.

#### 6. Simulate (Strategic What-If Decision Lab)
- **Input**: Commercial levers adjusted by the salesperson (Discount %, Contract Tenure, Packaging).
- **Processing**:
  - Historical pattern regression comparing baseline deal terms to the proposed scenario.
  - Win probability projection with confidence bounds and estimated cycle length delta.
  - Mandatory labeling: `ESTIMATE · Based on historical patterns`.
- **Output**: Scenario delta comparison matrix and trade-off analysis.

#### 7. Retain (Institutional Memory Ingestion)
- **Input**: Closed deal retrospective payload (`WON`/`LOST`, deciding factor, competitor won, lessons learned).
- **Processing**:
  - Post-decision factor structuring.
  - Ingestion into the tenant's isolated Memory Bank.
- **Output**: Permanent institutional memory indexed for future recall queries across the sales team.

# Data Model & Relational Schema
## Deal Intelligence Agent

This document defines the normalized schema for the Deal Intelligence Agent database layer.

---

### Entity Relationship Architecture

```text
Company (Tenant Root)
 ├── Users (1:N)
 ├── Deals (1:N)
 │    ├── Activities (1:N)
 │    ├── Transcripts (1:N)
 │    │    └── TranscriptAnalysis (1:1)
 │    ├── Suggestions (1:N)
 │    ├── Simulations (1:N)
 │    ├── RiskSignals (1:N)
 │    ├── DealOutcome (1:1)
 │    └── MemoryEvents (1:N)
 └── KnowledgeDocs (1:N)
      └── KnowledgeChunks (1:N)
```

---

### Entity Definitions

#### 1. Company
- `id`: `string (uuid)` — Primary Key
- `name`: `string` — Company / Organization Name
- `domain`: `string` — Corporate domain identifier
- `memory_bank_id`: `string` — Isolated memory bank partition identifier
- `created_at`: `timestamp`
- `updated_at`: `timestamp`

#### 2. User
- `id`: `string (uuid)` — Primary Key
- `company_id`: `string (uuid)` — Foreign Key → Company(id)
- `full_name`: `string`
- `email`: `string` (Unique per tenant)
- `role`: `enum ('admin', 'manager', 'sales')`
- `password_hash`: `string` (bcrypt)
- `created_at`: `timestamp`
- `updated_at`: `timestamp`

#### 3. Deal
- `id`: `string` — Human-readable identifier (e.g. `DEAL-1042` or UUID)
- `company_id`: `string (uuid)` — Foreign Key → Company(id)
- `client`: `string` — Prospect organization name
- `industry`: `string` — Domain category (e.g. Healthcare, FinTech, Manufacturing)
- `value`: `float` — Estimated contract value
- `currency`: `string` — Defaults to 'USD'
- `product`: `string` — Target product package
- `stage`: `enum ('LEAD', 'QUALIFIED', 'DEMO', 'PROPOSAL', 'NEGOTIATION', 'APPROVAL', 'WON', 'LOST')`
- `owner_id`: `string` — Reference to User
- `owner`: `string` — Owner name
- `risk`: `enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`
- `risk_score`: `integer` (0-100)
- `status`: `enum ('ACTIVE', 'WON', 'LOST', 'ON_HOLD')`
- `summary`: `text` — Synthesized context
- `last_activity_at`: `timestamp`
- `created_at`: `timestamp`
- `updated_at`: `timestamp`

#### 4. Activity
- `id`: `string (uuid)`
- `deal_id`: `string` — Foreign Key → Deal(id)
- `type`: `enum ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'STATUS_CHANGE', 'ANALYSIS_GENERATED')`
- `title`: `string`
- `description`: `text`
- `author`: `string`
- `timestamp`: `timestamp`

#### 5. Transcript & TranscriptAnalysis
- `Transcript`:
  - `id`: `string (uuid)`
  - `deal_id`: `string` — Foreign Key → Deal(id)
  - `file_name`: `string`
  - `file_type`: `enum ('pdf', 'docx', 'txt')`
  - `status`: `enum ('PENDING', 'PARSING', 'UNDERSTANDING', 'RETRIEVING', 'ANALYZING', 'COMPLETED', 'FAILED')`
  - `raw_text`: `text`
  - `uploaded_at`: `timestamp`
- `TranscriptAnalysis`:
  - `id`: `string (uuid)`
  - `transcript_id`: `string (uuid)`
  - `deal_id`: `string`
  - `intent`: `json` (list of { title, why, evidence })
  - `pain_points`: `json`
  - `requirements`: `json`
  - `objections`: `json`
  - `competitor_mentions`: `json`
  - `action_items`: `json`
  - `sentiment`: `json` ({ overall, score, explanation })
  - `summary`: `text`
  - `last_analyzed_at`: `timestamp`

#### 6. Suggestion (Next-Best-Action)
- `id`: `string (uuid)`
- `deal_id`: `string` — Foreign Key → Deal(id)
- `action_type`: `enum ('SCHEDULE_DEMO', 'FOLLOW_UP', 'ADDRESS_OBJECTION', 'OFFER_DISCOUNT', 'TECHNICAL_WORKSHOP', 'EXECUTIVE_SPONSOR', 'SECURITY_REVIEW')`
- `title`: `string`
- `description`: `text`
- `why`: `text` (explainability)
- `evidence`: `text` (transcript quote or precedent reference)
- `similar_deals`: `json`
- `impact`: `enum ('HIGH', 'MEDIUM', 'LOW')`
- `priority`: `enum ('URGENT', 'RECOMMENDED', 'OPTIONAL')`
- `status`: `enum ('ACTIVE', 'APPLIED', 'DISMISSED')`
- `created_at`: `timestamp`

#### 7. Simulation & Scenario
- `id`: `string (uuid)`
- `deal_id`: `string` — Foreign Key → Deal(id)
- `current_scenario`: `json` ({ discountPercent, contractDurationMonths, productPackage, projectedValue, winProbability, expectedCycleDays, riskScore })
- `what_if_scenario`: `json`
- `delta`: `json` ({ valueDiff, probabilityDiff, cycleDaysDiff, riskDiff })
- `confidence_interval`: `json` ({ minProbability, maxProbability })
- `based_on_historical_count`: `integer`
- `disclaimer`: `string`
- `created_at`: `timestamp`

#### 8. DealOutcome & RetainedLesson (Institutional Memory)
- `DealOutcome`:
  - `id`: `string (uuid)`
  - `deal_id`: `string` (Unique)
  - `outcome`: `enum ('WON', 'LOST')`
  - `reason`: `text`
  - `competitor_won`: `string` (optional)
  - `lessons_learned`: `json` (array of strings)
  - `closed_at`: `timestamp`
- `RetainedLesson`:
  - `id`: `string (uuid)`
  - `company_id`: `string (uuid)`
  - `deal_id`: `string`
  - `title`: `string`
  - `category`: `enum ('PRICING', 'PRODUCT_FIT', 'OBJECTION_HANDLING', 'TIMING', 'COMPETITIVE')`
  - `takeaway`: `text`
  - `context`: `text`
  - `outcome`: `enum ('WON', 'LOST')`
  - `applied_count`: `integer`
  - `retained_at`: `timestamp`

#### 9. KnowledgeDoc & KnowledgeChunk
- `KnowledgeDoc`:
  - `id`: `string (uuid)`
  - `company_id`: `string (uuid)`
  - `title`: `string`
  - `category`: `enum ('PLAYBOOK', 'PRODUCT_DOC', 'PRICING_GUIDE', 'POLICY', 'COMPETITIVE_BATTLECARD')`
  - `size_bytes`: `integer`
  - `status`: `enum ('INDEXED', 'PROCESSING', 'FAILED')`
  - `chunk_count`: `integer`
  - `uploaded_at`: `timestamp`
- `KnowledgeChunk`:
  - `id`: `string (uuid)`
  - `doc_id`: `string (uuid)`
  - `chunk_index`: `integer`
  - `content`: `text`
  - `tokens`: `integer`
  - `embedding`: `vector`

# Deal Intelligence Agent
## Autonomous AI Intelligence Layer Over Enterprise Sales Pipeline

A production-grade Deal Intelligence Agent built with a full-stack architecture (Express + Node.js TypeScript + React 19 + Vite + TanStack Query + Tailwind CSS).

---

### Core Intelligence Loop

```text
UNDERSTAND → RETRIEVE → RECALL → REFLECT → RECOMMEND → SIMULATE → ACT → RETAIN
```

1. **Understand**: Decomposes raw conversation transcripts and emails to isolate true customer intent, unstated objections, and competitor mentions with verbatim evidence.
2. **Retrieve**: Grounded RAG across organizational playbooks, technical specifications, and SLA guidelines with source citations.
3. **Recall**: Semantic vector similarity matching against historical closed deals (`WON` / `LOST`) to discover how identical hurdles were navigated previously.
4. **Reflect**: Synthesizes historical outcomes across cluster precedents to expose winning tactics and fatal pitfalls.
5. **Recommend**: Deterministic next-best-action guidance accompanied by explicit **Why?** reasoning and conversation evidence.
6. **Simulate**: Strategic What-If Decision Lab evaluating discount %, contract tenure, and package levers against historical patterns (strictly marked `ESTIMATE`).
7. **Retain**: Post-close structured retrospective ingestion embedding institutional memory for all future evaluations.

---

### Quick Start & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Express backend + Vite frontend unified on port 3000)
npm run dev

# 3. Build for production
npm run build
```

---

### Architecture & Key Endpoints

- **Health Probe**: `GET /health`
- **Authentication**: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `GET /auth/me`
- **Dashboard**: `GET /dashboard/summary`
- **Deals**: `GET /deals`, `POST /deals`, `GET /deals/:id`, `PUT /deals/:id`, `DELETE /deals/:id`, `POST /deals/:id/close`
- **Transcripts**: `POST /deals/:id/transcripts`
- **Intelligence**: `GET /deals/:id/intelligence`, `POST /deals/:id/intelligence`
- **Memory**: `POST /deals/:id/recall`, `POST /deals/:id/reflect`, `GET /deals/memory/retained`
- **Risk**: `GET /deals/:id/risk`
- **Simulation**: `POST /deals/:id/simulate`
- **Suggestions**: `GET /suggestions`, `POST /suggestions/:id/apply`, `POST /suggestions/:id/dismiss`
- **Knowledge Base**: `GET /knowledge/docs`, `POST /knowledge/docs`, `POST /knowledge/ask`
- **Reports**: `GET /reports/:timeframe`

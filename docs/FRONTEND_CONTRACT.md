# Frontend Contract & API Mapping
## Deal Intelligence Agent

This document specifies the exact mapping between the existing frontend application and the backend API layer.

---

### 1. Route to API Mapping Table

| Frontend Route | Primary Component | Triggered API Calls | HTTP Method | Request Payload | Response Schema | Loading State | Empty State | Error State |
|---|---|---|---|---|---|---|---|---|
| `/` | `LandingPage` | None (Informational) | N/A | None | Static architectural overview | Immediate | N/A | N/A |
| `/login` | `LoginPage` | `/auth/login` | POST | `{ email, password, rememberMe }` | `{ token, refreshToken, user }` | Spinner on Submit button | N/A | Alert banner with specific error |
| `/register` | `RegisterPage` | `/auth/register` | POST | `{ fullName, email, company, role, password }` | `{ token, refreshToken, user }` | Spinner on Submit button | N/A | Alert banner with specific error |
| `/dashboard` | `DashboardPage` | `/dashboard/summary`<br>`/health` | GET<br>GET | Query params (optional) | `DashboardSummary` object | Card & table skeleton loaders | "Attention Queue Clear" / "No Insights" | Error state card with Retry button |
| `/deals` | `DealsPage` | `/deals`<br>`/deals/:id` | GET<br>DELETE | Query params: `{ search, stage, risk, page }` | `{ deals: Deal[], total: number }` | Table skeleton loader | "No Deals Found" with CTA to create | ErrorState with retry |
| `/deals/new` | `NewDealPage` | `/deals` | POST | Partial `Deal` object | Created `Deal` | Button spinner | N/A | Alert banner with error |
| `/deal-tracking` | `DealTrackingPage` | `/deals`<br>`/deals/:id` | GET<br>PUT | Stage update payload: `{ stage }` | Updated `Deal` | 4-card skeleton | Empty Kanban columns | ErrorState with retry |
| `/deals/:id` | `DealDetailPage` | `/deals/:id`<br>`/deals/:id/intelligence`<br>`/deals/:id/recall`<br>`/deals/:id/reflect`<br>`/deals/:id/risk`<br>`/deals/:id/suggestions`<br>`/deals/:id/close` | GET<br>GET/POST<br>POST<br>POST<br>GET<br>GET<br>POST | Close payload: `{ outcome, reason, lessonsLearned }` | Respective models | Card skeletons per tab | Context-specific empty state per tab | ErrorState with retry per tab |
| `/deal-intelligence` | `DealIntelligencePage` | `/deals`<br>`/deals/:id/intelligence` | GET<br>GET/POST | Query: `dealId` | `DealIntelligence` | Card skeletons | "Intelligence Not Yet Generated" | ErrorState with retry |
| `/upload-transcripts` | `TranscriptUploadPage` | `/deals`<br>`/deals/:id/transcripts`<br>`/jobs/:id/events` | GET<br>POST<br>GET (SSE) | Multipart File or `{ text, title }` | `Transcript` + `Job` status | Pipeline stage progress indicators | N/A | Error banner with troubleshooting |
| `/deal-memory` | `DealMemoryPage` | `/deals`<br>`/deals/:id/recall`<br>`/deals/:id/reflect`<br>`/deals/memory/retained` | GET<br>POST<br>POST<br>GET | Deal selector context | `DealRecallResult` / `DealReflectResult` | Card skeletons | "No Historical Precedents Matched" | ErrorState with retry |
| `/suggestions` | `SuggestionsPage` | `/suggestions`<br>`/suggestions/:id/apply`<br>`/suggestions/:id/dismiss` | GET<br>POST<br>POST | Optional `dealId` filter | `{ suggestions: Suggestion[] }` | Card skeletons | "No Active Suggestions" | ErrorState with retry |
| `/risk-analysis` | `RiskAnalysisPage` | `/deals`<br>`/deals/:id/risk` | GET<br>GET | Deal selector context | `DealRiskAnalysis` | Card skeletons | "No Risk Signals Detected" | ErrorState with retry |
| `/simulation` | `SimulationPage` | `/deals`<br>`/deals/:id/simulate` | GET<br>POST | `{ discountPercent, contractDurationMonths, productPackage }` | `SimulationResult` | Button loading | "Simulator Standing By" | ErrorState with retry |
| `/knowledge-base` | `KnowledgeBasePage` | `/knowledge/docs`<br>`/knowledge/ask` | GET/POST<br>POST | Multipart doc or `{ question }` | `{ docs }` or `KnowledgeAnswer` | Table skeleton / Answer loader | "Knowledge Base Empty" | ErrorState with retry |
| `/reports` | `ReportsPage` | `/reports/:timeframe` | GET | `timeframe` param | `ReportsData` | 4-card metric skeleton | Empty state charts with message | ErrorState with retry |
| `/settings` | `SettingsPage` | `/health`<br>`/users/me`<br>`/company` | GET<br>GET<br>GET | Dynamic endpoint override | `{ status, version }` / user / company | Small spinner | N/A | Health probe alert |

---

### 2. Authentication & Multi-Tenancy Contract

- **Bearer Token**: All protected endpoints require `Authorization: Bearer <JWT_TOKEN>`.
- **Tenant Derivation**: `company_id` is extracted strictly from the verified JWT payload. It is **never** accepted as an untrusted client parameter.
- **Roles**:
  - `admin`: Full access to company deals, users, knowledge base, and reports.
  - `manager`: Team-wide access to deals, recall, reflect, and team suggestions.
  - `sales`: Access to assigned opportunities, upload transcripts, run simulations, close deals.

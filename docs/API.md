# Backend API Documentation
## Deal Intelligence Agent REST & SSE Specification

All endpoints communicate using JSON over HTTPS/HTTP.
Protected endpoints require `Authorization: Bearer <TOKEN>`.

---

### Authentication

#### `POST /auth/register`
- **Request**:
  ```json
  {
    "fullName": "Sarah Chen",
    "email": "schen@enterprise.com",
    "company": "Apex Corp",
    "role": "Account Executive",
    "password": "Password123!"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "refreshToken": "ref_...",
    "user": {
      "id": "usr_101",
      "fullName": "Sarah Chen",
      "email": "schen@enterprise.com",
      "company": "Apex Corp",
      "role": "sales"
    }
  }
  ```

#### `POST /auth/login`
- **Request**:
  ```json
  {
    "email": "schen@enterprise.com",
    "password": "Password123!",
    "rememberMe": true
  }
  ```
- **Response**: Same as `/auth/register`.

#### `GET /auth/me`
- **Response**: Current user profile.

---

### Dashboard

#### `GET /dashboard/summary`
- **Response**:
  ```json
  {
    "activeDealsCount": 12,
    "upcomingMeetingsCount": 4,
    "wonDealsCount": 28,
    "lostDealsCount": 9,
    "negotiationsCount": 3,
    "highRiskDealsCount": 2,
    "attentionQueue": [ ...Deal ],
    "upcomingDeals": [ ...Deal ],
    "recentActivities": [ ...Activity ],
    "aiInsights": [ ...AIInsightItem ]
  }
  ```

---

### Deals

#### `GET /deals`
- **Query Params**: `search`, `stage`, `risk`, `status`, `page`, `limit`
- **Response**:
  ```json
  {
    "deals": [ ...Deal ],
    "total": 12,
    "page": 1,
    "totalPages": 1
  }
  ```

#### `POST /deals`
- **Request**: `{ client, industry, value, currency, product, stage, owner, risk, status, summary }`
- **Response**: Created `Deal` object.

#### `GET /deals/:id`
- **Response**: Single `Deal` object.

#### `PUT /deals/:id`
- **Request**: Partial `Deal` object.
- **Response**: Updated `Deal` object.

#### `DELETE /deals/:id`
- **Response**: `{ "success": true, "id": "DEAL-101" }`

#### `POST /deals/:id/close`
- **Request**:
  ```json
  {
    "outcome": "WON",
    "reason": "Technical superiority in benchmark",
    "lessonsLearned": ["Providing early POC architect cuts cycle by 3 weeks"]
  }
  ```
- **Response**: `{ "success": true, "deal": Deal, "retainedLesson": RetainedLesson }`

---

### Intelligence & Transcripts

#### `POST /deals/:id/transcripts`
- **Request**: Multipart `file` or `{ "text": "...", "title": "..." }`
- **Response**:
  ```json
  {
    "id": "tr_1",
    "dealId": "DEAL-101",
    "fileName": "Discovery.txt",
    "fileType": "txt",
    "status": "COMPLETED",
    "uploadedAt": "2026-09-28T12:00:00Z"
  }
  ```

#### `GET /deals/:id/intelligence`
- **Response**: `DealIntelligence` object with customer intent, pain points, requirements, objections, competitor mentions, action items, sentiment, and quotes.

#### `POST /deals/:id/recall`
- **Response**: `DealRecallResult` with pattern synthesis and ranked similar deals.

#### `POST /deals/:id/reflect`
- **Response**: `DealReflectResult` with cluster win rate, winning drivers, loss factors, and tactical advice.

#### `GET /deals/:id/risk`
- **Response**: `DealRiskAnalysis` with overall risk score, level, signals with evidence quotes, and prescribed mitigation steps.

#### `POST /deals/:id/simulate`
- **Request**: `{ "discountPercent": 15, "contractDurationMonths": 24, "productPackage": "Enterprise Suite" }`
- **Response**: `SimulationResult` with current vs what-if comparison, delta, and disclaimer.

---

### Knowledge Base & RAG

#### `GET /knowledge/docs`
- **Response**: `{ "docs": [ ...KnowledgeDoc ] }`

#### `POST /knowledge/docs`
- **Request**: Multipart file + category.
- **Response**: Created `KnowledgeDoc`.

#### `POST /knowledge/ask`
- **Request**: `{ "question": "What is our SLA penalty policy?" }`
- **Response**:
  ```json
  {
    "question": "What is our SLA penalty policy?",
    "answer": "According to the Enterprise Agreement Guide...",
    "citations": [
      {
        "docId": "doc_1",
        "docTitle": "Enterprise SLA Playbook",
        "category": "PLAYBOOK",
        "snippet": "Clause 4.2 states service credits cap at 10%...",
        "relevanceScore": 94
      }
    ],
    "confidence": 0.95
  }
  ```

---

### System

#### `GET /health`
- **Response**: `{ "status": "healthy", "service": "Deal Intelligence Agent Backend", "timestamp": "..." }`

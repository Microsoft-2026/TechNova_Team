<div align="center">

# 🚀 Deal Intelligence Agent
### Context-Aware B2B Deal Management Layer with RAG & Reflect–Recall–Retain Memory

[![Microsoft Hackathon 2026](https://img.shields.io/badge/Microsoft%20Hackathon-2026-0078D4?style=for-the-badge&logo=microsoft&logoColor=white)](https://github.com/Microsoft-2026/TechNova)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Node.js v20](https://img.shields.io/badge/Node.js-v20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-FF6F00?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain.ai)

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-the-rag--reflectrecallretain-loop">Agent Loop</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-hackathon-problem-statement--solution-alignment">Problem & Solution</a>
</p>

<!-- BANNER / DEMO ANIMATION PLACEHOLDER -->
<img src="https://raw.githubusercontent.com/Microsoft-2026/TechNova/main/assets/banner-animation.gif" alt="Deal Intelligence Agent Banner" width="100%" />

</div>

---

## 📌 Executive Summary

Traditional CRMs simply track deal stages and static activities without understanding **why** deals succeed or fail. The **Deal Intelligence Agent** acts as an AI decision-support layer above enterprise sales data. 

By combining **Retrieval-Augmented Generation (RAG)** over authoritative corporate playbooks with a novel **Reflect–Recall–Retain** memory architecture (powered by Hindsight Memory), the agent extracts deep customer intent from transcripts, surfacing explainable risk signals, scenario simulations, and historical deal insights to sales teams.

---

## 💡 Hackathon Problem Statement & Solution Alignment

| Problem Gap | Traditional CRM / Standard RAG | Deal Intelligence Agent Solution |
| :--- | :--- | :--- |
| **Context Fragmentation** | Sales context is split across transcripts, docs, and CRM records. | **Transcript Intelligence** automatically extracts intent, pain points, objections, and sentiment in <30s. |
| **Static Knowledge Base** | Playbooks and pricing sheets don't adapt to deal experience. | **Hybrid RAG + Recall**: Retrieves product policies alongside top-3 similar historical deal cases. |
| **Repeated Mistakes** | Win/loss reasons are forgotten as rep churn occurs. | **Reflect & Retain**: Reflects on why historical deals succeeded/failed and retains validated lessons on deal closure. |
| **Opaque Strategy** | Recommendations lack clear reasoning or evidence. | **Explainable AI**: Every next-best-action explicitly cites supporting signals, playbooks, or past deals. |
| **Risk Sensitivity** | What-if changes (discounts, terms) are made blindly. | **Constraint-Aware Simulator**: Compares discount, contract duration, and packaging scenarios against historical patterns. |

---

## 🔄 The RAG + Reflect–Recall–Retain Loop

The core execution flow of the LangGraph agent orchestrates 7 sequential steps:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐│  UNDERSTAND │ ──> │ RETRIEVE(RAG)│ ──> │   RECALL    │ ──> │   REFLECT   │└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘│┌─────────────┐     ┌──────────────┐     ┌─────────────┐            ││   RETAIN    │ <── │   SIMULATE   │ <── │  RECOMMEND  │ <──────────┘└─────────────┘     └──────────────┘     └─────────────┘
1. **Understand**: Parses transcripts/documents into intents, objections, competitors, and sentiment.
2. **Retrieve (RAG)**: Fetches authoritative playbooks, pricing rules, and compliance docs via `pgvector`.
3. **Recall**: Queries Hindsight Memory for past deals matched by industry, deal size, objections, and tech stack.
4. **Reflect**: Synthesizes strategy patterns across recalled cases to explain win/loss factors.
5. **Recommend**: Generates an actionable next step accompanied by a transparent *"Why?"* evidence list.
6. **Simulate**: Evaluates what-if levers (discount %, contract length, package type) under business constraints.
7. **Retain**: Captures approved lessons, objection handling, and outcomes upon deal closure for organizational memory.

---

## 🛠️ System Architecture

                           ┌───────────────────────────────────────────┐
                           │     Presentation Layer (React 18 + TS)    │
                           │      Vite · Tailwind CSS · Recharts       │
                           └─────────────────────┬─────────────────────┘
                                                 │ HTTPS / SSE
                                                 ▼
                           ┌───────────────────────────────────────────┐
                           │       Node.js / Express API Gateway       │
                           │        JWT Auth · Zod · Prisma ORM        │
                           └─────────────────────┬─────────────────────┘
                                                 │ REST / Async
                                                 ▼
                           ┌───────────────────────────────────────────┐
                           │      FastAPI + LangGraph AI Service       │
                           │  Pydantic · Groq (Qwen/GPT-OSS) · RAG     │
                           └──────────────┬──────────────┬─────────────┘
                                          │              │
                   ┌──────────────────────┘              └──────────────────────┐
                   ▼                                                            ▼
┌──────────────────────────────────────┐                    ┌──────────────────────────────┐│       PostgreSQL + pgvector          │                    │     Hindsight Memory API     ││   Structured Deals & Embeddings      │                    │   retain() · recall() · reflect()│└──────────────────────────────────────┘                    └──────────────────────────────┘
---

## ✨ Key Features

- 📊 **Command Center Dashboard**: Real-time KPI summaries, active deal pipelines, upcoming meetings, and high-risk deal alerts.
- 📝 **Transcript Ingestion & Analysis**: Upload PDF, DOCX, or TXT call transcripts to instantly pull out structured requirements, competitor mentions, and sentiment indicators.
- 🧠 **Deal Memory (Recall & Reflection)**: Instantly surface historical deals sharing similar buyer friction points and understand winning negotiation tactics.
- 🎯 **Explainable AI Suggestions**: Dynamic recommendations detailing target actions, confidence levels, assumptions, and risks.
- 🧪 **What-If Deal Simulator**: Test discount thresholds and packaging models with instant margin-impact feedback labeled with historical outcome estimates.
- 🛡️ **Rule & Signal Risk Engine**: Identifies inactivity gaps, unresolved pricing objections, and missing decision-makers.

---
## 🎬 Demo Video

> 📌 **[Click here to watch the full project demo on Google Drive](https://drive.google.com/file/d/1sK9ckMGjqHBOQifP_g1dymn42rU4yZSu/view?usp=sharing)**



## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Recharts, Lucide Icons
- **API Gateway**: Node.js 20, Express, Prisma ORM, Zod Validation, JWT Auth, Multer
- **AI / Agent Orchestration**: Python 3.11, FastAPI, LangGraph, Pydantic, Server-Sent Events (SSE)
- **Database & Vectors**: PostgreSQL, `pgvector`, SQLAlchemy
- **Memory & LLM Layer**: Hindsight Memory API (`retain`, `recall`, `reflect`), Groq LMI Engine (Qwen / GPT-OSS)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Python**: `v3.11` or higher
- **Docker Desktop**: Installed and running (for PostgreSQL + `pgvector`)
- **API Keys**: Groq API Key, Hindsight Memory API Key

# TechNova

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

## Getting Started

### 1. Clone the Repository
```bash
git clone [https://github.com/Microsoft-2026/TechNovTeam.git](https://github.com/Microsoft-2026/TechNova_Team.git)
cd TechNova_Team

2. Install Dependencies
Bash
npm install
npm install -D esbuild@^0.28.2

3. Start the Development Server
Bash
npm run dev

Troubleshooting Common Issues:
Port in Use (EADDRINUSE):
If port 3000 or 24678 is already in use, stop the existing process before running npm run dev:
PowerShell (Windows):
PowerShell:-
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
Bash / macOS / Linux:
Bash:-
npx kill-port 3000

Environment Variables:
If your project uses environment configuration, copy .env.example to .env:
Bash
cp .env.example .env

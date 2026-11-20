<p align="center">
  <img src="https://img.shields.io/badge/QueryCraft-v1.0.0-6C63FF?style=for-the-badge&labelColor=0D0F1A" alt="QueryCraft v1.0.0" />
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge&labelColor=0D0F1A" alt="License MIT" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=0D0F1A" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0D0F1A" alt="React 18" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=0D0F1A" alt="PostgreSQL 15+" />
</p>

<h1 align="center">🧠 QueryCraft</h1>

<p align="center">
  <strong>Natural Language to SQL | AI-Powered Database Query Assistant</strong><br/>
  Ask your database questions in plain English. AI writes the SQL, your backend runs it safely (read-only), and you see the results instantly.
</p>

<p align="center">
  <a href="#-project-overview">Overview</a> •
  <a href="#-high-level-architecture">Architecture</a> •
  <a href="#-complete-data-flow">Data Flow</a> •
  <a href="#-security-architecture">Security</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

---

## 🎯 Project Overview

Business analysts and non-technical team members frequently need data but cannot write SQL. Direct database access is risky, and waiting for developers creates bottlenecks. 

**QueryCraft** bridges this gap by providing:
1. **Natural language interface** — type questions in English.
2. **AI-powered SQL generation** — Gemini, Grok, or Claude writes correct SQL.
3. **Ironclad safety** — two independent layers ensure the database is never modified.
4. **Intelligent error handling** — AI auto-repairs broken queries up to 3 times.
5. **Data visualization** — auto-generated charts for visual insights.

---

## 🏗 High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         USER (BROWSER)                            │
│  React 18 + Vite + TailwindCSS + Recharts                        │
│  Pages: Home, Login, Signup, Dashboard, QueryLab, History, Settings│
└──────────────┬───────────────────────────┬────────────────────────┘
               │  REST API (JSON)          │  HTTPOnly Cookie (JWT)
               ▼                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                    │
│                                                                   │
│  ┌─────────┐  ┌────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Routes  │→ │ Middleware  │→ │ Controllers   │→ │  Services   │ │
│  │         │  │ • Auth     │  │ • auth        │  │ • aiService │ │
│  │ /auth   │  │ • RateLim  │  │ • query       │  │ • chatAgent │ │
│  │ /query  │  │ • ValidSQL │  │ • database    │  │ • sqlExec   │ │
│  │ /chat   │  │            │  │ • chat        │  │ • schemaFetch│ │
│  │ /alerts │  │            │  │ • history     │  │ • alerts    │ │
│  │ /dbs    │  │            │  │ • alerts      │  │ • embedding │ │
│  └─────────┘  └────────────┘  └──────────────┘  └─────────────┘ │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Config       │  │   Utils      │  │  AI Providers           │ │
│  │ • appDb.js    │  │ • encrypt.js │  │ • geminiProvider.js    │ │
│  │ • aiProvider  │  │ • jwt.js     │  │ • grokProvider.js      │ │
│  └──────────────┘  └──────────────┘  │ • anthropicProvider.js │ │
│                                       └────────────────────────┘ │
└──────────┬───────────────────────────────────┬───────────────────┘
           │                                   │
           ▼                                   ▼
┌─────────────────────┐           ┌────────────────────────────┐
│   APP DATABASE       │           │    TARGET DATABASE          │
│   (Neon Postgres)    │           │    (User's Postgres/Neon)   │
│                      │           │                             │
│  • users             │           │  • User's actual data       │
│  • db_connections    │           │                             │
│  • queries (history) │           │  Connected via READ-ONLY    │
│  • conversations     │           │  role (readonly_ai_user)    │
│  • alerts            │           │                             │
└─────────────────────┘           └────────────────────────────┘
           │                                   │
           └───── FULL ACCESS ──────           └──── SELECT ONLY ──
```

---

## 🔄 Complete Data Flow

### Flow 1: Natural Language Query (Core Feature)

```
Step 1: USER types "show top 5 customers by total spend"
         │
Step 2: FRONTEND calls useQuery.execute(question, connectionId)
         │
Step 3: BACKEND receives request → authMiddleware verifies JWT
         │
Step 4: queryController.handleQuery()
         ├── 4a: looksLikeWriteIntent(question) → Blocks "update/delete"
         ├── 4b: Decrypt target DB password & create read-only pool
         ├── 4c: Fetch schema (structure only, NO data)
         ├── 4d: AI checkClarity() → Ensure question is clear
         ├── 4e: AI generateSQL() → Generates SQL + chartConfig JSON
         ├── 4f: resolveEmbeddings() → Resolve [EMBED:text] for pgvector
         ├── 4g: validateSQL.isReadOnlyQuery(sql) ← LAYER 1 SECURITY
         ├── 4h: Execute SQL on TARGET DB (read-only role) ← LAYER 2 SECURITY
         │       ↳ If fails: AI auto-fixes and retries up to 3 times
         ├── 4i: AI summarizeResults() → Generates plain-English summary
         └── 4j: Save to query history & return to frontend
         │
Step 5: FRONTEND renders results
         ├── ResultTable (Data), AutoChart (Visualization)
         └── ResultSummary (Plain-English answer), SQLViewer (Editable SQL)
```

### Flow 2: Analyst Chat (Multi-Step Agent)
Designed for complex analytical questions (e.g., "Why did our revenue drop last month?"):
1. **Plans:** AI decomposes questions into sub-queries.
2. **Executes:** Each sub-query runs through the safety pipeline.
3. **Synthesizes:** AI combines all results into a comprehensive narrative.

### Flow 3: Proactive Alerts
Runs in the background every 5 minutes:
1. Introspects schema for tables with date + numeric columns.
2. Compares last 7 days vs previous 7 days metrics.
3. If change **> 15% anomaly**, triggers Analyst Agent for root-cause analysis.
4. Alerts user proactively on the dashboard.

---

## 🛡️ Security Architecture (Two-Layer Protection)

We ensure the AI **cannot** modify the database through multiple layers:

### Layer 1: Application-Level SQL Validation (`validateSQL.js`)
- Must start with `SELECT` or `WITH`.
- Rejects forbidden keywords: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `EXEC`, etc.
- Prevents multiple statements (semicolon injection).

### Layer 2: Database-Level Read-Only Role
- The target database connection uses a specific role (`readonly_ai_user`).
- Role is granted **only** `SELECT` permissions. Even if the application logic fails, the database itself will physically reject write operations.

### Layer 3: Pre-AI Write Intent Detection
- Detects phrases like "update bob's email" or "delete all" in the English query and blocks the request before it even reaches the AI API.

### Additional Security
- **AES-256-CBC Encryption:** Target database passwords are encrypted before storage.
- **JWT (httpOnly):** Stateless authentication stored in secure cookies preventing XSS.
- **Rate Limiting:** Prevents abuse by limiting queries (e.g., 10/day for free tier).

---

## ✨ Key Features Deep Dive

- **Clarification Flow:** If a question is ambiguous, AI asks for clarification with suggestions rather than guessing incorrect SQL.
- **Auto-Retry Mechanism:** If generated SQL fails execution, the error is fed back to the AI for an automatic fix (recursive up to 3 times).
- **EXPLAIN ANALYZE Optimization:** AI analyzes raw execution plans to recommend performance optimizations and precise `CREATE INDEX` queries.
- **Semantic Search (pgvector):** Using `[EMBED:text]` placeholders, the backend fetches vector embeddings via Gemini to perform cosine similarity searches on data.
- **Voice Input:** Built-in Web Speech API integration allows hands-free voice querying.
- **Multi-Provider AI:** Instantly swap between Google Gemini, xAI Grok, or Anthropic Claude via the `AI_PROVIDER` environment variable.

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** (Blazing fast HMR and builds)
- **TailwindCSS 3** (Utility-first styling)
- **React Router v6**
- **Recharts** (Data visualization)
- **Axios** (HTTP client with credentials)

### Backend
- **Node.js** + **Express 4** (REST APIs)
- **PostgreSQL (pg)** (Target & App database connections)
- **@google/genai** (Google Gemini SDK)
- **bcryptjs** & **jsonwebtoken** (Auth)
- **crypto** (AES-256 for credentials)

### Database & Infra
- **Neon PostgreSQL:** Serverless DB supporting JSONB and pgvector.
- **Vercel** (Frontend) & **Render** (Backend) for deployment.

---

## 🚀 Getting Started

### 1. Database Setup
Create two PostgreSQL databases (e.g., on Neon):
- **App DB:** Run `backend/app_db_schema.sql` (Stores users, history, credentials).
- **Target DB:** Run `backend/target_db_schema.sql` (Creates `readonly_ai_user` role and sample data).

### 2. Backend Configuration
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env`:
```env
APP_DB_URI=postgresql://...
AI_PROVIDER=gemini
GEMINI_API_KEY=your_api_key
JWT_SECRET=super_secret_string
ENCRYPTION_SECRET=exactly_32_chars_long_secret_here!
PORT=5000
FRONTEND_URL=http://localhost:5173
```
Start backend: `npm run dev`

### 3. Frontend Configuration
```bash
cd frontend
npm install
cp .env.example .env
```
Fill in `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```
Start frontend: `npm run dev`

### 4. Usage
1. Sign up / Log in.
2. Go to Settings and add your **Target Database** (using the `readonly_ai_user` credentials).
3. Open **Query Lab** and ask your first question!

---

> **QueryCraft** — Built for people who'd rather ask than write SQL.

# QueryCraft — Complete Project Documentation
### Natural Language to SQL | AI-Powered Database Query Assistant

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement & Why This Project](#2-problem-statement--why-this-project)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Technology Stack & Why Each Was Chosen](#4-technology-stack--why-each-was-chosen)
5. [Database Design (Dual-Database Architecture)](#5-database-design-dual-database-architecture)
6. [Backend — Full Flow & Module Breakdown](#6-backend--full-flow--module-breakdown)
7. [Frontend — Full Flow & Module Breakdown](#7-frontend--full-flow--module-breakdown)
8. [Complete Data Flow (End to End)](#8-complete-data-flow-end-to-end)
9. [Security Architecture (Two-Layer Protection)](#9-security-architecture-two-layer-protection)
10. [Authentication System](#10-authentication-system)
11. [AI Integration & Multi-Provider Support](#11-ai-integration--multi-provider-support)
12. [Key Features Deep Dive](#12-key-features-deep-dive)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Interview Questions & Answers](#14-interview-questions--answers)
15. [Folder Structure Reference](#15-folder-structure-reference)

---

## 1. Project Overview

**QueryCraft** is a full-stack AI-powered web application that lets non-technical users ask questions about their database in plain English. The AI (powered by Google Gemini, xAI Grok, or Anthropic Claude) converts the natural language question into a SQL query, runs it **safely in read-only mode** on the user's database, and returns the results as tables, charts, and plain-English summaries.

### Core Value Proposition
> "Ask your database questions in plain English. AI writes the SQL, your backend runs it safely (read-only), and you see the results instantly."

### Key Differentiators
- **No SQL knowledge needed** — Anyone can query their database
- **Two-layer security** — Application-level SQL validation + database-level read-only role
- **Auto-retry on errors** — If AI-generated SQL fails, it auto-fixes up to 3 times
- **Multi-AI provider support** — Swap between Gemini, Grok, and Claude via a single env variable
- **Proactive AI Alerts** — The system periodically scans your data for anomalies and notifies you
- **Analyst Chat Agent** — Multi-step AI agent that decomposes complex questions into sub-queries
- **Semantic Search** — pgvector integration for fuzzy/similarity-based queries

---

## 2. Problem Statement & Why This Project

### The Problem
- Business analysts, managers, and non-technical team members frequently need data from databases but cannot write SQL
- Hiring a data team or waiting for developer-written reports creates bottlenecks
- Direct database access for non-experts is risky (accidental data modification)

### The Solution
QueryCraft bridges this gap by providing:
1. A **natural language interface** — users type questions in English
2. **AI-powered SQL generation** — Gemini/Grok/Claude writes correct SQL
3. **Ironclad safety** — two independent layers ensure the database is never modified
4. **Intelligent error handling** — AI auto-repairs broken queries
5. **Data visualization** — auto-generated charts for visual insights

---

## 3. High-Level Architecture

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
│  • db_connections    │           │    (customers, orders, etc.) │
│  • queries (history) │           │                             │
│  • conversations     │           │  Connected via READ-ONLY    │
│  • chat_messages     │           │  role (readonly_ai_user)    │
│  • alerts            │           │                             │
└─────────────────────┘           └────────────────────────────┘
           │                                   │
           └───── FULL ACCESS ──────           └──── SELECT ONLY ──
```

---

## 4. Technology Stack & Why Each Was Chosen

### Frontend

| Technology | Version | Why Chosen |
|-----------|---------|------------|
| **React** | 18.3 | Component-based architecture for complex, interactive UI. Rich ecosystem of hooks and context API for state management. Industry standard for SPAs. |
| **Vite** | 5.4 | Blazing-fast HMR (Hot Module Replacement) during development. Near-instant server start vs. Create React App. Native ES module support. |
| **React Router DOM** | 6.26 | Client-side routing without full page reloads. Supports nested routes, protected routes, and navigation state. |
| **TailwindCSS** | 3.4 | Utility-first CSS framework for rapid UI development. No context-switching between JS and CSS files. Highly customizable design tokens. |
| **Axios** | 1.7 | Promise-based HTTP client. Automatic JSON serialization, interceptors for error handling, easy credential (cookie) management with `withCredentials: true`. |
| **Recharts** | 2.12 | React-native charting library built on D3.js. Declarative API that fits React's component model perfectly. Supports bar, line, and pie charts needed for data visualization. |

### Backend

| Technology | Version | Why Chosen |
|-----------|---------|------------|
| **Node.js** | (LTS) | Non-blocking I/O is perfect for handling concurrent API requests to AI services. Same language (JavaScript) as frontend reduces context-switching. |
| **Express** | 4.19 | Minimal, unopinionated web framework. Perfect for REST APIs. Middleware architecture allows clean separation of concerns (auth, rate-limiting, SQL validation). |
| **pg (node-postgres)** | 8.12 | Native PostgreSQL driver for Node.js. Connection pooling support. Parameterized queries to prevent SQL injection. |
| **@google/genai** | 0.3 | Official Google Gemini SDK. Provides direct access to Gemini 2.5 Flash model for SQL generation, summarization, and clarification. |
| **bcryptjs** | 2.4 | Pure JavaScript bcrypt implementation. Hashes passwords with salt rounds (10) for secure storage. No native binary dependencies. |
| **jsonwebtoken (JWT)** | 9.0 | Stateless authentication. Token stored in httpOnly cookie prevents XSS attacks. 7-day expiry reduces login friction. |
| **cookie-parser** | 1.4 | Parses Cookie header. Required for reading the httpOnly JWT token from incoming requests. |
| **cors** | 2.8 | Handles Cross-Origin Resource Sharing. Essential because frontend (port 5173) and backend (port 5000) run on different origins. Configured with `credentials: true`. |
| **dotenv** | 16.4 | Loads environment variables from `.env` file. Keeps secrets (API keys, DB URIs, encryption keys) out of source code. |
| **nodemon** | 3.1 | Dev-only. Auto-restarts server on file changes. Speeds up development cycle. |

### Database

| Technology | Why Chosen |
|-----------|------------|
| **PostgreSQL (Neon)** | Advanced relational database. Supports JSONB, pgvector, window functions, and CTEs that the AI generates. Neon provides serverless Postgres with branching and auto-scaling. |
| **pgvector extension** | Enables vector similarity search (cosine distance). Required for semantic search feature — storing and querying Gemini-generated embeddings. |

### AI Providers

| Provider | Model | Why Available |
|----------|-------|--------------|
| **Google Gemini** | gemini-2.5-flash | Primary provider. Free tier available. Fast response times. Excellent at SQL generation. Used for both text generation and embeddings. |
| **xAI Grok** | grok-4-latest | Alternative provider. OpenAI-compatible API format. Good at code generation tasks. |
| **Anthropic Claude** | claude-sonnet-4.5 | Alternative provider. Excellent at structured output (JSON). Strong reasoning capabilities. |

---

## 5. Database Design (Dual-Database Architecture)

### Why Two Separate Databases?

This is a critical architectural decision:

1. **App Database** — Stores application data (users, sessions, history). Backend has **full read/write access** because this is our own data.
2. **Target Database** — The user's actual business data. Backend connects with a **read-only role** (`readonly_ai_user`). The AI can never modify user data.

This separation ensures that even if the app has a vulnerability, the user's business data remains safe.

### App Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- bcrypt hash, never plain text
  created_at TIMESTAMP DEFAULT NOW()
);

-- Each user can save multiple target database connections
CREATE TABLE db_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  connection_name TEXT NOT NULL,
  db_type TEXT NOT NULL DEFAULT 'postgres',
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 5432,
  db_name TEXT NOT NULL,
  username TEXT NOT NULL,                -- should be a READ-ONLY role
  encrypted_password TEXT NOT NULL,      -- AES-256 encrypted
  ssl_required BOOLEAN DEFAULT TRUE,
  alert_check_interval_minutes INTEGER DEFAULT 1440,
  last_alert_check_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Query history
CREATE TABLE queries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  db_connection_id INTEGER REFERENCES db_connections(id) ON DELETE CASCADE,
  natural_language TEXT NOT NULL,
  generated_sql TEXT,
  row_count INTEGER,
  status TEXT,                           -- 'success' or 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat conversations (for Analyst Chat)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  connection_id INTEGER REFERENCES db_connections(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual chat messages
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  steps JSONB,                           -- stores sub-queries and their results
  created_at TIMESTAMP DEFAULT NOW()
);

-- Proactive alerts
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  db_connection_id INTEGER REFERENCES db_connections(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  explanation TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  steps JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Target Database (Read-Only Role Setup)

```sql
-- This creates a read-only role that can ONLY SELECT data
CREATE ROLE readonly_ai_user WITH LOGIN PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT CONNECT ON DATABASE neondb TO readonly_ai_user;
GRANT USAGE ON SCHEMA public TO readonly_ai_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_ai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_ai_user;
```

---

## 6. Backend — Full Flow & Module Breakdown

### 6.1 Entry Point: `server.js`

The Express server initializes with:
- **CORS** — Allows frontend origin with credentials
- **JSON body parser** — Parses incoming request bodies
- **Cookie parser** — Reads JWT from httpOnly cookies
- **Route mounting** — 6 route groups under `/api/*`
- **Background alert timer** — Runs `checkAndRunAlerts()` every 5 minutes

### 6.2 Routes Layer

| Route | Methods | Auth Required | Rate Limited | Purpose |
|-------|---------|---------------|--------------|---------|
| `/api/auth` | POST, GET, PUT | Partial | No | Signup, Login, Logout, Profile, Google OAuth |
| `/api/databases` | POST, GET, DELETE, PATCH | Yes | No | CRUD for target database connections |
| `/api/query` | POST | Yes | Yes (10/day) | NL→SQL→Execute→Results |
| `/api/query/raw` | POST | Yes | Yes | Run user-edited SQL directly |
| `/api/query/explain` | POST | Yes | Yes | EXPLAIN ANALYZE + AI optimization advice |
| `/api/history` | GET, DELETE | Yes | No | View/delete query history |
| `/api/chat` | POST, GET | Yes | Yes | Analyst Chat (multi-step agent) |
| `/api/alerts` | POST, GET, PATCH | Yes | No | Proactive AI-generated alerts |

### 6.3 Middleware Layer

#### `authMiddleware.js`
- Reads JWT from `req.cookies.token`
- Verifies token using `jsonwebtoken.verify()`
- Attaches `req.user = { id, email }` for downstream handlers
- Returns 401 if missing or invalid

#### `rateLimiter.js`
- In-memory rate limiter using a `Map<userId, {count, resetAt}>`
- Limits each user to **10 queries per day** (free plan)
- Resets every 24 hours
- Returns 429 with a clear message when exceeded

#### `validateSQL.js`
- **`isReadOnlyQuery(sql)`** — Layer 1 of security:
  - Must start with `SELECT` or `WITH`
  - Must NOT contain forbidden keywords: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `CREATE`, `GRANT`, `REVOKE`, `EXEC`, `MERGE`, `CALL`
  - Must be a single statement (no semicolons splitting multiple statements)
- **`looksLikeWriteIntent(question)`** — Catches write-intent in the English question itself:
  - Detects phrases like "update", "delete", "remove", "insert", "modify", "change the", etc.
  - Blocks the request BEFORE any AI call, returning a user-friendly error message

### 6.4 Controllers Layer

#### `authController.js` — Authentication
- **`signup`** — Hash password with bcrypt(10), insert user, issue JWT cookie
- **`login`** — Find user by email, compare bcrypt hashes, issue JWT cookie
- **`logout`** — Clear the token cookie
- **`me`** — Return current user data (for session restore on page refresh)
- **`updateProfile`** — Update name/email, re-issue JWT if email changed
- **`updatePassword`** — Verify old password, hash new password, update

#### `googleAuthController.js` — Google OAuth2
- **`startGoogleAuth`** — Redirects browser to Google's consent screen
- **`handleGoogleCallback`** — Exchanges authorization code for access token, fetches Google profile, finds-or-creates user in app DB, issues JWT cookie, redirects to dashboard

#### `queryController.js` — Core Query Pipeline
The most important controller. Handles:
- **`handleQuery`** — The full NL → SQL → Execute flow (see Section 8)
- **`handleRawQuery`** — User edits the SQL and re-runs it (skips AI generation, still validates)
- **`handleExplain`** — Runs `EXPLAIN ANALYZE` on the SQL, then AI analyzes the execution plan and suggests indexes

#### `databaseController.js` — Connection Management
- **`addConnection`** — Encrypt password with AES-256, store connection details
- **`listConnections`** — Return all connections for the user (never returns passwords)
- **`testConnection`** — Temporarily connect to verify credentials work
- **`deleteConnection`** — Remove a connection (CASCADE deletes related queries/alerts)
- **`getTables`** — List all tables in the target database (schema browser)
- **`getTableDetail`** — Get columns + preview rows for a specific table
- **`updateConnectionInterval`** — Configure how often alerts are checked

#### `chatController.js` — Analyst Chat Agent
- **`handleChat`** — Orchestrates the multi-step AI agent (see Section 12.2)
- **`listConversations`** — Lists user's past chat conversations
- **`getMessages`** — Retrieves messages for a specific conversation

#### `alertController.js` — Proactive Alerts
- **`triggerCheck`** — Fire-and-forget background alert check
- **`listAlerts`** — Fetch user's alerts with unread count
- **`markRead`** — Mark an alert as read

#### `historyController.js` — Query History
- **`getHistory`** — Fetch last 100 queries with connection names
- **`deleteHistoryItem`** — Delete a specific history entry

### 6.5 Services Layer

#### `aiService.js` — AI Abstraction Layer
This is the **only** file that talks to the AI. It NEVER receives database credentials or connects to any database. It:
- **`checkClarity(question, schema)`** — Asks AI if the question is clear enough to write SQL
- **`generateSQL(question, schema)`** — Asks AI to generate SQL + optional chart configuration
- **`fixSQL({question, brokenSQL, error, schema})`** — Asks AI to fix a broken query
- **`summarizeResults(question, rows)`** — Asks AI to summarize query results in plain English
- **`analyzeExecutionPlan(sql, explainOutput, schema)`** — Asks AI to analyze EXPLAIN output and suggest optimizations

#### `promptBuilder.js` — Prompt Engineering
Constructs carefully engineered prompts for each AI task:
- **Clarification prompt** — Asks AI to return JSON: `{clear: true}` or `{clear: false, reason, suggestions}`
- **SQL generation prompt** — Includes schema, rules (SELECT only), chart config format, and semantic search placeholder syntax `[EMBED:text]`
- **Fix prompt** — Provides the broken SQL, error message, and original question
- **Explain prompt** — Provides SQL, EXPLAIN ANALYZE output, and schema for optimization advice

#### `chatAgent.js` — Analyst Agent (Plan → Execute → Synthesize)
Implements a 3-step AI agent:
1. **Plan** — AI breaks the question into 1-4 sub-queries with SQL
2. **Execute** — Each sub-query is validated and run against the target DB (capped at 50 rows each)
3. **Synthesize** — AI combines all sub-results into a 2-4 sentence plain-English answer

#### `sqlExecutor.js` — Auto-Retry Logic
- Attempts to run the SQL query
- On failure, calls `fixSQL()` to get a corrected query from the AI
- Recursively retries up to **3 times** (`MAX_RETRIES = 3`)
- Returns `{success, data, finalSQL, attempts}` or `{success: false, error}`

#### `schemaFetcher.js` — Schema Introspection
- Reads ONLY structure (table names, column names, data types) from `information_schema.columns`
- **Never reads actual row data**
- Formats as human-readable text that gets embedded in AI prompts

#### `schemaBrowser.js` — Schema Browser Helpers
- **`listTables`** — Lists all public tables
- **`getTableColumns`** — Gets columns for a specific table
- **`previewTable`** — Returns up to 50 rows (with table name whitelisting to prevent injection)

#### `targetDbConnector.js` — Target Database Pool
- Creates short-lived `pg.Pool` connections to the user's target database
- Decrypts the stored password using AES-256
- Configures SSL, max 2 connections, 5-second idle timeout
- The pool is created per-request and destroyed after use

#### `embeddingService.js` — Semantic Search
- **`resolveEmbeddings(sql)`** — Scans SQL for `[EMBED:search text]` placeholders
- Calls Gemini's embedding API (`gemini-embedding-001`) to convert text to 3072-dimensional vectors
- Replaces placeholders with actual vector strings for pgvector cosine similarity search
- Falls back to zero vectors on failure

#### `alertDetectionService.js` — Proactive Alert Engine
- Iterates all database connections (or filtered by user)
- For each connection, checks if alert check is due based on the configured interval
- Introspects the schema to find tables with both date and numeric columns
- Compares last 7 days vs previous 7 days for significant metric changes (>15% threshold)
- **Significant anomaly** → Triggers the Analyst Agent for root cause analysis
- **Stable metrics** → Generates routine check alert with zero AI calls
- **Recently alerted** → Uses cached results to avoid spam, also zero AI calls

### 6.6 Utils Layer

#### `encrypt.js` — AES-256-CBC Encryption
- **`encrypt(text)`** — Generates random 16-byte IV, encrypts with AES-256-CBC, returns `iv:ciphertext`
- **`decrypt(encryptedText)`** — Splits IV and ciphertext, decrypts
- `ENCRYPTION_SECRET` must be exactly 32 characters
- Used exclusively for encrypting target database passwords before storing in app DB

#### `jwt.js` — JWT Token Utilities
- **`generateToken(payload)`** — Signs `{id, email}` with `JWT_SECRET`, 7-day expiry
- **`verifyToken(token)`** — Verifies and decodes the token

---

## 7. Frontend — Full Flow & Module Breakdown

### 7.1 Entry Point

**`main.jsx`** → Renders `<App />` inside `React.StrictMode`

**`App.jsx`** → Sets up the entire application:
```
<AuthProvider>          ← Global auth state
  <DatabaseProvider>    ← Global database connection state
    <ToastProvider>     ← Toast notification system
      <BrowserRouter>
        <IdleLogoutWatcher />   ← Auto-logout after 30 min inactivity
        <AlertWatcher />        ← Triggers alert checks every 5 min
        <Routes>
          / → Home (landing page)
          /login → Login
          /signup → Signup
          /dashboard → Dashboard (protected)
          /query → QueryLab (protected)
          /history → History (protected)
          /settings → Settings (protected)
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </DatabaseProvider>
</AuthProvider>
```

### 7.2 Pages

| Page | Description |
|------|-------------|
| **Home** | Landing page with hero section, feature showcase, and CTA |
| **Login** | Email/password login + Google OAuth button |
| **Signup** | Registration form with validation |
| **Dashboard** | Overview with alerts panel and quick access to features |
| **QueryLab** | Main workspace — query input, SQL viewer, results table, charts, schema browser, analyst chat |
| **History** | View past queries with status, re-run capability |
| **Settings** | Manage database connections, profile, password, alert intervals |

### 7.3 Components (19 Reusable Components)

| Component | Purpose |
|-----------|---------|
| **Sidebar** | Navigation sidebar with links to Dashboard, QueryLab, History, Settings |
| **QueryInput** | Text input (+ VoiceInput) for natural language questions |
| **VoiceInput** | Browser Speech Recognition API for voice-to-text input |
| **SQLViewer** | Displays generated SQL with syntax highlighting, copy, edit, and optimize buttons |
| **ResultTable** | Renders query results as a styled HTML table |
| **ResultSummary** | Shows the AI-generated plain-English summary |
| **ChartToggle** | Toggle between table view and chart view with auto-generated visualizations |
| **AutoChart** | Renders AI-suggested charts (bar, line, pie) using Recharts |
| **ClarificationPanel** | Shows AI-generated clarification options when a question is ambiguous |
| **SchemaBrowser** | Tree-view of database tables, columns, and data previews |
| **AnalystChat** | Chat interface for the multi-step Analyst Agent |
| **AlertsPanel** | Displays proactive AI alerts with read/unread status |
| **AuthLayout** | Shared layout wrapper for Login/Signup pages |
| **ProtectedRoute** | HOC that redirects to /login if not authenticated |
| **GoogleButton** | "Sign in with Google" OAuth button |
| **LoadingSpinner** | Reusable loading animation |
| **EmptyState** | Reusable empty state component with icon, title, description, and action |
| **Toast** | Toast notification system (success/error/info) with context provider |
| **TranslationConsole** | Shows the step-by-step AI translation process |

### 7.4 Hooks (Custom React Hooks)

| Hook | Purpose |
|------|---------|
| **`useAuth()`** | Returns `{user, setUser, loading}` from AuthContext |
| **`useDatabase()`** | Returns `{connections, activeConnectionId, setActiveConnectionId, refreshConnections}` |
| **`useQuery()`** | Encapsulates query execution logic — `execute()`, `executeRaw()`, `executeExplain()`, manages loading/error/result/clarification state |
| **`useIdleLogout()`** | Auto-logs out user after 30 minutes of inactivity (no mouse, keyboard, scroll, or touch) |

### 7.5 API Layer (Axios-based)

| File | Functions | Backend Routes |
|------|-----------|----------------|
| **`axiosInstance.js`** | Configured axios with `baseURL` and `withCredentials: true` | — |
| **`authApi.js`** | `login`, `signup`, `logout`, `getMe`, `updateProfile` | `/api/auth/*` |
| **`queryApi.js`** | `runQuery`, `runRawQuery`, `runExplainQuery`, `getHistory`, `deleteHistoryItem` | `/api/query/*`, `/api/history/*` |
| **`dbApi.js`** | `addConnection`, `listConnections`, `testConnection`, `deleteConnection`, `updateConnectionInterval`, `getTables`, `getTableDetail` | `/api/databases/*` |
| **`chatApi.js`** | `sendMessage`, `getConversations`, `getMessages` | `/api/chat/*` |
| **`alertApi.js`** | `triggerCheck`, `getAlerts`, `markAlertRead` | `/api/alerts/*` |

### 7.6 Context Providers

#### `AuthContext`
- On app mount, calls `GET /api/auth/me` to check if user is already logged in (cookie-based session restore)
- Stores `{user, setUser, loading}` globally
- All components can access auth state without prop drilling

#### `DatabaseContext`
- Fetches user's saved database connections on login
- Manages `activeConnectionId` (which database is currently selected)
- Auto-selects first connection if active connection is deleted
- Re-fetches when logged-in user changes (prevents stale data leaks between accounts)

---

## 8. Complete Data Flow (End to End)

### Flow 1: Natural Language Query (The Core Feature)

```
Step 1: USER types "show top 5 customers by total spend"
         │
Step 2: FRONTEND (QueryInput) → calls useQuery.execute(question, connectionId)
         │
Step 3: AXIOS POST /api/query → { question, dbConnectionId }
         │                        (with httpOnly JWT cookie)
         │
Step 4: BACKEND receives request
         ├── authMiddleware: verifies JWT → attaches req.user
         ├── rateLimiter: checks daily quota (10/day free)
         │
Step 5: queryController.handleQuery()
         │
         ├── Step 5a: looksLikeWriteIntent(question)
         │            → If "update/delete/insert" detected → 400 error immediately
         │
         ├── Step 5b: Look up db_connections for this user
         │            → Decrypt stored password (AES-256)
         │            → Create short-lived read-only pool to TARGET DB
         │
         ├── Step 5c: schemaFetcher.getSchema(targetPool)
         │            → Query information_schema.columns
         │            → Format: "Table: customers\nColumns: id (integer), name (text)..."
         │            → This gives the AI the database structure WITHOUT any data
         │
         ├── Step 5d: aiService.checkClarity(question, schema)
         │            → Prompt: "Is this question clear enough?"
         │            → If NOT clear → return { needsClarification: true, suggestions: [...] }
         │            → If CLEAR → continue
         │
         ├── Step 5e: aiService.generateSQL(question, schema)
         │            → Prompt includes schema + rules (SELECT only, JSON response format)
         │            → AI returns: { sql: "SELECT ...", chartConfig: { type: "bar", ... } }
         │
         ├── Step 5f: embeddingService.resolveEmbeddings(sql)
         │            → Scans for [EMBED:text] placeholders
         │            → Replaces with actual vector embeddings from Gemini
         │
         ├── Step 5g: validateSQL.isReadOnlyQuery(sql)  ← LAYER 1 SECURITY
         │            → Must start with SELECT/WITH
         │            → Must NOT contain INSERT/UPDATE/DELETE/DROP/ALTER/etc.
         │            → Must be single statement
         │            → If FAILS → 400 error
         │
         ├── Step 5h: sqlExecutor.executeWithRetry(sql, targetPool, ...)
         │            → Run query on TARGET DB (via read-only role) ← LAYER 2 SECURITY
         │            → If SQL fails:
         │               → Call aiService.fixSQL() to get corrected SQL
         │               → Retry up to 3 times (recursive)
         │            → Returns { success, data, finalSQL, attempts }
         │
         ├── Step 5i: aiService.summarizeResults(question, rows)
         │            → AI generates 1-3 sentence plain-English summary
         │
         ├── Step 5j: Save to queries table (history)
         │            → { userId, connectionId, question, sql, rowCount, status }
         │
         └── Step 5k: Return response to frontend
                      → { sql, data, summary, chartConfig, attempts }
                      │
Step 6: FRONTEND receives response
         ├── ResultSummary shows the plain-English answer
         ├── AutoChart renders if chartConfig suggests a chart type
         ├── SQLViewer shows the generated SQL (editable)
         ├── ChartToggle allows switching between table and chart views
         └── User can copy, edit, or re-run the SQL
```

### Flow 2: Analyst Chat (Multi-Step Agent)

```
User: "Why did our revenue drop last month?"
  │
  ├── AI PLANS: Break into sub-queries
  │   ├── Sub-Q1: "Monthly revenue for last 6 months"
  │   ├── Sub-Q2: "Revenue by product category last 2 months"
  │   └── Sub-Q3: "New vs returning customer revenue"
  │
  ├── EXECUTE: Run each sub-query safely (read-only + validated)
  │   ├── Results from Sub-Q1: [monthly revenue data]
  │   ├── Results from Sub-Q2: [category breakdown]
  │   └── Results from Sub-Q3: [customer segment data]
  │
  └── SYNTHESIZE: AI combines all results
      → "Revenue dropped 23% in July, primarily driven by a 40% decline in
         the Electronics category. New customer acquisition remained stable,
         suggesting the issue is with repeat purchase rates."
```

### Flow 3: Proactive Alerts

```
Every 5 minutes (server.js interval):
  │
  ├── Check all db_connections for due alert checks
  │
  ├── For each due connection:
  │   ├── Connect to target DB (read-only)
  │   ├── Introspect schema → find tables with date + numeric columns
  │   ├── Compare last 7 days vs previous 7 days
  │   │
  │   ├── If change > 15% (anomaly):
  │   │   ├── Check if already alerted in last 24h → use cached result
  │   │   └── If new → Trigger Analyst Agent for investigation
  │   │       → Save alert with AI explanation
  │   │
  │   └── If change ≤ 15% (stable):
  │       └── Save routine check alert (ZERO AI calls)
  │
  └── Frontend AlertWatcher polls every 5 min → shows notification badge
```

---

## 9. Security Architecture (Two-Layer Protection)

### Layer 1: Application-Level SQL Validation (`validateSQL.js`)

```javascript
// The middleware checks:
// 1. Query must start with SELECT or WITH
// 2. Must NOT contain: INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE,
//    CREATE, GRANT, REVOKE, EXEC, MERGE, CALL
// 3. Must be a single statement (no multiple ; separated queries)
```

**Why this layer exists:** Even if the AI accidentally generates a destructive query, it gets caught before it reaches the database.

### Layer 2: Database-Level Read-Only Role

```sql
-- The target DB connection uses a role that physically CANNOT write:
CREATE ROLE readonly_ai_user WITH LOGIN PASSWORD '...';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_ai_user;
-- NO INSERT, UPDATE, DELETE, DROP permissions granted
```

**Why this layer exists:** Even if Layer 1 has a bug, the database itself will reject any write operation. This is defense-in-depth.

### Layer 3: Pre-AI Write Intent Detection

```javascript
// Before even calling the AI, the English question itself is checked:
// "update bob's email" → blocked immediately
// "delete all orders" → blocked immediately
```

### Additional Security Measures

| Measure | Implementation |
|---------|---------------|
| **Password encryption** | Target DB passwords stored with AES-256-CBC encryption |
| **Password hashing** | User account passwords hashed with bcrypt (10 salt rounds) |
| **JWT in httpOnly cookie** | Prevents XSS-based token theft |
| **CORS with credentials** | Only the configured frontend origin can make requests |
| **Parameterized queries** | All app DB queries use `$1, $2` parameterization (no SQL injection) |
| **Table name whitelisting** | Schema browser validates table names against actual list before interpolating |
| **Rate limiting** | 10 queries/day per user to prevent abuse |
| **Idle auto-logout** | 30 minutes of inactivity triggers automatic logout |
| **Short-lived DB pools** | Target DB connections created per-request, destroyed immediately after |

---

## 10. Authentication System

### Email/Password Auth
```
Signup: name + email + password
  → bcrypt.hash(password, 10) → store hash in DB
  → Generate JWT {id, email} with 7-day expiry
  → Set as httpOnly cookie (secure in production, sameSite: lax)

Login: email + password
  → Find user by email
  → bcrypt.compare(password, stored_hash)
  → Issue JWT cookie

Session Restore: On page refresh
  → Frontend calls GET /api/auth/me
  → authMiddleware reads cookie → verifies JWT
  → Returns user data → AuthContext updates
```

### Google OAuth2
```
1. User clicks "Sign in with Google"
2. Backend redirects to Google's consent screen
3. User authorizes → Google redirects to /api/auth/google/callback?code=...
4. Backend exchanges code for access token
5. Backend fetches Google profile (email, name)
6. Find-or-create user in app DB
   → Google users get a random unusable password_hash (satisfies NOT NULL constraint)
7. Issue JWT cookie (same as normal login)
8. Redirect to /dashboard
```

---

## 11. AI Integration & Multi-Provider Support

### Provider Abstraction Pattern

```javascript
// config/aiProvider.js — Factory pattern
// Reads AI_PROVIDER env var → returns a unified client object

const PROVIDER = process.env.AI_PROVIDER; // "gemini" | "grok" | "anthropic"

// Each provider implements the SAME interface:
{
  async generateContent(prompt) → string
}
```

**Why this pattern?**
- Adding a new AI provider requires only one new file
- Switching providers requires changing ONE environment variable
- The entire application code (aiService.js, chatAgent.js, etc.) doesn't care which provider is active
- No `if/else` chains scattered throughout the codebase

### Provider Implementations

| Provider | SDK/API | Model |
|----------|---------|-------|
| Gemini | `@google/genai` SDK | `gemini-2.5-flash` |
| Grok | Raw `fetch` to OpenAI-compatible API | `grok-4-latest` |
| Anthropic | Raw `fetch` to Messages API | `claude-sonnet-4.5` |

### Prompt Engineering Strategy

The AI receives:
1. **Schema only** — Table names and column types, NEVER actual data
2. **Strict rules** — "Only SELECT statements, return JSON format"
3. **Context** — The user's question and (for chat) conversation history
4. **Output format** — Explicit JSON structure with examples

---

## 12. Key Features Deep Dive

### 12.1 Clarification Flow
When a question is ambiguous (e.g., "show me the big orders"):
1. AI returns `{clear: false, reason: "What defines 'big'?", suggestions: [{label: "Orders > $1000"}, {label: "Top 10 by amount"}, ...]}`
2. Frontend shows clickable suggestion chips
3. User clicks one → re-submits with the clarified question
4. This prevents wrong SQL generation from vague inputs

### 12.2 Analyst Chat Agent
Unlike the single-query flow in QueryLab, the Analyst Chat:
- **Plans** — AI decomposes complex questions into 1-4 sub-queries
- **Executes** — Each sub-query runs through the full safety pipeline
- **Synthesizes** — AI writes a holistic answer combining all results
- **Persists** — Full conversation history is saved and reloadable
- **Has Context** — Previous messages are included in prompts for follow-up questions

### 12.3 EXPLAIN ANALYZE Optimization
Users can click "Optimize" on any generated SQL:
1. Backend runs `EXPLAIN ANALYZE ${sql}` on the target database
2. Raw execution plan is sent to AI
3. AI analyzes for sequential scans, missing indexes, etc.
4. Returns actionable advice including exact `CREATE INDEX` statements
5. Frontend shows both the AI analysis and the raw EXPLAIN output

### 12.4 Semantic Search (pgvector)
For databases with vector columns:
1. User asks: "Find products similar to 'cozy winter jacket'"
2. AI generates SQL with placeholder: `ORDER BY embedding <=> '[EMBED:cozy winter jacket]' LIMIT 5`
3. Backend's `embeddingService` detects `[EMBED:...]` patterns
4. Calls Gemini Embedding API to convert text to 3072-dimensional vector
5. Replaces placeholder with actual vector array
6. pgvector performs cosine similarity search

### 12.5 Voice Input
- Uses the browser's built-in Web Speech API (`SpeechRecognition`)
- No external service needed — runs entirely client-side
- Transcribed text is placed directly into the query input
- Works in Chrome, Edge, and Safari

### 12.6 Auto-Chart Suggestions
- When generating SQL, the AI also suggests a chart type (bar, line, pie, or none)
- It specifies which columns should be the X and Y axes
- Frontend renders the chart automatically using Recharts
- Users can toggle between table view and chart view

### 12.7 Proactive Alerts
- Background job runs every 5 minutes
- For each connection, compares recent 7-day metrics vs prior 7-day period
- **>15% change** → AI investigates root cause (uses Analyst Agent)
- **≤15% change** → Routine "all clear" alert (zero AI calls — saves API cost)
- **Already alerted today** → Uses cached result (zero AI calls — prevents spam)
- Alerts appear in the Dashboard with unread badges

---

## 13. Deployment Strategy

### Frontend → Vercel
- Connect GitHub repository
- Set environment variable: `VITE_API_BASE_URL` = Render backend URL
- Vite builds to `dist/` folder
- Automatic deploys on git push

### Backend → Render
- Connect GitHub repository
- Set all environment variables:
  - `APP_DB_URI` — Neon app database connection string
  - `GEMINI_API_KEY` — Google AI API key
  - `JWT_SECRET` — Random string for JWT signing
  - `ENCRYPTION_SECRET` — Exactly 32 characters for AES-256
  - `FRONTEND_URL` — Vercel frontend URL (for CORS)
  - `AI_PROVIDER` — "gemini", "grok", or "anthropic"
- Start command: `node server.js`

### Database → Neon
- Serverless PostgreSQL — scales to zero when idle
- Free tier available
- Built-in pgvector extension support
- Separate projects for app DB and target DB

---

## 14. Interview Questions & Answers

### Q1: "Tell me about your project."
> QueryCraft is an AI-powered database assistant. Users ask questions in plain English, and the AI (Gemini, Grok, or Claude) generates SQL, runs it safely on a read-only connection, and returns results as tables, charts, and summaries. It features a dual-database architecture, two-layer security, auto-retry on errors, an analyst chat agent for complex questions, proactive alerts, and semantic search via pgvector.

### Q2: "Why did you use two separate databases?"
> Security. The App Database stores our internal data (users, history) and the backend has full access. The Target Database is the user's real business data — we connect using a read-only role that physically cannot write data. This separation ensures that even if our application has a vulnerability, the user's data is never at risk of modification.

### Q3: "How do you ensure the AI can't modify the database?"
> Three-layer defense: (1) **Pre-AI check** — we scan the English question for write-intent phrases like "update" or "delete" before any AI call. (2) **Application-level validation** — `validateSQL.js` rejects any query that isn't a pure SELECT/WITH statement or contains forbidden keywords. (3) **Database-level enforcement** — the `readonly_ai_user` role only has SELECT permissions. Even if both software layers fail, the database itself blocks writes.

### Q4: "What happens when the AI generates wrong SQL?"
> The `sqlExecutor.js` implements an auto-retry mechanism. If the generated SQL fails, it sends the broken SQL, the error message, and the original question back to the AI, asking it to fix the query. This retries up to 3 times recursively. The final result includes an `attempts` counter so the frontend can show how many retries were needed.

### Q5: "How does the authentication work?"
> We use JWT tokens stored in httpOnly cookies. On signup/login, passwords are hashed with bcrypt (10 salt rounds) and a JWT containing `{id, email}` is issued with 7-day expiry. The cookie is httpOnly (prevents XSS theft), secure in production, and sameSite: lax. We also support Google OAuth2 — the backend exchanges Google's authorization code for profile data, creates the user if needed, and issues the same JWT cookie.

### Q6: "How does the multi-provider AI system work?"
> We use a Factory pattern. The `config/aiProvider.js` reads the `AI_PROVIDER` environment variable and instantiates the correct provider. Each provider (Gemini, Grok, Anthropic) implements the same interface: `{generateContent(prompt) → string}`. The rest of the application only interacts with this interface, so switching providers is a one-line env change with zero code modifications.

### Q7: "How do you store database passwords securely?"
> Target database passwords are encrypted using AES-256-CBC before storage. We generate a random 16-byte IV for each encryption, and the encrypted format is `iv:ciphertext`. The encryption key (`ENCRYPTION_SECRET`) must be exactly 32 characters. When connecting to a target database, we decrypt the password in memory, use it to create a short-lived connection pool, and the plaintext never persists.

### Q8: "What is the Analyst Chat and how is it different from the main query?"
> The main QueryLab takes one question and generates one SQL query. The Analyst Chat is a multi-step AI agent: (1) It plans by breaking the question into 1-4 sub-queries, (2) It executes each sub-query through the full safety pipeline, (3) It synthesizes all results into a comprehensive answer. It also maintains conversation history, so users can ask follow-up questions. This is designed for complex analytical questions like "Why did revenue drop last month?"

### Q9: "How does the proactive alert system work?"
> A background interval runs every 5 minutes on the server. For each database connection, it checks if an alert scan is due (configurable per-connection, default 24 hours). It introspects the schema to find tables with both date and numeric columns, then compares the last 7 days vs the previous 7 days. If a metric changes by more than 15%, it triggers the Analyst Agent for root-cause analysis. For stable metrics, it creates a routine alert with zero AI calls. It also has deduplication — if the same anomaly was alerted within 24 hours, it uses the cached investigation.

### Q10: "Explain the semantic search feature."
> When the user asks a fuzzy question like "find products similar to cozy winter jacket" and the table has a vector column, the AI generates SQL with a placeholder: `[EMBED:cozy winter jacket]`. Our `embeddingService` detects this pattern, calls Gemini's embedding API to convert the text into a 3072-dimensional vector, and replaces the placeholder with the actual vector array. pgvector then performs cosine similarity search to find the most semantically similar records.

### Q11: "Why React + Vite instead of Next.js?"
> QueryCraft is a pure SPA (Single Page Application) with no SEO requirements — all pages are behind authentication. Next.js's server-side rendering, file-based routing, and API routes would add complexity without benefit here. Vite provides instant HMR and sub-second builds, and React's component model + context API perfectly handles our state management needs without additional dependencies like Redux.

### Q12: "How do you handle rate limiting?"
> We use an in-memory rate limiter (Map-based) that allows 10 queries per day per user on the free plan. Each user's count resets every 24 hours. The rate limiter runs as Express middleware on query routes, returning HTTP 429 with a clear message. For production scale across multiple server instances, this would be swapped for a Redis-based limiter.

### Q13: "What is the idle logout mechanism?"
> A custom React hook (`useIdleLogout`) listens for user activity events (mousedown, mousemove, keydown, scroll, touchstart). A 30-minute timer resets on any activity. When the timer expires, it calls the logout API, clears the user state, and redirects to login. This prevents sessions from staying active on unattended machines — important for an app that has access to database credentials.

### Q14: "How is the frontend state managed?"
> We use React's built-in Context API with two main providers: `AuthContext` (user auth state) and `DatabaseContext` (connection list, active connection). Custom hooks like `useAuth()`, `useDatabase()`, and `useQuery()` encapsulate specific logic. The `useQuery()` hook manages loading/error/result/clarification states for the query execution flow. This approach avoids the boilerplate of Redux while being sufficient for our state management needs.

### Q15: "Walk me through what happens when a user signs up and runs their first query."
> (1) User fills signup form → password is bcrypt-hashed → user record created → JWT cookie set → redirected to Dashboard. (2) Dashboard shows "No connections" empty state. (3) User navigates to Settings → adds target DB details (host, port, username, password) → password is AES-256 encrypted → connection saved. (4) User goes to QueryLab → selects their connection → types a question. (5) Backend fetches schema (structure only), asks AI for clarity check, generates SQL, validates safety, runs on read-only connection, AI summarizes results. (6) User sees results table, generated SQL, AI summary, and optional chart.

---

## 15. Folder Structure Reference

```
querycraft/
├── README.md
│
├── backend/
│   ├── server.js                        # Express entry point
│   ├── package.json                     # Dependencies
│   ├── .env.example                     # Environment variables template
│   ├── app_db_schema.sql                # App database schema
│   ├── target_db_schema.sql             # Target DB + read-only role setup
│   │
│   ├── config/
│   │   ├── appDb.js                     # PostgreSQL pool for app database
│   │   ├── aiProvider.js                # AI provider factory (Gemini/Grok/Claude)
│   │   ├── gemini.js                    # Legacy Gemini config
│   │   └── providers/
│   │       ├── geminiProvider.js         # Gemini 2.5 Flash implementation
│   │       ├── grokProvider.js           # Grok 4 implementation
│   │       └── anthropicProvider.js      # Claude Sonnet 4.5 implementation
│   │
│   ├── controllers/
│   │   ├── authController.js            # Signup, Login, Logout, Profile
│   │   ├── googleAuthController.js      # Google OAuth2 flow
│   │   ├── queryController.js           # NL→SQL→Execute core pipeline
│   │   ├── databaseController.js        # Connection CRUD + schema browser
│   │   ├── chatController.js            # Analyst Chat agent
│   │   ├── alertController.js           # Proactive alert management
│   │   └── historyController.js         # Query history
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT verification
│   │   ├── rateLimiter.js               # 10 queries/day free limit
│   │   └── validateSQL.js               # SQL safety validation (Layer 1)
│   │
│   ├── routes/
│   │   ├── auth.routes.js               # /api/auth/*
│   │   ├── database.routes.js           # /api/databases/*
│   │   ├── query.routes.js              # /api/query/*
│   │   ├── chat.routes.js               # /api/chat/*
│   │   ├── alert.routes.js              # /api/alerts/*
│   │   └── history.routes.js            # /api/history/*
│   │
│   ├── services/
│   │   ├── aiService.js                 # AI interaction (never touches DB)
│   │   ├── promptBuilder.js             # Prompt engineering
│   │   ├── chatAgent.js                 # Multi-step analyst agent
│   │   ├── sqlExecutor.js               # Auto-retry up to 3 times
│   │   ├── schemaFetcher.js             # Read DB structure (no data)
│   │   ├── schemaBrowser.js             # Schema browser helpers
│   │   ├── targetDbConnector.js         # Short-lived read-only pool
│   │   ├── embeddingService.js          # Semantic search (pgvector)
│   │   └── alertDetectionService.js     # Proactive anomaly detection
│   │
│   ├── utils/
│   │   ├── encrypt.js                   # AES-256-CBC encrypt/decrypt
│   │   └── jwt.js                       # JWT generate/verify
│   │
│   ├── migrations/
│   │   ├── createChatTables.js          # conversations + chat_messages
│   │   └── createAlertTables.js         # alerts table + db_connections columns
│   │
│   └── scripts/
│       └── setupSemanticSandbox.js      # Demo pgvector data setup
│
└── frontend/
    ├── index.html                       # Entry HTML
    ├── package.json                     # Dependencies
    ├── vite.config.js                   # Vite configuration
    ├── tailwind.config.js               # TailwindCSS design tokens
    ├── postcss.config.js                # PostCSS with Tailwind plugin
    │
    └── src/
        ├── main.jsx                     # React entry point
        ├── App.jsx                      # Root component with routing
        ├── index.css                    # Global styles
        │
        ├── pages/
        │   ├── Home.jsx                 # Landing page
        │   ├── Login.jsx                # Login form
        │   ├── Signup.jsx               # Registration form
        │   ├── Dashboard.jsx            # Overview + alerts
        │   ├── QueryLab.jsx             # Main query workspace
        │   ├── History.jsx              # Past queries
        │   └── Settings.jsx             # Connections + profile management
        │
        ├── components/
        │   ├── Sidebar.jsx              # Navigation sidebar
        │   ├── QueryInput.jsx           # NL question input
        │   ├── VoiceInput.jsx           # Speech-to-text
        │   ├── SQLViewer.jsx            # SQL display + edit
        │   ├── ResultTable.jsx          # Data table
        │   ├── ResultSummary.jsx        # AI summary display
        │   ├── ChartToggle.jsx          # Table/chart toggle
        │   ├── AutoChart.jsx            # AI-suggested charts
        │   ├── ClarificationPanel.jsx   # Ambiguity resolution
        │   ├── SchemaBrowser.jsx        # Database schema tree
        │   ├── AnalystChat.jsx          # Multi-step chat agent
        │   ├── AlertsPanel.jsx          # Alert notifications
        │   ├── AuthLayout.jsx           # Auth page wrapper
        │   ├── ProtectedRoute.jsx       # Auth gate HOC
        │   ├── GoogleButton.jsx         # Google OAuth button
        │   ├── LoadingSpinner.jsx       # Loading animation
        │   ├── EmptyState.jsx           # Empty state placeholder
        │   ├── Toast.jsx                # Toast notifications
        │   └── TranslationConsole.jsx   # AI process visualization
        │
        ├── hooks/
        │   ├── useAuth.js               # Auth context consumer
        │   ├── useDatabase.js           # Database context consumer
        │   ├── useQuery.js              # Query execution logic
        │   └── useIdleLogout.js         # Auto-logout on inactivity
        │
        ├── api/
        │   ├── axiosInstance.js          # Configured axios
        │   ├── authApi.js               # Auth API calls
        │   ├── queryApi.js              # Query API calls
        │   ├── dbApi.js                 # Database API calls
        │   ├── chatApi.js               # Chat API calls
        │   └── alertApi.js              # Alert API calls
        │
        └── context/
            ├── AuthContext.jsx          # Global auth state
            └── DatabaseContext.jsx      # Global DB connection state
```

---

## Environment Variables Reference

| Variable | Location | Description |
|----------|----------|-------------|
| `APP_DB_URI` | Backend | Neon app database connection string |
| `GEMINI_API_KEY` | Backend | Google Gemini API key |
| `AI_PROVIDER` | Backend | "gemini", "grok", or "anthropic" |
| `GROK_API_KEY` | Backend | xAI Grok API key (if using Grok) |
| `ANTHROPIC_API_KEY` | Backend | Anthropic API key (if using Claude) |
| `JWT_SECRET` | Backend | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Backend | Token expiry (default: "7d") |
| `ENCRYPTION_SECRET` | Backend | Exactly 32 chars for AES-256 |
| `PORT` | Backend | Server port (default: 5000) |
| `FRONTEND_URL` | Backend | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Backend | Google OAuth callback URL |
| `VITE_API_BASE_URL` | Frontend | Backend API URL |

---

> **Document prepared for interview reference — covers architecture, technology choices, security, data flows, and every module in the QueryCraft project.**

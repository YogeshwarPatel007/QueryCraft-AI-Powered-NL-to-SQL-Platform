# QueryMind — Natural Language to SQL

Ask your database questions in plain English. Gemini writes the SQL, your backend
runs it safely (read-only), and you see the results instantly.

## Architecture

Two separate Neon Postgres databases:

1. **App Database** — stores `users`, `db_connections`, `queries` (history).
   Your backend has full access here (it's your own app data).
2. **Target Database** — the user's real data (their own Neon DB, or any Postgres).
   Backend connects here using a **read-only role** only. AI never has write access.

```
User types question
   → React sends to backend
   → Backend reads target DB schema (structure only, no data)
   → Gemini generates SQL from question + schema
   → Backend validates SQL is SELECT-only
   → Backend runs it via a READ-ONLY database role
   → If it errors, Gemini auto-retries up to 3 times
   → Results + SQL shown in React, saved to history in App DB
```

## Setup

### 1. Create the App Database (Neon)
- Create a Neon project, e.g. `querymind-app-db`
- Run `backend/app_db_schema.sql` in its SQL Editor
- Copy its connection string → `APP_DB_URI` in `backend/.env`

### 2. Create / Use a Target Database (Neon, or any Postgres)
- This can be a second Neon project, or your existing database
- Run `backend/target_db_schema.sql` (adjust sample data as needed)
- This creates a `readonly_ai_user` role with SELECT-only access
- You'll add this connection through the app's Settings page (not .env) —
  each user can add their own target database via the UI

### 3. Get a Gemini API Key
- Go to https://aistudio.google.com
- Generate an API key → put it in `backend/.env` as `GEMINI_API_KEY`

### 4. Backend Setup
```bash
cd backend
cp .env.example .env
# fill in APP_DB_URI, GEMINI_API_KEY, JWT_SECRET, ENCRYPTION_SECRET
npm install
npm run dev
```
Backend runs on http://localhost:5000

### 5. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### 6. Using the App
1. Sign up / log in
2. Go to Settings → add your target database connection
   - Use the `readonly_ai_user` credentials (NOT your admin login)
3. Go to Query Lab → ask a question in plain English
4. View results as a table, toggle to chart, see the generated SQL

## Safety Notes

- `ENCRYPTION_SECRET` must be exactly 32 characters (used for AES-256 encryption of stored DB passwords)
- Never put real admin database credentials into the app — always create and use a read-only role
- The backend double-checks every AI-generated query with `validateSQL.js` before running it,
  on top of the database-level read-only permission — two independent layers of protection

## Deployment
- Frontend → Vercel (connect your GitHub repo, set `VITE_API_BASE_URL` env var to your Render backend URL)
- Backend → Render (connect your GitHub repo, set all `.env` variables in Render's Environment tab)

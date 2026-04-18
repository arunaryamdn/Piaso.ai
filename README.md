# Piaso.ai

Personal wealth tracker for India. Tracks investments (Zerodha portfolio) and monthly spending (bank statements) in one mobile-first app.

**Live:** Deployed on Vercel. Backend as Python serverless functions, frontend as Next.js 16.

---

## Quick start (local dev)

### Prerequisites
- Node.js 20+, Python 3.11+
- WSL2 (Windows) or macOS/Linux
- A Google OAuth app (for sign-in)
- Neon Postgres database (or leave empty to use SQLite locally)

### 1. Clone and install frontend
```bash
cd frontend
npm install
```

### 2. Set up Python virtualenv
```bash
cd frontend
python3 -m venv .venv
source .venv/bin/activate
pip install -r api/requirements.txt
```

### 3. Configure environment
Create `frontend/.env.local`:
```
AUTH_SECRET=any-random-32-char-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
JWT_SECRET=changeme
# Leave POSTGRES_URL empty to use SQLite locally
# POSTGRES_URL=postgresql://...
```

### 4. Run both servers

**Terminal 1 — FastAPI backend (port 5000):**
```bash
cd frontend && source .venv/bin/activate
uvicorn api.index:app --reload --port 5000
```

**Terminal 2 — Next.js frontend (port 3001):**
```bash
cd frontend && npm run dev
```

Open `http://localhost:3001`.

---

## Project structure

```
Piaso.ai/
├── backend/                    # Python business logic
│   ├── api/
│   │   ├── routes_portfolio.py # Portfolio upload, analytics, Zerodha
│   │   ├── routes_spend.py     # Bank statement parsing, spend summary
│   │   ├── routes_nse.py       # NSE equity quotes via yfinance
│   │   └── routes_pulse.py     # Combined net worth + spend overview
│   ├── utils/
│   │   ├── db.py               # Postgres/SQLite abstraction
│   │   ├── nse_client.py       # yfinance .NS wrapper
│   │   ├── prices.py           # Live price fetcher
│   │   └── statement_parser.py # PDF + Excel bank statement parser
│   └── config.py               # Constants, env vars
├── frontend/                   # Next.js 16 app (Vercel Root Directory)
│   ├── app/
│   │   ├── page.tsx            # Landing page (unauthenticated)
│   │   ├── (auth)/login/       # Google sign-in
│   │   └── (app)/              # Authenticated shell
│   │       ├── pulse/          # Net worth + spend overview
│   │       ├── invest/         # Portfolio analytics + upload
│   │       ├── spend/          # Spend summary + statement upload
│   │       ├── ai/             # AI buy/hold/sell recommendations
│   │       ├── news/           # NSE news for holdings
│   │       └── profile/        # User profile, portfolio management
│   ├── components/             # React components
│   ├── api/
│   │   ├── index.py            # Vercel serverless entry (Mangum adapter)
│   │   └── requirements.txt    # Python deps for Vercel
│   ├── auth.ts                 # Auth.js v5 + Google OAuth + pg adapter
│   └── proxy.ts                # Next.js 16 route protection
└── docs/                       # PRD, Architecture, Design docs
```

---

## Deployment (Vercel)

Set **Root Directory** to `frontend` in Vercel project settings.

**Required env vars:**
```
AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
NEXTAUTH_URL, NEXT_PUBLIC_APP_URL
JWT_SECRET, POSTGRES_URL
```

**One-time Neon Postgres migrations:**
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE,
  description TEXT,
  amount NUMERIC,
  transaction_type TEXT,
  category TEXT,
  confidence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_cycles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  salary_amount NUMERIC,
  salary_day INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Auth.js auto-creates its own tables on first run via `@auth/pg-adapter`.

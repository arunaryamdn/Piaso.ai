# Piaso.ai — Architecture Document

**Version:** 1.0  
**Date:** April 2026

---

## 1. Overview

Piaso.ai is a monorepo with two logical layers:

```
┌─────────────────────────────────────────┐
│          Browser (mobile-first)          │
│         Next.js 16 App Router            │
│         React Server + Client Components │
└────────────────┬────────────────────────┘
                 │ HTTPS / rewrites in dev
┌────────────────▼────────────────────────┐
│         FastAPI (Python 3.11)            │
│         Vercel Serverless Functions      │
│         Mangum ASGI adapter              │
└────────────────┬────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼──────┐    ┌─────────▼──────┐
│  Neon       │    │   SQLite        │
│  Postgres   │    │   /tmp/...db    │
│  (prod)     │    │   (local dev)   │
└─────────────┘    └────────────────┘
```

---

## 2. Frontend

### Framework
- **Next.js 16** with App Router and Turbopack
- **React Server Components** for data-fetching pages (invest, pulse, ai, news)
- **"use client"** components where interactivity is needed (spend, profile, hamburger menu)

### Route groups
```
app/
├── page.tsx                  # Landing (public)
├── (auth)/                   # Login shell — centered card layout, no nav
│   └── login/page.tsx
├── (app)/                    # Authenticated shell — AppHeader + BottomNav
│   ├── layout.tsx            # auth() guard, renders AppHeader + BottomNav
│   ├── pulse/page.tsx        # RSC — fetches /api/pulse
│   ├── invest/page.tsx       # RSC — fetches /api/dashboard/analytics
│   ├── invest/upload/        # Client — file upload form
│   ├── spend/page.tsx        # Client — useSession for token, fetch spend endpoints
│   ├── ai/page.tsx           # RSC — fetches /api/dashboard/recommendations
│   ├── news/page.tsx         # RSC — fetches /api/nse/news
│   └── profile/              # Client — portfolio management, sign out
└── zerodha/callback/page.tsx # Client — token exchange, redirect
```

### Auth
- **Auth.js v5** (`next-auth`) with Google provider
- **Database sessions** via `@auth/pg-adapter` on Neon Postgres
- `session.backendToken`: HS256 JWT minted in `session` callback, signed with `JWT_SECRET`, contains `{ id: user.id }`. Used to authenticate all FastAPI calls.
- Route protection in `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`)

### API calls
- **Server Components** use `apiFetch<T>(path, token)` from `lib/api.ts`
  - On server: `BASE = http://localhost:5000` (direct, bypasses rewrite proxy)
  - On client: `BASE = ""` (relative, goes through Next.js rewrites → port 5000)
- **Client Components** use `fetch()` directly with `Authorization: Bearer <backendToken>` header

### Design system
- CSS custom properties in `globals.css` (design tokens)
- Deep Teal `#1B3A4B`, warm ivory `#FAF9F6`, Fraunces serif + DM Sans
- Health gradient classes: `bg-health-{green|amber|red|grey}`
- No CSS framework for layout — inline `style={}` with CSS vars
- Tailwind utility classes used only for: `font-display`, `tabular`, health gradients

---

## 3. Backend

### Framework
FastAPI 0.100+ running as a single ASGI app, adapted to AWS Lambda/Vercel via **Mangum**.

### Entry point
`frontend/api/index.py`:
1. Adds repo root to `sys.path` so `import backend.*` works
2. Creates FastAPI app with CORS
3. Initialises SQLite schema (for local dev)
4. Registers routers from `backend/api/routes_*.py` — each in a `try/except` so a broken route doesn't crash the whole app
5. `handler = Mangum(app, lifespan="off")` — Vercel calls this

### Routers

| Router | Prefix | Responsibility |
|--------|--------|---------------|
| `routes_portfolio` | `/api` | Upload Excel, analytics, delete, Zerodha token exchange |
| `routes_spend` | `/api/spend` | Upload bank statement, transactions, summary, salary config |
| `routes_nse` | `/api/nse` | Live equity quote, historical prices (yfinance) |
| `routes_pulse` | `/api` | Combined `/api/pulse` — merges portfolio + spend |

### Auth
All protected routes use `get_user_id_from_token(authorization: str = Header(...))` as a FastAPI `Depends`. Validates the JWT signed with `JWT_SECRET`. Returns `payload['id']` as `user_id`.

### Database abstraction
`backend/utils/db.py` provides two functions:
```python
fetchall(_, query, params)  # SELECT → list[dict]
execute(query, params)       # INSERT / UPDATE / DELETE
```
Internally: connects to Postgres if `POSTGRES_URL` is set, otherwise SQLite. Normalises `?` → `%s` for Postgres.

### NSE data
`backend/utils/nse_client.py` wraps yfinance:
- `get_equity_quote(symbol)` → appends `.NS`, fetches current price, 52-week range, etc.
- `get_equity_historical(symbol, period)` → OHLCV dataframe
Replaces the old Node.js `stock-nse-india` service entirely.

### Statement parser
`backend/utils/statement_parser.py`:
- `parse_excel_statement(content, filename)` — reads XLSX/CSV via openpyxl/pandas
- `parse_pdf_statement(content)` — extracts text via pdfplumber
- `classify_transaction(description, amount)` → `income | investment | committed | discretionary`
  - Rule cascade: keyword dict → fallback on amount sign
  - Returns `(transaction_type, confidence)` where confidence is `high | medium | low`

---

## 4. Database schema

### Auth.js tables (auto-created by `@auth/pg-adapter`)
`users`, `accounts`, `sessions`, `verification_tokens`

### Portfolios (SQLite: created by `index.py`; Postgres: manual migration)
```sql
CREATE TABLE portfolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  data TEXT NOT NULL,          -- JSON blob of holdings
  filename TEXT,
  filesize INTEGER,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'ready'
);
```

### Transactions (Postgres: manual migration)
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE,
  description TEXT,
  amount NUMERIC,
  transaction_type TEXT,       -- income | investment | committed | discretionary
  category TEXT,
  confidence TEXT,             -- high | medium | low
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Salary cycles (Postgres: manual migration)
```sql
CREATE TABLE salary_cycles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  salary_amount NUMERIC,
  salary_day INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Deployment

### Vercel config (`frontend/vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

Vercel auto-detects `frontend/api/index.py` + `frontend/api/requirements.txt` and creates Python serverless functions.

### Local dev differences from production
| Aspect | Local | Production |
|--------|-------|-----------|
| Database | SQLite at `/tmp/portfolios.db` | Neon Postgres |
| API calls | Next.js rewrites → `localhost:5000` | Same Vercel deployment |
| Auth session storage | Postgres (must set `POSTGRES_URL`) | Postgres |
| HTTPS | No | Yes (Vercel) |

---

## 6. Security notes

- JWT_SECRET must be set to a strong random value in production (not `"changeme"`)
- `CORS allow_origins = ["*"]` — acceptable for a personal app; restrict to domain for production hardening
- Google profile photos fetched with `referrerPolicy="no-referrer"` to avoid auth-gated 403s
- No PII stored beyond Auth.js user table (name, email, Google account ID)
- Portfolio data stored as JSON blob — not queryable, not shared between users

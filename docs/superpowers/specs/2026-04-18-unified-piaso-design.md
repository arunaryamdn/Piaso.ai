# Piaso.ai — Unified Product Spec
**Date:** 2026-04-18  
**Status:** Approved for implementation  
**Author:** Arun Arya

---

## 1. Product Vision

Piaso.ai merges two products into one:
- **Paiso.ai** — investment portfolio tracker (Zerodha/Kite integration, NSE data)
- **Gullak** — salary-cycle spend awareness ("Am I okay this month?")

**Primary entry point:** Net worth pulse — one number that answers "how am I doing overall?" with investments and spend as L1 drill-downs.

**Target user:** Indian salaried consumer, 25–45, urban, Zerodha account holder, monthly salary. Not a power trader — someone who wants clarity.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 Vercel (single project)                  │
│                                                         │
│  Next.js 15 App Router                                  │
│  ├── (auth)/ login, signup (Google OAuth redirect)      │
│  └── (app)/                                             │
│      ├── pulse/        ← L0: Net worth + spend health   │
│      ├── invest/       ← Portfolio, charts, stocks      │
│      └── spend/        ← Gullak: timeline, categories  │
│                                                         │
│  /api/auth/[...nextauth]  ← Auth.js v5 + Google         │
│  /api/[...path]           ← FastAPI via Mangum           │
│      ├── /portfolio       (upload, fetch, delete)        │
│      ├── /dashboard       (analytics, metrics)           │
│      ├── /nse/equity      (merged from stock-nse-india)  │
│      ├── /nse/historical  (merged from stock-nse-india)  │
│      └── /spend           (bank statement upload, CRUD)  │
└─────────────────────────────────────────────────────────┘
              │
              ▼
     Neon Postgres (Vercel-managed)
     ├── users          (Auth.js — email, name, image)
     ├── accounts       (Auth.js — Google OAuth tokens)
     ├── sessions       (Auth.js — session management)
     ├── portfolios     (migrated from SQLite /tmp)
     └── transactions   (new: bank statement spend data)
```

---

## 3. Authentication — Google OAuth via Auth.js v5

### Decision
Replace custom JWT auth (`api/auth/[...path].js`, `api/user/[...path].js`) with Auth.js v5 (NextAuth) using Google Provider.

### What gets eliminated
- `frontend/api/auth/[...path].js` — deleted
- `frontend/api/user/[...path].js` — deleted  
- `auth-server/` standalone service — no longer needed
- All bcrypt, jsonwebtoken deps from auth paths

### What Auth.js v5 provides
- Google OAuth flow (handled entirely by Google + Auth.js)
- Session management (JWT strategy, or DB sessions via Neon adapter)
- `useSession()` hook in Next.js client components
- `auth()` server-side function in Server Components and API routes
- Automatic `/api/auth/[...nextauth]` route handler

### User identity in Neon
Auth.js creates and manages these tables automatically via `@auth/pg-adapter`:
```sql
users       (id, name, email, emailVerified, image)
accounts    (userId, provider, providerAccountId, ...)
sessions    (sessionToken, userId, expires)
```

### User profile extensions
Additional columns bolted onto the `users` table (not Auth.js managed — our own):
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zerodha_connected BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_day INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_amount INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
```

### Auth flow
```
User clicks "Continue with Google"
→ Auth.js redirects to Google OAuth
→ Google returns to /api/auth/callback/google
→ Auth.js creates/updates user in Neon
→ Session cookie set (httpOnly, secure)
→ Redirect to /pulse (or onboarding if new user)
```

### Protecting routes
- Next.js middleware (`middleware.ts`) checks session on `(app)/*` routes
- FastAPI backend validates using the Auth.js session token passed as Bearer header
- No JWT generation needed — Auth.js session token IS the credential

---

## 4. Database Schema — Neon Postgres

### Auth tables (Auth.js managed — do not modify)
```sql
-- Auth.js creates these automatically via @auth/pg-adapter
users, accounts, sessions, verification_tokens
```

### Portfolio table (migrated from SQLite)
```sql
CREATE TABLE portfolios (
    id          SERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data        JSONB NOT NULL,          -- holdings array
    filename    TEXT,
    filesize    INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    status      TEXT DEFAULT 'ready'    -- ready | processing | failed
);

CREATE INDEX idx_portfolios_user ON portfolios(user_id);
```

### Transactions table (new — Gullak spend data)
```sql
CREATE TABLE transactions (
    id              SERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    description     TEXT NOT NULL,
    amount          NUMERIC(12,2) NOT NULL,   -- positive = credit, negative = debit
    category        TEXT,                     -- Groceries, EMI, SIP, etc.
    transaction_type TEXT,                    -- committed | discretionary | income | investment
    confidence      TEXT DEFAULT 'high',      -- high | medium | low (from statement parse)
    source          TEXT DEFAULT 'upload',    -- upload | zerodha | manual
    source_file     TEXT,                     -- original filename
    raw_text        TEXT,                     -- original bank statement row
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
```

### Salary cycle config (new — Gullak)
```sql
CREATE TABLE salary_cycles (
    id              SERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    salary_amount   NUMERIC(12,2),
    salary_day      INTEGER DEFAULT 1,    -- day of month salary is credited
    cycle_start     DATE,                 -- computed: last salary credit date
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Backend — FastAPI + NSE Merged

### What changes
The separate `stock-nse-india` Node.js service is **eliminated**. Its functionality is absorbed into the Python FastAPI backend using libraries already in `requirements.txt`:
- `nsepython` — NSE equity data, OHLC
- `nsetools` — NSE stock details
- `yfinance` — historical data, fallback pricing
- `requests` + `beautifulsoup4` — NSE scraping (already available)

### New backend structure
```
backend/
├── api/
│   ├── routes_portfolio.py    (existing, minor updates)
│   ├── routes_nse.py          (NEW: merged from stock-nse-india)
│   ├── routes_spend.py        (NEW: bank statement upload + CRUD)
│   └── routes_pulse.py        (NEW: combined net worth pulse endpoint)
├── utils/
│   ├── metrics.py             (existing)
│   ├── prices.py              (update: use nsepython directly, not Node.js HTTP)
│   ├── performance.py         (existing)
│   ├── sector.py              (existing)
│   ├── statement_parser.py    (NEW: PDF + Excel bank statement parser)
│   └── ...existing utils
└── models/
    ├── portfolio.py           (existing)
    ├── transaction.py         (NEW: Pydantic models for spend)
    └── pulse.py               (NEW: net worth + spend pulse model)
```

### New API endpoints

#### NSE routes (replacing Node.js service)
```
GET  /api/nse/equity/{symbol}                 Current price, details
GET  /api/nse/equity/{symbol}/historical      OHLC historical data
GET  /api/nse/equity/{symbol}/intraday        1-min candles (today)
GET  /api/nse/indices                         Nifty 50, Sensex, etc.
```

#### Spend routes (new)
```
POST /api/spend/upload-statement              Upload PDF or Excel bank statement
GET  /api/spend/transactions                  List transactions (paginated, filterable)
POST /api/spend/transactions                  Add manual transaction
PATCH /api/spend/transactions/{id}            Update category/type
DELETE /api/spend/transactions/{id}           Delete transaction
GET  /api/spend/summary                       Cycle summary (committed, discretionary, runway)
GET  /api/spend/categories                    Category breakdown
POST /api/spend/salary-cycle                  Set/update salary cycle config
```

#### Pulse endpoint (new)
```
GET  /api/pulse                               Combined: net worth + today's gain + spend health + runway days
```

### Statement parser approach
Bank statement parsing (PDF/Excel → transactions):
- **Excel/CSV:** pandas `read_excel` / `read_csv`, column detection heuristics
- **PDF:** `pdfplumber` (add to requirements) for text extraction, then regex patterns for common Indian bank formats (HDFC, ICICI, SBI, Axis, Kotak)
- **Classification:** Rule-based first (EMI keywords, SIP patterns, known merchant names), AI-assisted fallback via Claude API for ambiguous transactions

### Database migration: SQLite → Neon Postgres
Update `backend/config.py` and `frontend/api/index.py`:
```python
# Replace SQLite with Neon Postgres
import psycopg2  # or asyncpg for async
DATABASE_URL = os.environ.get("POSTGRES_URL")
```
Portfolio queries rewritten to use Postgres (JSON → JSONB, INTEGER id → TEXT for Auth.js compatibility).

---

## 6. Frontend — Next.js 15 App Router

### Migration from CRA
React CRA (`react-scripts`) replaced with Next.js 15 App Router. Existing components are reused as Client Components initially, progressively converted to Server Components where beneficial.

### Directory structure
```
app/
├── layout.tsx                 Root layout (fonts, providers, theme)
├── (auth)/
│   ├── login/page.tsx         Google sign-in button only
│   └── layout.tsx             Auth layout (centered, no nav)
├── (app)/
│   ├── layout.tsx             App shell: bottom nav (mobile) + sidebar (desktop)
│   ├── pulse/
│   │   └── page.tsx           L0: Net worth hero + two metric cards + activity feed
│   ├── invest/
│   │   ├── page.tsx           Portfolio overview + chart + holdings
│   │   └── [symbol]/
│   │       └── page.tsx       Stock detail + position + chart
│   └── spend/
│       ├── page.tsx           Gullak L0: coin jar + runway + timeline
│       ├── categories/
│       │   └── page.tsx       L1: category breakdown
│       ├── transactions/
│       │   └── page.tsx       L2: transaction list + upload
│       └── actions/
│           └── page.tsx       L3: recommendations
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts       Auth.js v5 handler
│   └── [...path]/
│       └── route.ts           Proxy to FastAPI (or replace with Mangum)
middleware.ts                  Protect (app)/* routes, redirect to /login
```

### Component reuse strategy
From existing `frontend/src/components/`:
- `DashboardPage.tsx` → `/invest/page.tsx` (renamed, restyled)
- `PortfolioTable.tsx` → `/invest/page.tsx` (sub-component)
- `PortfolioUpload.tsx` → `/invest/upload/page.tsx`
- `LoginPage.tsx` → `/login/page.tsx` (simplified to Google button only)

From `spend-analytics/src/`:
- `L0Timeline.jsx` → `/spend/page.tsx` (converted to TSX)
- `L1Categories.jsx` → `/spend/categories/page.tsx`
- `L2Events.jsx` → `/spend/transactions/page.tsx`
- `L3Actions.jsx` → `/spend/actions/page.tsx`
- `Board.jsx` (coin jar) → shared component
- `lib/simDay.js`, `actionEngine.js`, `streakInsights.js` → ported to TypeScript

### Design system implementation
Using Gullak's design system (extended for investments):
- CSS custom properties from `DESIGN.md` → `app/globals.css`
- Tailwind configured with custom tokens
- Fonts: Fraunces + DM Sans via `next/font/google`
- No UI component library (shadcn optional later)

### State management
- **Server state:** SWR (already in use) or TanStack Query
- **Auth state:** Auth.js `useSession()` hook
- **UI state:** React `useState` / `useReducer` (no Redux)
- **Spend simulation state:** React context (Gullak day simulator)

---

## 7. Removed / Deprecated

| What | Why |
|---|---|
| `auth-server/` (standalone Express) | Replaced by Auth.js v5 Google provider |
| `frontend/api/auth/[...path].js` | Replaced by Auth.js |
| `frontend/api/user/[...path].js` | Replaced by Auth.js + profile in Neon |
| `stock-nse-india/` Node.js service | NSE data merged into FastAPI (nsepython/yfinance) |
| SQLite `/tmp/portfolios.db` | Migrated to Neon Postgres |
| CRA (`react-scripts`) | Replaced by Next.js 15 |
| Hardcoded Windows paths in mcp_bridge.py | Removed (Go MCP server out of scope for now) |

---

## 8. Implementation Phases

### Phase 1 — Foundation (highest risk items first)
1. Scaffold new Next.js 15 project (App Router, TypeScript, Tailwind)
2. Implement Auth.js v5 with Google provider + Neon Postgres adapter
3. Apply Gullak design system: globals.css tokens, fonts, layout shell
4. Migrate portfolio DB from SQLite → Neon Postgres
5. Update FastAPI `api/index.py` to use Neon instead of SQLite
6. Merge NSE routes into FastAPI (`routes_nse.py`)
7. Port existing Paiso.ai invest screens (Dashboard → `/invest/`, Portfolio → `/invest/`)
8. Deploy and verify: login, portfolio upload, dashboard analytics

### Phase 2 — Gullak Merge (spend analytics)
1. Port Gullak components to TypeScript (L0–L3)
2. Implement `routes_spend.py` in FastAPI
3. Build `statement_parser.py` (PDF + Excel)
4. Add `/spend/` routes to Next.js
5. Bank statement upload UI + transaction list
6. Salary cycle config (onboarding)
7. Neon transactions table + spend summary endpoint

### Phase 3 — Pulse (unified L0)
1. Design + implement Pulse hero card (net worth + spend health combined)
2. `/api/pulse` endpoint (single call: portfolio value + today's change + runway days)
3. `/pulse/` page: hero + metric cards + activity timeline (investments + spend mixed)
4. Bottom navigation (Pulse / Invest / Spend)
5. Onboarding flow: Google sign-in → connect Zerodha or upload portfolio → upload bank statement

### Phase 4 — Zerodha Live Integration (deferred)
1. Zerodha OAuth flow (Kite Connect)
2. Live portfolio sync via Kite API
3. Live NSE price streaming

### Future (backlog)
- Account Aggregator (RBI AA) for automatic bank feed
- Other broker integrations (Groww, Upstox)
- AI-powered category classification (Claude API)
- Push notifications (spend alerts, portfolio milestones)
- Dark mode

---

## 9. Environment Variables

```bash
# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=           # random 32-char string
NEXTAUTH_URL=              # https://piaso-ai.vercel.app in prod, http://localhost:3000 in dev

# Database
POSTGRES_URL=              # Neon connection string (already set in Vercel)

# Zerodha (Phase 4)
KITE_API_KEY=
KITE_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=       # same as NEXTAUTH_URL
```

---

## 10. Testing Strategy

| Layer | Tool | Coverage target |
|---|---|---|
| FastAPI endpoints | pytest + httpx | 80%+ (existing 93%) |
| Next.js components | Vitest + Testing Library | Critical paths |
| Auth flow | Playwright E2E | Login → portfolio → spend |
| Statement parser | pytest with real statement samples | All supported bank formats |

---

## 11. Key Constraints

- **Mobile-first:** 393px primary viewport. Desktop secondary (920px+).
- **Indian number format:** ₹23,45,000 not ₹2,345,000.
- **Offline-tolerant:** Show cached portfolio when NSE data unavailable (don't crash).
- **Privacy:** Bank statement data stays in Neon, never logged, never sent to third parties.
- **No password storage:** Google OAuth only. No email/password signup.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |

**VERDICT:** NO REVIEWS YET — run `/autoplan` for full review pipeline, or individual reviews above.

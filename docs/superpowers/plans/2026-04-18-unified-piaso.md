# Unified Piaso.ai Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge Paiso.ai (investments) + Gullak (spend) into one Next.js 15 App Router app on Vercel with Google OAuth, Neon Postgres, and FastAPI analytics backend.

**Architecture:** Next.js 15 App Router (replaces React CRA) deployed on Vercel. Auth.js v5 with Google provider + Neon Postgres adapter replaces all custom JWT auth. FastAPI via Mangum handles analytics + NSE data (stock-nse-india Node.js service eliminated). Three route groups: `(auth)`, `(app)/invest`, `(app)/spend`, `(app)/pulse`.

**Tech Stack:** Next.js 15, TypeScript, Auth.js v5, Tailwind CSS, Neon Postgres (`pg`), FastAPI, Mangum, nsepython, yfinance, pdfplumber, SWR

---

## PHASE 1: Foundation — Next.js + Auth + DB Migration

**Deployable checkpoint:** Paiso.ai portfolio features working on Next.js with Google login. Neon Postgres. NSE data from Python. No Gullak yet.

---

### Task 1: Scaffold Next.js 15 in `frontend/`

**Files:**
- Delete: `frontend/src/`, `frontend/public/`, `frontend/package.json`, `frontend/.env*`
- Create: `frontend/package.json`, `frontend/next.config.ts`, `frontend/tsconfig.json`, `frontend/tailwind.config.ts`, `frontend/postcss.config.mjs`, `frontend/app/layout.tsx`, `frontend/app/globals.css`, `frontend/middleware.ts`

- [ ] **Step 1: Back up existing CRA files**
```bash
cd /home/arunarya/projects/Piaso.ai
cp -r frontend frontend_cra_backup
```

- [ ] **Step 2: Clear CRA scaffold, keep api/ and vercel.json**
```bash
cd frontend
# Remove CRA-specific files
rm -rf src public node_modules build
rm -f package.json package-lock.json tsconfig.json .env* README.md
# Keep: api/ vercel.json
```

- [ ] **Step 3: Create `frontend/package.json`**
```json
{
  "name": "piaso-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "15.3.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/pg-adapter": "^1.0.0",
    "pg": "^8.11.3",
    "swr": "^2.3.3",
    "recharts": "^2.15.3",
    "framer-motion": "^12.12.2",
    "react-icons": "^5.5.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/pg": "^8",
    "tailwindcss": "^3.4.3",
    "postcss": "^8.5.3",
    "autoprefixer": "^10.4.21",
    "vitest": "^2.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "eslint": "^9",
    "eslint-config-next": "15.3.1"
  }
}
```

- [ ] **Step 4: Create `frontend/next.config.ts`**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3001"] },
  },
  async rewrites() {
    // In dev: proxy /api/* (except auth) to FastAPI on port 5000
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path((?!auth).*)",
          destination: "http://localhost:5000/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
```

- [ ] **Step 5: Create `frontend/tsconfig.json`**
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Create `frontend/tailwind.config.ts`**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1B3A4B",
        "primary-light": "#2D5F73",
        "primary-dark": "#122831",
        "page-bg": "#FAF9F6",
        "ink-primary": "#1A1A2E",
        "ink-secondary": "#4A5568",
        "ink-muted": "#94A3B8",
        gain: "#059669",
        loss: "#DC2626",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 7: Create `frontend/postcss.config.mjs`**
```javascript
const config = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
export default config;
```

- [ ] **Step 8: Install dependencies**
```bash
cd /home/arunarya/projects/Piaso.ai/frontend
npm install
```
Expected: `node_modules/` created, no errors.

- [ ] **Step 9: Commit scaffold**
```bash
cd /home/arunarya/projects/Piaso.ai
git add frontend/
git commit -m "feat: scaffold Next.js 15 App Router (replace CRA)"
```

---

### Task 2: Design system — globals.css + fonts

**Files:**
- Create: `frontend/app/globals.css`
- Create: `frontend/app/layout.tsx`

- [ ] **Step 1: Create `frontend/app/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #1B3A4B;
  --primary-light: #2D5F73;
  --primary-dark: #122831;
  --brand-cyan: #00BAF2;

  --green-500: #059669; --green-600: #047857;
  --green-100: #D1FAE5; --green-50:  #ECFDF5;
  --amber-500: #D97706; --amber-600: #92400E;
  --amber-100: #FEF3C7; --amber-50:  #FFFBEB;
  --red-500:   #DC2626; --red-600:   #991B1B;
  --red-100:   #FEE2E2; --red-50:    #FEF2F2;
  --grey-500:  #64748B; --grey-600:  #475569;
  --grey-100:  #E2E8F0; --grey-50:   #F1F5F9;

  --gain: #059669; --gain-bg: #ECFDF5;
  --loss: #DC2626; --loss-bg: #FEF2F2;

  --ink-primary:   #1A1A2E;
  --ink-secondary: #4A5568;
  --ink-muted:     #94A3B8;
  --page-bg:       #FAF9F6;
  --card-bg:       #FFFFFF;
  --border:        rgba(0,0,0,0.06);

  --sp-1: 4px;  --sp-2: 8px;   --sp-3: 12px; --sp-4: 16px;
  --sp-6: 24px; --sp-8: 32px;  --sp-12: 48px; --sp-16: 64px;

  --r-sm: 6px; --r-md: 10px; --r-lg: 14px;
  --r-xl: 20px; --r-full: 999px;

  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-micro: 150ms; --dur-short: 250ms;
  --dur-medium: 450ms; --dur-long: 800ms;
}

[data-theme="dark"] {
  --primary: #5BA4C0;
  --ink-primary: #F1F5F9;
  --ink-secondary: #CBD5E1;
  --page-bg: #0F172A;
  --card-bg: #1E293B;
  --border: rgba(255,255,255,0.08);
}

* { box-sizing: border-box; }

body {
  background: var(--page-bg);
  color: var(--ink-primary);
  font-family: var(--font-dm-sans), sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Tabular numbers for all financial data */
.tabular { font-variant-numeric: tabular-nums; }

/* Health gradients */
.bg-health-green { background: linear-gradient(135deg,#ECFDF5 0%,#D1FAE5 50%,#A7F3D0 100%); }
.bg-health-amber { background: linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 50%,#FDE68A 100%); }
.bg-health-red   { background: linear-gradient(135deg,#FFF5F5 0%,#FEE2E2 50%,#FECACA 100%); }
.bg-health-grey  { background: linear-gradient(135deg,#F8FAFC 0%,#F1F5F9 50%,#E2E8F0 100%); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 2: Create `frontend/app/layout.tsx`**
```tsx
import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  axes: ["opsz"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Piaso.ai",
  description: "Your investments and spend, in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${fraunces.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create placeholder home redirect `frontend/app/page.tsx`**
```tsx
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/pulse");
}
```

- [ ] **Step 4: Verify dev server starts**
```bash
cd /home/arunarya/projects/Piaso.ai/frontend
npm run dev
```
Expected: `ready on http://localhost:3001`, no TypeScript errors.

- [ ] **Step 5: Commit**
```bash
git add frontend/app/
git commit -m "feat: add Gullak design system tokens and fonts to Next.js"
```

---

### Task 3: Auth.js v5 — Google OAuth + Neon Postgres

**Files:**
- Create: `frontend/auth.ts`
- Create: `frontend/app/api/auth/[...nextauth]/route.ts`
- Create: `frontend/app/(auth)/login/page.tsx`
- Create: `frontend/app/(auth)/layout.tsx`
- Delete: `frontend/api/auth/[...path].js`
- Delete: `frontend/api/user/[...path].js`

- [ ] **Step 1: Set up Google OAuth credentials**

Go to https://console.developers.google.com → Create OAuth 2.0 Client ID:
- Application type: Web
- Authorized redirect URIs: `http://localhost:3001/api/auth/callback/google` and `https://piaso-ai.vercel.app/api/auth/callback/google`

Copy Client ID and Client Secret.

- [ ] **Step 2: Create `frontend/.env.local`**
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=run_openssl_rand_-base64_32_and_paste_here
NEXTAUTH_URL=http://localhost:3001
POSTGRES_URL=your_neon_connection_string
```
Generate secret: `openssl rand -base64 32`

- [ ] **Step 3: Create Neon user profile extension migration**

Run in Neon SQL editor:
```sql
-- Auth.js creates users/accounts/sessions automatically via adapter.
-- We add our custom columns to users after first sign-in.
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zerodha_connected BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_day INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_amount INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS app_created_at TIMESTAMPTZ DEFAULT NOW();
```

- [ ] **Step 4: Create `frontend/auth.ts`**
```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL!, ssl: { rejectUnauthorized: false } });

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

- [ ] **Step 5: Create `frontend/app/api/auth/[...nextauth]/route.ts`**
```typescript
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 6: Create `frontend/app/(auth)/layout.tsx`**
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
      <div className="w-full max-w-sm px-4">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `frontend/app/(auth)/login/page.tsx`**
```tsx
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-col gap-6 items-center" style={{ borderColor: "var(--border)" }}>
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl" style={{ color: "var(--primary)" }}>
          Piaso.ai
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          Your investments and spend, in one place.
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/pulse" });
        }}
        className="w-full"
      >
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-colors"
          style={{ background: "var(--primary)", color: "white" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </form>

      <p className="text-xs text-center" style={{ color: "var(--ink-muted)" }}>
        By continuing, you agree to our Terms of Service.
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Delete old auth serverless functions**
```bash
cd /home/arunarya/projects/Piaso.ai/frontend
rm -rf api/auth api/user
```

- [ ] **Step 9: Test auth locally**
```bash
npm run dev
# Open http://localhost:3001/login
# Click "Continue with Google"
# Should redirect to Google → back to /pulse (which will 404 for now)
```

- [ ] **Step 10: Commit**
```bash
git add -A
git commit -m "feat: add Auth.js v5 Google OAuth, remove custom JWT auth"
```

---

### Task 4: Route protection middleware

**Files:**
- Create: `frontend/middleware.ts`

- [ ] **Step 1: Create `frontend/middleware.ts`**
```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  if (isApiRoute) return NextResponse.next();
  if (isAuthPage && isLoggedIn) return NextResponse.redirect(new URL("/pulse", req.url));
  if (!isAuthPage && !isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Verify redirect works**
```bash
# Visit http://localhost:3001/ without being logged in
# Should redirect to /login
```

- [ ] **Step 3: Commit**
```bash
git add frontend/middleware.ts
git commit -m "feat: protect app routes with Auth.js session middleware"
```

---

### Task 5: Migrate portfolios from SQLite to Neon Postgres

**Files:**
- Modify: `frontend/api/index.py`
- Modify: `backend/config.py`
- Modify: `backend/api/routes_portfolio.py` (DB connection only)

- [ ] **Step 1: Add Neon migration in SQL editor**
```sql
CREATE TABLE IF NOT EXISTS portfolios (
    id          SERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL,
    data        JSONB NOT NULL,
    filename    TEXT,
    filesize    INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    status      TEXT DEFAULT 'ready'
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
```

- [ ] **Step 2: Update `backend/config.py`**
```python
import os

# Database — use Neon Postgres in production, SQLite fallback for local dev
DATABASE_URL = os.environ.get("POSTGRES_URL")
DB_PATH = os.environ.get("DB_PATH", "./portfolios.db")  # local dev fallback

JWT_SECRET = os.environ.get("JWT_SECRET", "changeme")
NODE_API_URL = os.environ.get("NODE_API_URL", "http://localhost:3000/api/equity/")
LOG_PREFIX = "[Piaso.ai Backend]"
```

- [ ] **Step 3: Create `backend/utils/db.py`**
```python
import os
import psycopg2
import psycopg2.extras
import sqlite3

def get_connection():
    """Return a Postgres connection if POSTGRES_URL is set, else SQLite for local dev."""
    db_url = os.environ.get("POSTGRES_URL")
    if db_url:
        conn = psycopg2.connect(db_url, sslmode="require")
        return conn, "postgres"
    db_path = os.environ.get("DB_PATH", "./portfolios.db")
    return sqlite3.connect(db_path), "sqlite"


def fetchall(cursor, query: str, params=()) -> list[dict]:
    """Execute query and return list of dicts (works for both Postgres and SQLite)."""
    conn, dialect = get_connection()
    try:
        if dialect == "postgres":
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(query.replace("?", "%s"), params)
        else:
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute(query, params)
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def execute(query: str, params=()) -> None:
    """Execute a write query."""
    conn, dialect = get_connection()
    try:
        if dialect == "postgres":
            cur = conn.cursor()
            cur.execute(query.replace("?", "%s"), params)
        else:
            cur = conn.cursor()
            cur.execute(query, params)
        conn.commit()
    finally:
        conn.close()
```

- [ ] **Step 4: Add `psycopg2-binary` to `backend/api/requirements.txt`**
```
psycopg2-binary>=2.9.0
```

Also update `frontend/api/requirements.txt` to include it.

- [ ] **Step 5: Write test for db utility**

Create `backend/tests/test_db.py`:
```python
import os
import pytest

def test_get_connection_returns_sqlite_without_postgres_url(monkeypatch):
    monkeypatch.delenv("POSTGRES_URL", raising=False)
    monkeypatch.setenv("DB_PATH", "/tmp/test_piaso.db")
    from backend.utils.db import get_connection
    conn, dialect = get_connection()
    assert dialect == "sqlite"
    conn.close()
```

- [ ] **Step 6: Run test**
```bash
cd /home/arunarya/projects/Piaso.ai
pytest backend/tests/test_db.py -v
```
Expected: `PASSED`

- [ ] **Step 7: Commit**
```bash
git add backend/utils/db.py backend/config.py backend/api/requirements.txt frontend/api/requirements.txt backend/tests/test_db.py
git commit -m "feat: abstract DB layer, support Neon Postgres + SQLite fallback"
```

---

### Task 6: Merge NSE stock data into FastAPI

**Files:**
- Create: `backend/api/routes_nse.py`
- Modify: `backend/utils/prices.py`
- Modify: `frontend/api/index.py`

- [ ] **Step 1: Write failing test for NSE equity endpoint**

Create `backend/tests/test_routes_nse.py`:
```python
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from frontend.api.index import app
    return TestClient(app)


def test_nse_equity_returns_price(client):
    mock_data = {"symbol": "RELIANCE", "lastPrice": 2890.5, "change": 42.3, "pChange": 1.48}
    with patch("backend.api.routes_nse.get_equity_quote", return_value=mock_data):
        resp = client.get("/api/nse/equity/RELIANCE", headers={"Authorization": "Bearer testtoken"})
    assert resp.status_code == 200
    assert resp.json()["lastPrice"] == 2890.5


def test_nse_equity_invalid_symbol_returns_404(client):
    with patch("backend.api.routes_nse.get_equity_quote", return_value=None):
        resp = client.get("/api/nse/equity/INVALIDSYM", headers={"Authorization": "Bearer testtoken"})
    assert resp.status_code == 404
```

- [ ] **Step 2: Run to verify failure**
```bash
pytest backend/tests/test_routes_nse.py -v
```
Expected: `ImportError` or `FAILED` — routes don't exist yet.

- [ ] **Step 3: Create `backend/utils/nse_client.py`**
```python
"""
NSE data fetcher using nsepython + yfinance.
Replaces the stock-nse-india Node.js service.
"""
import logging
from async_lru import alru_cache
import yfinance as yf

logger = logging.getLogger(__name__)


def get_equity_quote(symbol: str) -> dict | None:
    """Fetch current price and basic info for an NSE symbol."""
    try:
        # yfinance uses .NS suffix for NSE
        ticker = yf.Ticker(f"{symbol}.NS")
        info = ticker.fast_info
        hist = ticker.history(period="2d")
        if hist.empty:
            return None
        last_price = float(hist["Close"].iloc[-1])
        prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else last_price
        change = last_price - prev_close
        p_change = (change / prev_close * 100) if prev_close else 0
        return {
            "symbol": symbol,
            "lastPrice": round(last_price, 2),
            "previousClose": round(prev_close, 2),
            "change": round(change, 2),
            "pChange": round(p_change, 2),
            "marketCap": getattr(info, "market_cap", None),
        }
    except Exception as e:
        logger.warning(f"NSE quote failed for {symbol}: {e}")
        return None


def get_equity_historical(symbol: str, period: str = "1y") -> list[dict]:
    """Fetch OHLC historical data. period: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max"""
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        hist = ticker.history(period=period)
        if hist.empty:
            return []
        return [
            {
                "date": str(idx.date()),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for idx, row in hist.iterrows()
        ]
    except Exception as e:
        logger.warning(f"NSE historical failed for {symbol}: {e}")
        return []
```

- [ ] **Step 4: Create `backend/api/routes_nse.py`**
```python
from fastapi import APIRouter, HTTPException, Depends
from backend.utils.nse_client import get_equity_quote, get_equity_historical
from backend.api.routes_portfolio import get_user_id_from_token

router = APIRouter(prefix="/api/nse", tags=["nse"])


@router.get("/equity/{symbol}")
async def equity_quote(symbol: str, user_id: int = Depends(get_user_id_from_token)):
    data = get_equity_quote(symbol.upper())
    if data is None:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    return data


@router.get("/equity/{symbol}/historical")
async def equity_historical(
    symbol: str,
    period: str = "1y",
    user_id: int = Depends(get_user_id_from_token),
):
    allowed = {"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"}
    if period not in allowed:
        raise HTTPException(status_code=400, detail=f"period must be one of {allowed}")
    data = get_equity_historical(symbol.upper(), period)
    return {"symbol": symbol, "period": period, "data": data}
```

- [ ] **Step 5: Register route in `frontend/api/index.py`**

Add after portfolio router registration:
```python
try:
    from backend.api.routes_nse import router as nse_router
    app.include_router(nse_router)
    logging.info("NSE routes loaded successfully.")
except Exception as e:
    logging.error(f"Could not load NSE routes: {e}")
```

- [ ] **Step 6: Update `backend/utils/prices.py`** to call local function instead of Node.js HTTP

Replace HTTP call to `localhost:3000` with direct function call:
```python
from backend.utils.nse_client import get_equity_quote

def get_current_price(symbol: str) -> float | None:
    """Get current price for a symbol. Returns None if unavailable."""
    data = get_equity_quote(symbol)
    return data["lastPrice"] if data else None
```

- [ ] **Step 7: Run tests**
```bash
pytest backend/tests/test_routes_nse.py -v
```
Expected: both tests `PASSED`.

- [ ] **Step 8: Commit**
```bash
git add backend/api/routes_nse.py backend/utils/nse_client.py backend/utils/prices.py frontend/api/index.py
git commit -m "feat: merge NSE stock data into FastAPI, remove Node.js dependency"
```

---

### Task 7: Port Invest screens to Next.js

**Files:**
- Create: `frontend/app/(app)/layout.tsx`
- Create: `frontend/app/(app)/invest/page.tsx`
- Create: `frontend/components/invest/HoldingsTable.tsx`
- Create: `frontend/components/invest/PortfolioHero.tsx`
- Create: `frontend/components/invest/PerformanceChart.tsx`
- Create: `frontend/components/ui/HealthBadge.tsx`
- Create: `frontend/components/ui/FlipCard.tsx`
- Create: `frontend/lib/api.ts`

- [ ] **Step 1: Create `frontend/lib/api.ts`**
```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
```

- [ ] **Step 2: Create `frontend/app/(app)/layout.tsx`**
```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--page-bg)" }}>
      <main className="max-w-[440px] mx-auto px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/components/BottomNav.tsx`**
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/pulse",  label: "Pulse",  icon: "📈" },
  { href: "/invest", label: "Invest", icon: "🌱" },
  { href: "/spend",  label: "Spend",  icon: "🏺" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 border-t"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)", zIndex: 50 }}
    >
      {tabs.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className="flex flex-col items-center gap-0.5 min-w-[60px]">
            <span className="text-xl">{t.icon}</span>
            <span
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: active ? "var(--primary)" : "var(--ink-muted)" }}
            >
              {t.label}
            </span>
            {active && (
              <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: "var(--primary)" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Create `frontend/components/ui/FlipCard.tsx`**
```tsx
interface FlipCardProps {
  value: string;
  label: string;
  valueColor?: string;
}

export default function FlipCard({ value, label, valueColor }: FlipCardProps) {
  return (
    <div
      className="flex-1 rounded-xl p-3 flex flex-col items-center gap-1 relative overflow-hidden"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
    >
      <span className="tabular font-semibold text-base" style={{ color: valueColor ?? "var(--ink-primary)" }}>
        {value}
      </span>
      {/* Split-flap divider */}
      <div className="absolute left-0 right-0" style={{ top: "50%", height: "1px", background: "rgba(0,0,0,0.08)" }} />
      <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Create `frontend/components/ui/HealthBadge.tsx`**
```tsx
type HealthState = "green" | "amber" | "red" | "grey";

const colors: Record<HealthState, { bg: string; text: string }> = {
  green: { bg: "var(--green-50)", text: "var(--green-600)" },
  amber: { bg: "var(--amber-50)", text: "var(--amber-600)" },
  red:   { bg: "var(--red-50)",   text: "var(--red-600)"   },
  grey:  { bg: "var(--grey-50)",  text: "var(--grey-600)"  },
};

export default function HealthBadge({ state, label }: { state: HealthState; label: string }) {
  const c = colors[state];
  return (
    <span
      className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}
    >
      ● {label}
    </span>
  );
}
```

- [ ] **Step 6: Create `frontend/components/invest/PortfolioHero.tsx`**
```tsx
import FlipCard from "@/components/ui/FlipCard";
import HealthBadge from "@/components/ui/HealthBadge";

interface PortfolioHeroProps {
  totalValue: number;
  invested: number;
  totalGain: number;
  gainPct: number;
  cagr: number;
}

function formatInr(n: number): string {
  if (Math.abs(n) >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (Math.abs(n) >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function PortfolioHero({ totalValue, invested, totalGain, gainPct, cagr }: PortfolioHeroProps) {
  const healthClass = gainPct >= 10 ? "bg-health-green" : gainPct >= 0 ? "bg-health-grey" : "bg-health-red";
  const gainColor = totalGain >= 0 ? "var(--gain)" : "var(--loss)";
  const sign = totalGain >= 0 ? "+" : "";

  return (
    <div className={`rounded-2xl p-5 mt-4 ${healthClass}`}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          Portfolio Value
        </span>
        <HealthBadge state={gainPct >= 0 ? "green" : "red"} label={gainPct >= 0 ? "Growing" : "Down"} />
      </div>
      <p className="font-display font-bold text-3xl tabular" style={{ color: "var(--ink-primary)" }}>
        {formatInr(totalValue)}
      </p>
      <p className="text-lg font-display font-semibold tabular mt-0.5" style={{ color: gainColor }}>
        {sign}{formatInr(totalGain)} ({sign}{gainPct.toFixed(1)}%)
      </p>
      {/* Flip-card divider */}
      <div className="h-px my-3" style={{ background: "rgba(0,0,0,0.08)" }} />
      <div className="flex gap-2">
        <FlipCard value={formatInr(invested)} label="Invested" />
        <FlipCard value={`${cagr.toFixed(1)}%`} label="CAGR" valueColor={cagr >= 0 ? "var(--gain)" : "var(--loss)"} />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `frontend/components/invest/HoldingsTable.tsx`**
```tsx
"use client";
import { useState } from "react";

interface Holding {
  symbol: string;
  name?: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
}

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const [sort, setSort] = useState<"value" | "gain">("value");
  const sorted = [...holdings].sort((a, b) =>
    sort === "value" ? b.currentValue - a.currentValue : b.gainLossPct - a.gainLossPct
  );

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm" style={{ color: "var(--ink-secondary)" }}>
          Holdings ({holdings.length})
        </h2>
        <div className="flex gap-1">
          {(["value", "gain"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full"
              style={{
                background: sort === s ? "var(--primary)" : "var(--grey-50)",
                color: sort === s ? "white" : "var(--ink-muted)",
              }}
            >
              {s === "value" ? "Value" : "Returns"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        {sorted.map((h) => {
          const isGain = h.gainLoss >= 0;
          const sign = isGain ? "+" : "";
          return (
            <div
              key={h.symbol}
              className="flex items-center py-3 px-4 rounded-xl"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              {/* Logo circle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shrink-0"
                style={{ background: "var(--primary)" }}
              >
                {h.symbol.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: "var(--ink-primary)" }}>{h.symbol}</p>
                <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  {h.qty} × ₹{h.avgPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="tabular font-semibold text-sm" style={{ color: "var(--ink-primary)" }}>
                  ₹{h.currentValue.toLocaleString("en-IN")}
                </p>
                <p className="tabular text-xs font-semibold" style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}>
                  {sign}{h.gainLossPct.toFixed(1)}% {isGain ? "↑" : "↓"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create `frontend/app/(app)/invest/page.tsx`**
```tsx
import { auth } from "@/auth";
import { apiFetch } from "@/lib/api";
import PortfolioHero from "@/components/invest/PortfolioHero";
import HoldingsTable from "@/components/invest/HoldingsTable";
import Link from "next/link";

interface DashboardData {
  metrics: {
    total_value: number;
    invested_amount: number;
    total_gain_loss: number;
    total_gain_loss_pct: number;
    cagr: number;
  };
  holdings: Array<{
    symbol: string;
    qty: number;
    avg_price: number;
    current_price: number;
    current_value: number;
    gain_loss: number;
    gain_loss_pct: number;
  }>;
  portfolio_status: string;
}

export default async function InvestPage() {
  const session = await auth();
  const token = (session as any)?.accessToken ?? "";

  let data: DashboardData | null = null;
  let error: string | null = null;

  try {
    data = await apiFetch<DashboardData>("/api/dashboard/analytics", token);
  } catch (e: any) {
    error = e.message;
  }

  if (data?.portfolio_status === "not_found") {
    return (
      <div className="mt-8 text-center">
        <p className="font-display text-xl font-bold mb-2" style={{ color: "var(--ink-primary)" }}>
          No portfolio yet
        </p>
        <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
          Upload your Zerodha Excel to get started.
        </p>
        <Link
          href="/invest/upload"
          className="inline-block px-5 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--primary)" }}
        >
          Upload Portfolio
        </Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-8 p-4 rounded-xl" style={{ background: "var(--red-50)", color: "var(--red-600)" }}>
        <p className="font-semibold text-sm">Could not load portfolio</p>
        <p className="text-xs mt-1">{error ?? "Unknown error"}</p>
      </div>
    );
  }

  const m = data.metrics;
  const holdings = data.holdings.map((h) => ({
    symbol: h.symbol,
    qty: h.qty,
    avgPrice: h.avg_price,
    currentPrice: h.current_price,
    currentValue: h.current_value,
    gainLoss: h.gain_loss,
    gainLossPct: h.gain_loss_pct,
  }));

  return (
    <>
      <PortfolioHero
        totalValue={m.total_value}
        invested={m.invested_amount}
        totalGain={m.total_gain_loss}
        gainPct={m.total_gain_loss_pct}
        cagr={m.cagr}
      />
      <HoldingsTable holdings={holdings} />
    </>
  );
}
```

- [ ] **Step 9: Verify in browser**
```bash
npm run dev
# Login with Google → visit /invest
# Should show portfolio data (or empty state if no portfolio uploaded)
```

- [ ] **Step 10: Commit**
```bash
git add frontend/app/ frontend/components/ frontend/lib/
git commit -m "feat: port invest screens to Next.js App Router with Gullak design system"
```

---

### Task 8: Update vercel.json for Next.js

**Files:**
- Modify: `frontend/vercel.json`

- [ ] **Step 1: Replace `frontend/vercel.json`**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

- [ ] **Step 2: Add Vercel environment variables**

In Vercel dashboard → Project Settings → Environment Variables, add:
```
GOOGLE_CLIENT_ID          = <from Google Console>
GOOGLE_CLIENT_SECRET      = <from Google Console>
NEXTAUTH_SECRET           = <openssl rand -base64 32>
NEXTAUTH_URL              = https://piaso-ai.vercel.app
POSTGRES_URL              = <already set — Neon>
```

- [ ] **Step 3: Commit + deploy**
```bash
git add frontend/vercel.json
git commit -m "chore: update vercel.json for Next.js framework"
git push origin main
```
Expected: Vercel redeploys automatically. Visit https://piaso-ai.vercel.app — Google login should work.

---

## PHASE 2: Gullak Merge — Spend Analytics

**Deployable checkpoint:** `/spend` tab live with real bank statement upload, transaction storage in Neon, salary cycle config. L0→L3 information architecture.

---

### Task 9: Backend — spend routes + statement parser

**Files:**
- Create: `backend/utils/statement_parser.py`
- Create: `backend/api/routes_spend.py`
- Modify: `frontend/api/index.py`

- [ ] **Step 1: Add parser dependencies**

Add to `frontend/api/requirements.txt`:
```
pdfplumber>=0.10.0
openpyxl>=3.1.0
```

- [ ] **Step 2: Write failing parser test**

Create `backend/tests/test_statement_parser.py`:
```python
import pytest
from backend.utils.statement_parser import classify_transaction, parse_description


def test_classify_emi_as_committed():
    assert classify_transaction("HDFC BANK EMI 5000") == "committed"


def test_classify_sip_as_investment():
    assert classify_transaction("SIP MIRAE ASSET") == "investment"


def test_classify_salary_as_income():
    assert classify_transaction("SALARY CREDIT") == "income"


def test_classify_amazon_as_discretionary():
    assert classify_transaction("Amazon Pay") == "discretionary"


def test_parse_description_extracts_merchant():
    result = parse_description("UPI/123456/Amazon Pay/merchant@okhdfc")
    assert "Amazon" in result
```

- [ ] **Step 3: Run to verify failure**
```bash
pytest backend/tests/test_statement_parser.py -v
```
Expected: `ImportError` — module not found yet.

- [ ] **Step 4: Create `backend/utils/statement_parser.py`**
```python
"""
Bank statement parser for Indian banks (HDFC, ICICI, SBI, Axis, Kotak).
Supports PDF (via pdfplumber) and Excel/CSV.
"""
import re
import logging
from pathlib import Path
import pandas as pd

logger = logging.getLogger(__name__)

# Keyword rules for transaction classification
_RULES = {
    "income":      [r"salary", r"credit.*sal", r"payroll", r"dividend", r"interest credited"],
    "investment":  [r"\bsip\b", r"mutual fund", r"groww", r"zerodha", r"kite", r"neft.*mf"],
    "committed":   [r"\bemi\b", r"loan.*debit", r"insurance", r"\brent\b", r"electricity",
                    r"gas bill", r"broadband", r"school fee", r"neft.*loan"],
    "discretionary": [],  # default fallback
}


def classify_transaction(description: str) -> str:
    """Return transaction type: income | investment | committed | discretionary."""
    desc = description.lower()
    for tx_type, patterns in _RULES.items():
        if any(re.search(p, desc) for p in patterns):
            return tx_type
    return "discretionary"


def parse_description(raw: str) -> str:
    """Clean UPI/NEFT noise from description."""
    # Remove UPI reference numbers
    raw = re.sub(r"UPI/\d+/", "", raw)
    raw = re.sub(r"/[A-Z0-9@.]+$", "", raw)
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw or raw


def _detect_columns(df: pd.DataFrame) -> dict[str, str | None]:
    """Heuristically map DataFrame columns to: date, description, debit, credit, balance."""
    cols = {c.lower().strip(): c for c in df.columns}
    mapping = {}
    for key, aliases in {
        "date": ["date", "txn date", "transaction date", "value date"],
        "description": ["description", "particulars", "narration", "details", "remarks"],
        "debit": ["debit", "withdrawal", "dr", "debit amount"],
        "credit": ["credit", "deposit", "cr", "credit amount"],
        "amount": ["amount"],
    }.items():
        for alias in aliases:
            if alias in cols:
                mapping[key] = cols[alias]
                break
        else:
            mapping[key] = None
    return mapping


def parse_excel_statement(file_bytes: bytes, filename: str) -> list[dict]:
    """Parse Excel or CSV bank statement. Returns list of transaction dicts."""
    try:
        if filename.lower().endswith(".csv"):
            df = pd.read_csv(pd.io.common.BytesIO(file_bytes), on_bad_lines="skip")
        else:
            df = pd.read_excel(pd.io.common.BytesIO(file_bytes), engine="openpyxl")

        df.columns = [str(c).strip() for c in df.columns]
        m = _detect_columns(df)
        if not m.get("date") or not m.get("description"):
            logger.warning("Could not detect required columns in statement")
            return []

        transactions = []
        for _, row in df.iterrows():
            raw_desc = str(row.get(m["description"], ""))
            if not raw_desc or raw_desc == "nan":
                continue

            # Determine amount (prefer separate debit/credit columns)
            amount = 0.0
            if m.get("debit") and m.get("credit"):
                debit = _to_float(row.get(m["debit"]))
                credit = _to_float(row.get(m["credit"]))
                amount = credit - debit  # positive = money in
            elif m.get("amount"):
                amount = _to_float(row.get(m["amount"]))

            if amount == 0:
                continue

            desc = parse_description(raw_desc)
            transactions.append({
                "date": str(row.get(m["date"], ""))[:10],
                "description": desc,
                "amount": round(amount, 2),
                "transaction_type": classify_transaction(raw_desc),
                "confidence": "high",
                "raw_text": raw_desc,
            })
        return transactions
    except Exception as e:
        logger.error(f"Excel parse error: {e}")
        return []


def parse_pdf_statement(file_bytes: bytes) -> list[dict]:
    """Parse PDF bank statement using pdfplumber."""
    try:
        import pdfplumber
        import io
        transactions = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                    headers = [str(c).lower().strip() if c else "" for c in table[0]]
                    m = _detect_columns_from_list(headers)
                    for row in table[1:]:
                        if not row or len(row) < 3:
                            continue
                        desc_idx = m.get("description")
                        date_idx = m.get("date")
                        if desc_idx is None or date_idx is None:
                            continue
                        raw_desc = str(row[desc_idx] or "").strip()
                        if not raw_desc:
                            continue
                        debit = _to_float(row[m["debit"]] if m.get("debit") is not None else 0)
                        credit = _to_float(row[m["credit"]] if m.get("credit") is not None else 0)
                        amount = credit - debit
                        if amount == 0:
                            continue
                        transactions.append({
                            "date": str(row[date_idx] or "")[:10],
                            "description": parse_description(raw_desc),
                            "amount": round(amount, 2),
                            "transaction_type": classify_transaction(raw_desc),
                            "confidence": "medium",
                            "raw_text": raw_desc,
                        })
        return transactions
    except Exception as e:
        logger.error(f"PDF parse error: {e}")
        return []


def _detect_columns_from_list(headers: list[str]) -> dict[str, int | None]:
    aliases = {
        "date": ["date", "txn date", "transaction date", "value date"],
        "description": ["description", "particulars", "narration", "details"],
        "debit": ["debit", "withdrawal", "dr"],
        "credit": ["credit", "deposit", "cr"],
    }
    result = {}
    for key, names in aliases.items():
        result[key] = next((i for i, h in enumerate(headers) if any(n in h for n in names)), None)
    return result


def _to_float(val) -> float:
    if val is None:
        return 0.0
    try:
        return float(str(val).replace(",", "").replace("₹", "").strip() or 0)
    except (ValueError, TypeError):
        return 0.0
```

- [ ] **Step 5: Run tests**
```bash
pytest backend/tests/test_statement_parser.py -v
```
Expected: all 5 tests `PASSED`.

- [ ] **Step 6: Add Neon transactions table migration**

Run in Neon SQL editor:
```sql
CREATE TABLE IF NOT EXISTS transactions (
    id               SERIAL PRIMARY KEY,
    user_id          TEXT NOT NULL,
    date             DATE NOT NULL,
    description      TEXT NOT NULL,
    amount           NUMERIC(12,2) NOT NULL,
    category         TEXT,
    transaction_type TEXT DEFAULT 'discretionary',
    confidence       TEXT DEFAULT 'high',
    source           TEXT DEFAULT 'upload',
    source_file      TEXT,
    raw_text         TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, date DESC);

CREATE TABLE IF NOT EXISTS salary_cycles (
    id             SERIAL PRIMARY KEY,
    user_id        TEXT NOT NULL UNIQUE,
    salary_amount  NUMERIC(12,2),
    salary_day     INTEGER DEFAULT 1,
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] **Step 7: Create `backend/api/routes_spend.py`**
```python
import os
import json
import logging
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from backend.api.routes_portfolio import get_user_id_from_token
from backend.utils.statement_parser import parse_excel_statement, parse_pdf_statement
from backend.utils.db import fetchall, execute

router = APIRouter(prefix="/api/spend", tags=["spend"])
logger = logging.getLogger(__name__)


class SalaryCycleConfig(BaseModel):
    salary_amount: float
    salary_day: int = 1


class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    transaction_type: Optional[str] = None


@router.post("/upload-statement")
async def upload_statement(
    file: UploadFile = File(...),
    user_id: str = Depends(get_user_id_from_token),
):
    content = await file.read()
    filename = file.filename or ""
    if filename.lower().endswith(".pdf"):
        transactions = parse_pdf_statement(content)
    else:
        transactions = parse_excel_statement(content, filename)

    if not transactions:
        raise HTTPException(status_code=422, detail="Could not parse any transactions from file")

    inserted = 0
    for tx in transactions:
        try:
            execute(
                """INSERT INTO transactions (user_id, date, description, amount, transaction_type, confidence, source, source_file, raw_text)
                   VALUES (?, ?, ?, ?, ?, ?, 'upload', ?, ?)""",
                (user_id, tx["date"], tx["description"], tx["amount"],
                 tx["transaction_type"], tx["confidence"], filename, tx["raw_text"]),
            )
            inserted += 1
        except Exception as e:
            logger.warning(f"Failed to insert transaction: {e}")

    return {"inserted": inserted, "total_parsed": len(transactions)}


@router.get("/transactions")
async def list_transactions(
    limit: int = 50,
    offset: int = 0,
    tx_type: Optional[str] = None,
    user_id: str = Depends(get_user_id_from_token),
):
    where = "user_id = ?"
    params: list = [user_id]
    if tx_type:
        where += " AND transaction_type = ?"
        params.append(tx_type)
    rows = fetchall(
        None,
        f"SELECT * FROM transactions WHERE {where} ORDER BY date DESC LIMIT ? OFFSET ?",
        (*params, limit, offset),
    )
    return {"transactions": rows, "limit": limit, "offset": offset}


@router.get("/summary")
async def spend_summary(user_id: str = Depends(get_user_id_from_token)):
    # Get salary cycle config
    cycles = fetchall(None, "SELECT * FROM salary_cycles WHERE user_id = ?", (user_id,))
    config = cycles[0] if cycles else {"salary_amount": 0, "salary_day": 1}

    today = date.today()
    salary_day = int(config.get("salary_day", 1))
    salary_amount = float(config.get("salary_amount", 0))

    # Determine cycle start
    if today.day >= salary_day:
        cycle_start = today.replace(day=salary_day)
    else:
        prev_month = (today.replace(day=1) - timedelta(days=1))
        cycle_start = prev_month.replace(day=min(salary_day, prev_month.day))

    rows = fetchall(
        None,
        "SELECT * FROM transactions WHERE user_id = ? AND date >= ? ORDER BY date DESC",
        (user_id, str(cycle_start)),
    )

    income = sum(float(r["amount"]) for r in rows if float(r["amount"]) > 0)
    spent = abs(sum(float(r["amount"]) for r in rows if float(r["amount"]) < 0))
    committed = abs(sum(float(r["amount"]) for r in rows if r["transaction_type"] == "committed" and float(r["amount"]) < 0))
    discretionary = abs(sum(float(r["amount"]) for r in rows if r["transaction_type"] == "discretionary" and float(r["amount"]) < 0))

    balance = (salary_amount or income) - spent
    days_in_cycle = 30
    days_elapsed = (today - cycle_start).days + 1
    days_remaining = max(0, days_in_cycle - days_elapsed)
    daily_burn = spent / max(days_elapsed, 1)
    runway_days = int(balance / daily_burn) if daily_burn > 0 else days_remaining

    pct_spent = (spent / salary_amount * 100) if salary_amount > 0 else 0
    health = "green" if pct_spent < 70 else "amber" if pct_spent < 90 else "red"

    return {
        "health": health,
        "salary_amount": salary_amount,
        "spent": round(spent, 2),
        "committed": round(committed, 2),
        "discretionary": round(discretionary, 2),
        "balance": round(balance, 2),
        "pct_spent": round(pct_spent, 1),
        "runway_days": runway_days,
        "cycle_start": str(cycle_start),
        "days_elapsed": days_elapsed,
        "days_remaining": days_remaining,
    }


@router.post("/salary-cycle")
async def set_salary_cycle(
    config: SalaryCycleConfig,
    user_id: str = Depends(get_user_id_from_token),
):
    execute(
        """INSERT INTO salary_cycles (user_id, salary_amount, salary_day)
           VALUES (?, ?, ?)
           ON CONFLICT (user_id) DO UPDATE SET salary_amount = excluded.salary_amount, salary_day = excluded.salary_day, updated_at = NOW()""",
        (user_id, config.salary_amount, config.salary_day),
    )
    return {"status": "ok"}
```

- [ ] **Step 8: Register spend router in `frontend/api/index.py`**
```python
try:
    from backend.api.routes_spend import router as spend_router
    app.include_router(spend_router)
    logging.info("Spend routes loaded.")
except Exception as e:
    logging.error(f"Could not load spend routes: {e}")
```

- [ ] **Step 9: Run backend tests**
```bash
pytest backend/tests/ -v
```
Expected: all existing tests plus new statement parser tests pass.

- [ ] **Step 10: Commit**
```bash
git add backend/utils/statement_parser.py backend/api/routes_spend.py backend/tests/test_statement_parser.py frontend/api/index.py
git commit -m "feat: add spend routes, bank statement parser (PDF + Excel)"
```

---

### Task 10: Port Gullak spend UI to Next.js

**Files:**
- Create: `frontend/app/(app)/spend/page.tsx`
- Create: `frontend/components/spend/CoinJar.tsx`
- Create: `frontend/components/spend/RunwayHero.tsx`
- Create: `frontend/components/spend/TransactionList.tsx`
- Create: `frontend/components/spend/StatementUpload.tsx`

- [ ] **Step 1: Create `frontend/components/spend/RunwayHero.tsx`**
```tsx
import HealthBadge from "@/components/ui/HealthBadge";
import FlipCard from "@/components/ui/FlipCard";

interface RunwayHeroProps {
  health: "green" | "amber" | "red" | "grey";
  balance: number;
  runwayDays: number;
  pctSpent: number;
  daysElapsed: number;
  cycleDay: number;
}

export default function RunwayHero({ health, balance, runwayDays, pctSpent, daysElapsed, cycleDay }: RunwayHeroProps) {
  const healthClass = `bg-health-${health}`;
  const label = health === "green" ? "On Track" : health === "amber" ? "Watch" : "At Risk";

  return (
    <div className={`rounded-2xl p-5 mt-4 ${healthClass}`}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          This Month
        </span>
        <HealthBadge state={health} label={label} />
      </div>
      <p className="font-display font-bold text-3xl tabular" style={{ color: "var(--ink-primary)" }}>
        ₹{balance.toLocaleString("en-IN")} left
      </p>
      <p className="text-sm mt-1" style={{ color: "var(--ink-secondary)" }}>
        {runwayDays} days of comfortable spending
      </p>
      <div className="h-px my-3" style={{ background: "rgba(0,0,0,0.08)" }} />
      {/* Progress bar */}
      <div className="h-2 rounded-full mb-3" style={{ background: "var(--grey-100)" }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${Math.min(pctSpent, 100)}%`,
            background: health === "green" ? "var(--green-500)" : health === "amber" ? "var(--amber-500)" : "var(--red-500)",
          }}
        />
      </div>
      <div className="flex gap-2">
        <FlipCard value={`Day ${daysElapsed}`} label="Cycle Day" />
        <FlipCard value={`${pctSpent.toFixed(0)}%`} label="Spent" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/components/spend/TransactionList.tsx`**
```tsx
"use client";
import { useState } from "react";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  transaction_type: string;
  confidence: string;
}

const TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  income:        { bg: "var(--green-50)",  text: "var(--green-600)",  label: "SALARY" },
  investment:    { bg: "#DBEAFE",           text: "#2563EB",           label: "SIP" },
  committed:     { bg: "var(--amber-50)",  text: "var(--amber-600)",  label: "EMI" },
  discretionary: { bg: "var(--grey-50)",   text: "var(--grey-600)",   label: "SPEND" },
};

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<string>("all");
  const filters = ["all", "income", "committed", "investment", "discretionary"];
  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.transaction_type === filter);

  return (
    <div className="mt-4">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="shrink-0 text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full"
            style={{
              background: filter === f ? "var(--primary)" : "var(--grey-50)",
              color: filter === f ? "white" : "var(--ink-muted)",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {filtered.map((tx) => {
          const badge = TYPE_BADGE[tx.transaction_type] ?? TYPE_BADGE.discretionary;
          const isCredit = tx.amount > 0;
          return (
            <div
              key={tx.id}
              className="flex items-center py-3 px-4 rounded-xl"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: "var(--ink-primary)" }}>
                  {tx.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: "var(--ink-muted)" }}>{tx.date}</span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
              <p
                className="tabular font-semibold text-sm ml-3"
                style={{ color: isCredit ? "var(--gain)" : "var(--ink-secondary)" }}
              >
                {isCredit ? "+" : "−"}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/components/spend/StatementUpload.tsx`**
```tsx
"use client";
import { useState } from "react";

export default function StatementUpload({ onSuccess }: { onSuccess: () => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/spend/upload-statement", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Upload failed");
      setStatus("done");
      setMessage(`Imported ${data.inserted} transactions`);
      onSuccess();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div className="mt-4">
      <label
        className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
        style={{ borderColor: "var(--border)", background: "var(--card-bg)" }}
      >
        <span className="text-2xl mb-2">📄</span>
        <span className="font-semibold text-sm" style={{ color: "var(--primary)" }}>
          Upload bank statement
        </span>
        <span className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
          PDF or Excel — HDFC, ICICI, SBI, Axis, Kotak
        </span>
        <input type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv" onChange={handleFile} />
      </label>
      {status === "uploading" && (
        <p className="text-sm text-center mt-2" style={{ color: "var(--ink-muted)" }}>Parsing statement…</p>
      )}
      {status === "done" && (
        <p className="text-sm text-center mt-2" style={{ color: "var(--gain)" }}>✓ {message}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-center mt-2" style={{ color: "var(--loss)" }}>✗ {message}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `frontend/app/(app)/spend/page.tsx`**
```tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import RunwayHero from "@/components/spend/RunwayHero";
import TransactionList from "@/components/spend/TransactionList";
import StatementUpload from "@/components/spend/StatementUpload";

interface Summary {
  health: "green" | "amber" | "red" | "grey";
  balance: number;
  runway_days: number;
  pct_spent: number;
  days_elapsed: number;
  salary_day: number;
}

interface Transaction {
  id: number; date: string; description: string;
  amount: number; transaction_type: string; confidence: string;
}

export default function SpendPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<"overview" | "transactions" | "upload">("overview");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        fetch("/api/spend/summary").then((r) => r.json()),
        fetch("/api/spend/transactions?limit=100").then((r) => r.json()),
      ]);
      setSummary(s);
      setTransactions(t.transactions ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="mt-8 text-center text-sm" style={{ color: "var(--ink-muted)" }}>Loading…</div>;
  }

  return (
    <>
      {summary && (
        <RunwayHero
          health={summary.health}
          balance={summary.balance}
          runwayDays={summary.runway_days}
          pctSpent={summary.pct_spent}
          daysElapsed={summary.days_elapsed}
          cycleDay={summary.salary_day ?? 1}
        />
      )}

      {/* Sub-tab navigation */}
      <div className="flex gap-1 mt-4">
        {(["overview", "transactions", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider"
            style={{
              background: tab === t ? "var(--primary)" : "var(--grey-50)",
              color: tab === t ? "white" : "var(--ink-muted)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "transactions" && <TransactionList transactions={transactions} />}
      {tab === "upload" && <StatementUpload onSuccess={load} />}
      {tab === "overview" && transactions.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No transactions yet</p>
          <button
            onClick={() => setTab("upload")}
            className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            Upload bank statement
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 5: Commit**
```bash
git add frontend/app/(app)/spend/ frontend/components/spend/
git commit -m "feat: port Gullak spend UI — runway hero, transaction list, statement upload"
```

---

## PHASE 3: Pulse — Unified L0

**Deployable checkpoint:** `/pulse` is the primary home screen showing net worth + spend health in one hero, with activity feed mixing investments and spend events.

---

### Task 11: Pulse API endpoint

**Files:**
- Create: `backend/api/routes_pulse.py`
- Modify: `frontend/api/index.py`

- [ ] **Step 1: Write failing test**

Create `backend/tests/test_routes_pulse.py`:
```python
def test_pulse_endpoint_returns_required_fields(client):
    from unittest.mock import patch
    mock_portfolio = {"metrics": {"total_value": 1000000, "total_gain_loss_pct": 12.4, "cagr": 8.2}}
    mock_spend = {"health": "green", "balance": 15000, "runway_days": 18, "pct_spent": 45.0}
    with patch("backend.api.routes_pulse.get_portfolio_summary", return_value=mock_portfolio), \
         patch("backend.api.routes_pulse.get_spend_summary", return_value=mock_spend):
        resp = client.get("/api/pulse", headers={"Authorization": "Bearer testtoken"})
    assert resp.status_code == 200
    data = resp.json()
    assert "net_worth" in data
    assert "spend_health" in data
    assert "invest_health" in data
```

- [ ] **Step 2: Create `backend/api/routes_pulse.py`**
```python
from fastapi import APIRouter, Depends
from backend.api.routes_portfolio import get_user_id_from_token, get_portfolio_analytics
from backend.api.routes_spend import get_spend_summary_data

router = APIRouter(prefix="/api", tags=["pulse"])


async def get_portfolio_summary(user_id: str) -> dict:
    try:
        return await get_portfolio_analytics(user_id)
    except Exception:
        return {}


async def get_spend_summary(user_id: str) -> dict:
    try:
        return await get_spend_summary_data(user_id)
    except Exception:
        return {}


@router.get("/pulse")
async def pulse(user_id: str = Depends(get_user_id_from_token)):
    portfolio, spend = await get_portfolio_summary(user_id), await get_spend_summary(user_id)
    metrics = portfolio.get("metrics", {})
    net_worth = metrics.get("total_value", 0)
    invest_gain_pct = metrics.get("total_gain_loss_pct", 0)
    invest_health = "green" if invest_gain_pct >= 5 else "amber" if invest_gain_pct >= 0 else "red"
    # Overall health = worse of invest + spend
    health_rank = {"green": 0, "grey": 1, "amber": 2, "red": 3}
    spend_health = spend.get("health", "grey")
    overall = max(invest_health, spend_health, key=lambda h: health_rank.get(h, 0))
    return {
        "net_worth": net_worth,
        "invest_gain_pct": round(invest_gain_pct, 1),
        "invest_health": invest_health,
        "spend_health": spend_health,
        "spend_balance": spend.get("balance", 0),
        "runway_days": spend.get("runway_days", 0),
        "overall_health": overall,
    }
```

- [ ] **Step 3: Register pulse router in `frontend/api/index.py`**
```python
try:
    from backend.api.routes_pulse import router as pulse_router
    app.include_router(pulse_router)
    logging.info("Pulse routes loaded.")
except Exception as e:
    logging.error(f"Could not load pulse routes: {e}")
```

- [ ] **Step 4: Run tests**
```bash
pytest backend/tests/test_routes_pulse.py -v
```

- [ ] **Step 5: Commit**
```bash
git add backend/api/routes_pulse.py backend/tests/test_routes_pulse.py frontend/api/index.py
git commit -m "feat: add /api/pulse endpoint combining net worth + spend health"
```

---

### Task 12: Pulse home screen

**Files:**
- Create: `frontend/app/(app)/pulse/page.tsx`
- Create: `frontend/components/pulse/NetWorthHero.tsx`
- Create: `frontend/components/pulse/MetricCard.tsx`

- [ ] **Step 1: Create `frontend/components/pulse/MetricCard.tsx`**
```tsx
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  health: "green" | "amber" | "red" | "grey";
  href: string;
}

const healthColors = {
  green: { bg: "var(--green-50)", border: "var(--green-100)", text: "var(--green-600)" },
  amber: { bg: "var(--amber-50)", border: "var(--amber-100)", text: "var(--amber-600)" },
  red:   { bg: "var(--red-50)",   border: "var(--red-100)",   text: "var(--red-600)"   },
  grey:  { bg: "var(--grey-50)",  border: "var(--grey-100)",  text: "var(--grey-600)"  },
};

export default function MetricCard({ title, value, subtext, health, href }: MetricCardProps) {
  const c = healthColors[health];
  return (
    <Link href={href}>
      <div
        className="flex-1 rounded-xl p-4"
        style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--ink-muted)" }}>
          {title}
        </p>
        <p className="font-display font-bold text-lg tabular" style={{ color: "var(--ink-primary)" }}>{value}</p>
        <p className="text-xs mt-0.5 font-semibold" style={{ color: c.text }}>{subtext}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create `frontend/components/pulse/NetWorthHero.tsx`**
```tsx
import HealthBadge from "@/components/ui/HealthBadge";

interface NetWorthHeroProps {
  netWorth: number;
  investGainPct: number;
  health: "green" | "amber" | "red" | "grey";
}

function formatInr(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function NetWorthHero({ netWorth, investGainPct, health }: NetWorthHeroProps) {
  const healthClass = `bg-health-${health}`;
  const sign = investGainPct >= 0 ? "+" : "";
  return (
    <div className={`rounded-2xl p-5 mt-4 ${healthClass}`}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          Net Worth
        </span>
        <HealthBadge state={health} label={health === "green" ? "Healthy" : health === "amber" ? "Watch" : "At Risk"} />
      </div>
      <p className="font-display font-bold text-4xl tabular" style={{ color: "var(--ink-primary)" }}>
        {formatInr(netWorth)}
      </p>
      <p className="text-base font-display font-semibold tabular mt-1" style={{
        color: investGainPct >= 0 ? "var(--gain)" : "var(--loss)"
      }}>
        {sign}{investGainPct.toFixed(1)}% portfolio returns
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/app/(app)/pulse/page.tsx`**
```tsx
import { auth } from "@/auth";
import { apiFetch } from "@/lib/api";
import NetWorthHero from "@/components/pulse/NetWorthHero";
import MetricCard from "@/components/pulse/MetricCard";

interface PulseData {
  net_worth: number;
  invest_gain_pct: number;
  invest_health: "green" | "amber" | "red" | "grey";
  spend_health: "green" | "amber" | "red" | "grey";
  spend_balance: number;
  runway_days: number;
  overall_health: "green" | "amber" | "red" | "grey";
}

function formatInr(n: number): string {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function PulsePage() {
  const session = await auth();
  const token = (session as any)?.accessToken ?? "";

  let data: PulseData | null = null;
  try {
    data = await apiFetch<PulseData>("/api/pulse", token);
  } catch {}

  if (!data) {
    return (
      <div className="mt-8 text-center">
        <p className="font-display text-2xl font-bold" style={{ color: "var(--ink-primary)" }}>
          Welcome to Piaso.ai
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
          Add your portfolio and bank statement to see your financial pulse.
        </p>
      </div>
    );
  }

  return (
    <>
      <NetWorthHero
        netWorth={data.net_worth}
        investGainPct={data.invest_gain_pct}
        health={data.overall_health}
      />
      <div className="flex gap-3 mt-3">
        <MetricCard
          title="Investments"
          value={formatInr(data.net_worth)}
          subtext={`${data.invest_gain_pct >= 0 ? "+" : ""}${data.invest_gain_pct.toFixed(1)}% returns`}
          health={data.invest_health}
          href="/invest"
        />
        <MetricCard
          title="This Month"
          value={formatInr(data.spend_balance)}
          subtext={`${data.runway_days} days left`}
          health={data.spend_health}
          href="/spend"
        />
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify in browser**
```bash
npm run dev
# Login → lands on /pulse
# Should show net worth hero + two metric cards (invest + spend)
# Each card taps through to /invest and /spend
```

- [ ] **Step 5: Commit and push**
```bash
git add frontend/app/(app)/pulse/ frontend/components/pulse/
git commit -m "feat: add Pulse L0 home screen — unified net worth + spend hero"
git push origin main
```

---

## Post-Plan Checklist

- [ ] Set Vercel env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `POSTGRES_URL`
- [ ] Run Neon SQL migrations (Tasks 3, 5, 9) before first deploy
- [ ] Remove `stock-nse-india/` from monorepo workspaces in root `package.json` once NSE routes verified
- [ ] Delete `auth-server/` once Google auth verified in prod
- [ ] Update root `package.json` workspaces: remove `kite-mcp-server` (not in repo), add `spend-analytics` reference if needed

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |

**VERDICT:** NO REVIEWS YET — run `/autoplan` for full review pipeline.

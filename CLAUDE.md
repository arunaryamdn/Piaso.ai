# Piaso.ai — Claude Code Instructions

## What this project is
Mobile-first personal wealth tracker for Indian users. Two features merged into one app:
- **Invest** (originally Paiso.ai): Zerodha portfolio analytics, NSE prices, AI recommendations
- **Spend** (originally Gullak): Bank statement upload, salary cycle tracking, spend health

## Repo layout you must know
- `backend/` — Python business logic (FastAPI routes, parsers, DB utils). **Edit this for all API logic.**
- `frontend/` — Next.js 16 app. **Vercel Root Directory is `frontend/`, not repo root.**
- `frontend/api/index.py` — Vercel serverless entry point. Imports from `backend/` via `sys.path` manipulation. **Do not add business logic here.**
- `frontend/api/requirements.txt` — Python deps for Vercel. **Add any new Python package here too.**

## Running locally
Always run commands from **inside WSL bash**, never from Windows PowerShell.

```bash
# Backend (Terminal 1)
cd ~/projects/Piaso.ai/frontend
source .venv/bin/activate
uvicorn api.index:app --reload --port 5000

# Frontend (Terminal 2)
cd ~/projects/Piaso.ai/frontend
npm run dev
```

If `.venv` doesn't exist: `python3 -m venv .venv && source .venv/bin/activate && pip install -r api/requirements.txt`

## Auth pattern
- **Google OAuth** via Auth.js v5 (`frontend/auth.ts`)
- **Backend JWT**: Auth.js `session` callback mints a HS256 JWT (signed with `JWT_SECRET`) as `session.backendToken`
- All FastAPI routes use `get_user_id_from_token(authorization: str = Header(...))` — they expect `Authorization: Bearer <backendToken>`
- Server Components: call `auth()` → pass `session.backendToken` to `apiFetch()`
- Client Components: call `useSession()` → use `(session as any)?.backendToken`

## DB abstraction
`backend/utils/db.py` provides `fetchall()` and `execute()`. They auto-select Postgres (if `POSTGRES_URL` set) or SQLite. Use `?` as placeholder — it normalises to `%s` for Postgres at runtime.

## Adding a new backend route
1. Create or edit a file in `backend/api/routes_*.py`
2. Register the router in `frontend/api/index.py` with a `try/except` block
3. Add any new pip package to `frontend/api/requirements.txt`

## Adding a new frontend page
- Authenticated pages go under `frontend/app/(app)/` — the layout there adds AppHeader + BottomNav + auth guard
- Unauthenticated pages (landing, login) go directly under `frontend/app/`
- Update `proxy.ts` if the new page needs special auth handling

## Design system rules
- **Colors**: use CSS vars from `globals.css` — `var(--primary)`, `var(--gain)`, `var(--loss)`, `var(--ink-primary)`, etc.
- **Typography**: `font-family: var(--font-fraunces)` for hero amounts, `var(--font-dm-sans)` for body
- **Health states**: `"green" | "amber" | "red" | "grey"` — use `bg-health-{state}` class or `HealthBadge` component
- **Spacing/radius**: use `var(--sp-*)` and `var(--r-*)` tokens — do not hardcode `px` values for these
- **No Tailwind for layout** — all layout uses inline `style={}` with CSS vars. Tailwind is only used for `font-display`, `tabular`, and health gradient classes.

## Do not do
- Do not run npm/pip from Windows PowerShell — always WSL bash
- Do not import from `frontend/api/index.py` — it's an entry point, not a module
- Do not use `session.accessToken` for backend auth — use `session.backendToken`
- Do not add logic to `frontend/api/index.py` — all logic lives in `backend/`
- Do not commit `.venv/`, `__pycache__/`, `.env.local`

## Key env vars
| Var | Where used |
|-----|-----------|
| `AUTH_SECRET` | Auth.js session encryption |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `JWT_SECRET` | Backend JWT signing (must match Python `config.py` default `"changeme"` locally) |
| `POSTGRES_URL` | Neon Postgres (leave empty locally for SQLite) |
| `NEXTAUTH_URL` | Auth.js redirect base URL |
| `NEXT_PUBLIC_APP_URL` | Exposed to client, used for CORS/redirects |

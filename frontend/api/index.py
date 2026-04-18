"""
frontend/api/index.py
Vercel serverless entry point for the Paiso.ai FastAPI backend.
Root Directory is set to `frontend/` in Vercel, so this file lives at
frontend/api/index.py. We go up two levels to reach the repo root so that
`import backend.*` resolves correctly.
"""
import sys
import os

# __file__ = .../frontend/api/index.py
# Go up: api/ -> frontend/ -> repo root (where backend/ lives)
_api_dir = os.path.dirname(os.path.abspath(__file__))       # .../frontend/api
_frontend_dir = os.path.dirname(_api_dir)                   # .../frontend
_repo_root = os.path.dirname(_frontend_dir)                 # repo root
sys.path.insert(0, _repo_root)

# Default DB_PATH to /tmp for serverless (Vercel provides /tmp as writable scratch space)
os.environ.setdefault("DB_PATH", "/tmp/portfolios.db")

import sqlite3
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Paiso.ai API",
    description="Backend API for Paiso.ai: Modern Indian stock market portfolio analytics platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    db_path = os.environ.get("DB_PATH", "/tmp/portfolios.db")
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute(
            """CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            data TEXT NOT NULL,
            filename TEXT,
            filesize INTEGER,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'ready'
        )"""
        )
        for col_def in [
            "ALTER TABLE portfolios ADD COLUMN filename TEXT",
            "ALTER TABLE portfolios ADD COLUMN filesize INTEGER",
            "ALTER TABLE portfolios ADD COLUMN status TEXT DEFAULT 'ready'",
        ]:
            try:
                c.execute(col_def)
            except Exception:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        logging.warning(f"DB init warning: {e}")


init_db()

try:
    from backend.api.routes_portfolio import router as portfolio_router
    app.include_router(portfolio_router)
    logging.info("Portfolio routes loaded successfully.")
except Exception as e:
    logging.error(f"Could not load portfolio routes: {e}")

try:
    from backend.api.routes_nse import router as nse_router
    app.include_router(nse_router)
    logging.info("NSE routes loaded successfully.")
except Exception as e:
    logging.error(f"Could not load NSE routes: {e}")

try:
    from backend.api.routes_spend import router as spend_router
    app.include_router(spend_router)
    logging.info("Spend routes loaded.")
except Exception as e:
    logging.error(f"Could not load spend routes: {e}")

try:
    from backend.tests.bug import router as bug_router
    app.include_router(bug_router)
except Exception:
    pass

# Mangum adapter — turns ASGI app into a Lambda/Vercel handler
handler = Mangum(app, lifespan="off")

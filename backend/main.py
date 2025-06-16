"""
main.py
Paiso.ai backend API entry point. Handles portfolio upload, analytics, and user-specific data storage.
"""

import os
import certifi
import numpy as np
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes_portfolio import router as portfolio_router
from backend.config import DB_PATH, LOG_PREFIX
import sqlite3
from backend.tests.bug import router as bug_router

logging.basicConfig(level=logging.DEBUG)

app = FastAPI(
    title="Paiso.ai API",
    description="Backend API for Paiso.ai: Modern Indian stock market portfolio analytics platform.",
    version="1.0.0"
)

# CORS middleware must be set up before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB Migration ---
def init_db():
    """Initialize the SQLite database and create tables if needed."""
    logging.debug(f"{LOG_PREFIX} Initializing database at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS portfolios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        filename TEXT,
        filesize INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT "ready" -- new status column
    )''')
    # Migration: add filename, filesize, and status columns if missing
    try:
        c.execute('ALTER TABLE portfolios ADD COLUMN filename TEXT')
    except Exception:
        pass
    try:
        c.execute('ALTER TABLE portfolios ADD COLUMN filesize INTEGER')
    except Exception:
        pass
    try:
        c.execute('ALTER TABLE portfolios ADD COLUMN status TEXT DEFAULT "ready"')
    except Exception:
        pass
    conn.commit()
    conn.close()
init_db()

# Include the modularized router
app.include_router(portfolio_router)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
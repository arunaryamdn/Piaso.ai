import os
import sqlite3

try:
    import psycopg2
    import psycopg2.extras
    _PSYCOPG2_AVAILABLE = True
except ImportError:
    _PSYCOPG2_AVAILABLE = False


def get_connection():
    """Return (connection, dialect) where dialect is 'postgres' or 'sqlite'."""
    db_url = os.environ.get("POSTGRES_URL")
    if db_url and _PSYCOPG2_AVAILABLE:
        conn = psycopg2.connect(db_url, sslmode="require")
        return conn, "postgres"
    db_path = os.environ.get("DB_PATH", "./portfolios.db")
    return sqlite3.connect(db_path), "sqlite"


def fetchall(_, query: str, params=()) -> list[dict]:
    """Execute SELECT query and return list of dicts (works for both Postgres and SQLite)."""
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
    """Execute a write query (INSERT / UPDATE / DELETE)."""
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

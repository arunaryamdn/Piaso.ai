import asyncio
import aiosqlite
from fastapi import APIRouter
router = APIRouter()

DB_PATH = './portfolios.db'
@router.get("/api/debug/db")
def debug_db(user_id: int):
    import sqlite3
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute('SELECT data, uploaded_at FROM portfolios WHERE user_id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    return {"row": row}
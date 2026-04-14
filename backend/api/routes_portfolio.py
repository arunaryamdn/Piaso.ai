from fastapi import APIRouter, Request, Response, Depends, Header, Body, File, UploadFile, HTTPException
import pandas as pd
import numpy as np
import threading
import json
import sqlite3
import logging
from typing import List, Dict, Any
from backend.utils.portfolio import (
    fetch_realtime_prices,
    get_historical_performance,
    create_risk_profile,
    get_news,
    get_sector_analysis,
    get_portfolio_metrics,
    preprocess_portfolio,
)
from backend.config import (
    MSG_NO_PORTFOLIO, MSG_UPLOAD_SUCCESS, MSG_UPLOAD_FAIL, MSG_PORTFOLIO_DELETED,
    MSG_INVALID_TOKEN, MSG_INVALID_HEADER, MSG_MISSING_TOKEN, MSG_AUTH_REQUIRED, MSG_INTERNAL_ERROR,
    MSG_MCP_NO_MESSAGE, MSG_MCP_NO_STDIN, MSG_MCP_NO_RESPONSE, MSG_MCP_INVALID_JSON, MSG_MCP_EXCHANGE_TOKEN_FAIL, MSG_MCP_MISSING_REQUEST_TOKEN,
    MSG_OPERATION_SUCCESS, MSG_OPERATION_FAIL,
    DB_PATH, JWT_SECRET, LOG_PREFIX
)
from backend.models.portfolio import PortfolioUpload, PortfolioHolding, PortfolioMetrics
import jwt
import requests
import hashlib
import os
import shutil
from io import BytesIO
import aiosqlite
import asyncio
from datetime import datetime
from zoneinfo import ZoneInfo
import re

router = APIRouter()

API_KEY = "laql5ne82n78cuip"
API_SECRET = "lebeha15pmvtnl6dj05knc2be59tv78d"
GO_PATH = shutil.which("go") or r"C:\Go\bin\go.exe"

# MCP bridge setup (from mcp_bridge.py) - optional, fails gracefully in serverless environments
mcp_proc = None
response_buffer = []
try:
    if GO_PATH and os.path.exists(GO_PATH):
        mcp_cwd = os.environ.get(
            "MCP_SERVER_PATH",
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "kite-mcp-server")
        )
        if os.path.isdir(mcp_cwd):
            import subprocess
            mcp_proc = subprocess.Popen(
                [GO_PATH, "run", "main.go"],
                cwd=mcp_cwd,
                env={**os.environ, "APP_MODE": "stdio", "KITE_API_KEY": API_KEY, "KITE_API_SECRET": API_SECRET},
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            def read_stdout():
                while True:
                    if mcp_proc and mcp_proc.stdout is not None:
                        line = mcp_proc.stdout.readline()
                        if line:
                            response_buffer.append(line.strip())
            def read_stderr():
                while True:
                    if mcp_proc and mcp_proc.stderr is not None:
                        line = mcp_proc.stderr.readline()
                        if line:
                            print("MCP STDERR:", line.strip())
            threading.Thread(target=read_stdout, daemon=True).start()
            threading.Thread(target=read_stderr, daemon=True).start()
except Exception as _mcp_err:
    logging.warning(f"MCP bridge could not start (non-critical): {_mcp_err}")

# --- JWT Helper ---
def get_user_id_from_token(authorization: str = Header(...)):
    if not authorization.startswith('Bearer '):
        logging.error(f"{LOG_PREFIX} {MSG_INVALID_HEADER}")
        raise HTTPException(status_code=401, detail=MSG_INVALID_HEADER)
    token = authorization.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload['id']
    except Exception:
        logging.error(f"{LOG_PREFIX} {MSG_INVALID_TOKEN}")
        raise HTTPException(status_code=401, detail=MSG_INVALID_TOKEN)

# --- Portfolio Endpoints ---
REQUIRED_COLUMNS = [
    'symbol',
    'quantity available',
    'average price',
    'previous closing price',
]
MAX_UPLOAD_SIZE = 2 * 1024 * 1024  # 2MB
MAX_DAYS = 3650  # 10 years

def process_portfolio(user_id, df):
    try:
        if 'ticker' not in df.columns:
            if 'stock symbol' in df.columns:
                df['ticker'] = df['stock symbol']
            elif 'symbol' in df.columns:
                df['ticker'] = df['symbol']
            else:
                raise Exception("No 'ticker', 'stock symbol', or 'symbol' column found in uploaded file.")
        prices_df = fetch_realtime_prices(df)
        prices_df = prices_df.rename(columns={
            'Ticker': 'ticker',
            'Live_Price': 'live_price',
            'Status': 'status',
            'Source': 'source',
            'Error': 'error'
        })
        merge_cols = [col for col in ['ticker', 'live_price', 'status', 'source', 'error'] if col in prices_df.columns]
        df = pd.merge(
            df,
            prices_df[merge_cols],
            on='ticker',
            how='left'
        )
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('UPDATE portfolios SET data = ?, status = ? WHERE user_id = ?',
                  (df.to_json(orient='records'), 'ready', user_id))
        conn.commit()
        conn.close()
        logging.info(f"{LOG_PREFIX} Portfolio processing complete for user_id={user_id}")
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Portfolio processing failed for user_id={user_id}: {e}")
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('UPDATE portfolios SET status = ? WHERE user_id = ?', ('failed', user_id))
        conn.commit()
        conn.close()

@router.post('/api/upload-portfolio')
async def upload_portfolio(file: UploadFile = File(...), user_id: int = Depends(get_user_id_from_token)):
    logging.debug(f"{LOG_PREFIX} Received upload-portfolio request for user_id={user_id}")
    if not file.filename or not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        logging.warning(f"{LOG_PREFIX} Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Only .xlsx or .xls files are allowed.")
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        logging.warning(f"{LOG_PREFIX} File too large: {file.filename}, size={len(contents)} bytes")
        raise HTTPException(status_code=400, detail="File too large. Maximum allowed size is 2MB.")
    try:
        df = pd.read_excel(BytesIO(contents))
        df.columns = [col.strip().lower() for col in df.columns]
        missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing:
            logging.warning(f"{LOG_PREFIX} Missing required columns: {missing}")
            raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")
        df = df.rename(columns={
            'symbol': 'stock symbol',
            'quantity available': 'quantity',
            'average price': 'average price',
            'previous closing price': 'previous closing price',
        })
        if 'date of purchase' not in df.columns:
            df['date of purchase'] = '2023-01-01'
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error reading Excel file: {e}")
        raise HTTPException(status_code=400, detail="Invalid Excel file. Please check your file format.")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('DELETE FROM portfolios WHERE user_id = ?', (user_id,))
        # Store uploaded_at in IST
        uploaded_at = datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()
        c.execute('INSERT INTO portfolios (user_id, data, filename, filesize, status, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)',
                  (user_id, '[]', file.filename, len(contents), 'processing', uploaded_at))
        conn.commit()
        conn.close()
        threading.Thread(target=process_portfolio, args=(user_id, df)).start()
        preview = df.head().replace([np.inf, -np.inf], np.nan).fillna(0).to_dict(orient="records")
        logging.info(f"{LOG_PREFIX} Portfolio uploaded and processing started for user_id={user_id}")
        return {"preview": preview, "message": MSG_UPLOAD_SUCCESS}
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Upload failed for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_UPLOAD_FAIL)

@router.get('/api/portfolio')
def get_portfolio(user_id: int = Depends(get_user_id_from_token)):
    logging.debug(f"{LOG_PREFIX} Fetching portfolio for user_id={user_id}")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT data FROM portfolios WHERE user_id = ?', (user_id,))
        row = c.fetchone()
        conn.close()
        if not row or not row[0]:
            logging.warning(f"{LOG_PREFIX} {MSG_NO_PORTFOLIO} for user_id={user_id}")
            raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
        try:
            data = json.loads(row[0])
        except Exception as e:
            logging.error(f"{LOG_PREFIX} Malformed portfolio data for user_id={user_id}: {e}")
            raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
        return data
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error fetching portfolio for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@router.delete('/api/portfolio')
def delete_portfolio(user_id: int = Depends(get_user_id_from_token)):
    
    logging.debug(f"{LOG_PREFIX} Deleting portfolio for user_id={user_id}")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('DELETE FROM portfolios WHERE user_id = ?', (user_id,))
        conn.commit()
        conn.close()
        logging.info(f"{LOG_PREFIX} Portfolio deleted for user_id={user_id}")
        return {"message": MSG_PORTFOLIO_DELETED}
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error deleting portfolio for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@router.get("/api/news")
def news():
    logging.debug("Received get-news request")
    logging.error(MSG_NO_PORTFOLIO)
    raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)

# In-memory cache for historical performance
def get_historical_performance_db(user_id: int, days: int):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute('SELECT data, uploaded_at FROM portfolios WHERE user_id = ?', (user_id,))
        row = cursor.fetchone()
    if not row:
        logging.warning(f"{LOG_PREFIX} {MSG_NO_PORTFOLIO} for user_id={user_id}")
        raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
    df = pd.DataFrame(json.loads(row[0]))
    uploaded_at = row[1] if len(row) > 1 else None
    data = get_historical_performance(df, days=days, upload_date=uploaded_at)
    logging.info(f"{LOG_PREFIX} Historical performance calculated for user_id={user_id}")
    return {"upload_date": uploaded_at, "historical": data}

@router.get('/api/historical')
def historical_performance(days: int = 30, user_id: int = Depends(get_user_id_from_token)):
    logging.debug(f"{LOG_PREFIX} Received get-historical request for {days} days, user_id={user_id}")
    if not isinstance(days, int) or days < 1 or days > MAX_DAYS:
        logging.warning(f"{LOG_PREFIX} Invalid days parameter: {days}")
        raise HTTPException(status_code=400, detail=f"Invalid 'days' parameter. Must be an integer between 1 and {MAX_DAYS}.")
    try:
        return get_historical_performance_db(user_id, days)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error calculating historical performance for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@router.get("/api/risk")
def risk_metrics(days: int = 30):
    logging.debug(f"Received get-risk request for {days} days")
    if not isinstance(days, int) or days < 1 or days > MAX_DAYS:
        logging.warning(f"Invalid days parameter: {days}")
        raise HTTPException(status_code=400, detail=f"Invalid 'days' parameter. Must be an integer between 1 and {MAX_DAYS}.")
    logging.error(MSG_NO_PORTFOLIO)
    raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)

@router.post('/api/zerodha/exchange-token')
async def exchange_token(request: Request):
    data = await request.json()
    request_token = data.get('request_token')
    print("Received request_token:", request_token)
    print("Using API_KEY:", API_KEY)
    print("Using API_SECRET:", API_SECRET)
    if not request_token:
        raise HTTPException(status_code=400, detail=MSG_MCP_MISSING_REQUEST_TOKEN)
    url = 'https://api.kite.trade/session/token'
    raw = API_KEY + request_token + API_SECRET
    checksum = hashlib.sha256(raw.encode('utf-8')).hexdigest()
    payload = {
        'api_key': API_KEY,
        'request_token': request_token,
        'checksum': checksum
    }
    print("Payload to Zerodha:", payload)
    resp = requests.post(url, data=payload)
    print("Zerodha response:", resp.status_code, resp.text)
    if resp.ok:
        return resp.json()
    else:
        raise HTTPException(status_code=400, detail=MSG_MCP_EXCHANGE_TOKEN_FAIL)

@router.post("/api/mcp-chat")
async def mcp_chat(request: Request):
    data = await request.json()
    message = data.get("message")
    method = data.get("method")
    params = data.get("params")
    if not method:
        method = "chat"
        params = {"message": message}
    jsonrpc_obj = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params or {}
    }
    if params and isinstance(params, dict) and "session_id" in params:
        jsonrpc_obj["session_id"] = params["session_id"]
    jsonrpc_msg = json.dumps(jsonrpc_obj)
    print("Sending to MCP:", jsonrpc_msg)  # Debug print
    if mcp_proc.stdin is not None:
        mcp_proc.stdin.write(jsonrpc_msg + "\n")
        mcp_proc.stdin.flush()
    else:
        return {"error": MSG_MCP_NO_STDIN}
    import time
    for _ in range(100):  # Wait up to 5 seconds
        if response_buffer:
            reply = response_buffer.pop(0)
            try:
                return json.loads(reply)
            except Exception:
                return {"error": MSG_MCP_INVALID_JSON, "raw": reply}
        time.sleep(0.05)
    return {"error": MSG_MCP_NO_RESPONSE}

@router.get('/api/profile')
def get_full_profile(request: Request, user_id: int = Depends(get_user_id_from_token)):
    try:
        auth_server_url = os.environ.get('AUTH_SERVER_URL', 'http://localhost:4000/api/user/profile')
        headers = {"Authorization": request.headers.get("authorization")}
        user_resp = requests.get(auth_server_url, headers=headers, timeout=5)
        if user_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to fetch user info from auth-server")
        user_info = user_resp.json()
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT filename, filesize, uploaded_at FROM portfolios WHERE user_id = ?', (user_id,))
        row = c.fetchone()
        conn.close()
        portfolio_file = None
        if row:
            portfolio_file = {"filename": row[0], "filesize": row[1], "uploaded_at": row[2]}
        response = {**user_info, "portfolio_file": portfolio_file}
        return response
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error aggregating profile: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@router.get('/api/portfolio/status')
def get_portfolio_status(user_id: int = Depends(get_user_id_from_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT status FROM portfolios WHERE user_id = ?', (user_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return {'status': 'not_found'}
    return {'status': row[0]}

@router.post('/api/portfolio_table')
def portfolio_table_post(request: Request, user_id: int = Depends(get_user_id_from_token), body: dict = Body(default={})):
    try:
        portfolio = body.get('portfolio')
        if portfolio is not None:
            df = pd.DataFrame(portfolio)
        else:
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('SELECT data FROM portfolios WHERE user_id = ?', (user_id,))
            row = c.fetchone()
            conn.close()
            if not row or not row[0]:
                logging.error(MSG_NO_PORTFOLIO)
                raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
            df = pd.DataFrame(json.loads(row[0]))
        # Fetch latest prices
        df = fetch_realtime_prices(df)
        # Patch: Ensure current_price is set from live_price if present
        if 'live_price' in df.columns and 'current_price' not in df.columns:
            df['current_price'] = df['live_price']
        if 'current_price' in df.columns and 'quantity' in df.columns:
            df['current_value'] = df['quantity'] * df['current_price']
        holdings = []
        for _, row in df.iterrows():
            invested = row.get('quantity', 0) * row.get('average price', 0)
            current_value = row.get('current_value', 0)
            gain_loss = current_value - invested
            gain_loss_percent = (gain_loss / invested * 100) if invested else 0
            holdings.append({
                'symbol': row.get('ticker', ''),
                'name': row.get('ticker', ''),
                'quantity': row.get('quantity', 0),
                'avg_price': row.get('average price', 0),
                'current_price': row.get('current_price', 0),
                'current_value': current_value,
                'gain_loss': gain_loss,
                'gain_loss_percent': gain_loss_percent,
                'sector': row.get('sector', ''),
            })
        return {'holdings': holdings}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error in portfolio_table_post: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

# Core analytics logic, split out for caching
def get_dashboard_analytics(user_id: int):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute('SELECT data FROM portfolios WHERE user_id = ?', (user_id,))
            row = cursor.fetchone()
        if not row or not row[0]:
            logging.warning(f"{LOG_PREFIX} {MSG_NO_PORTFOLIO} for user_id={user_id}")
            raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
        df = pd.DataFrame(json.loads(row[0]))
        df = fetch_realtime_prices(df)
        if 'live_price' in df.columns and 'current_price' not in df.columns:
            df['current_price'] = df['live_price']
        metrics = get_portfolio_metrics(df)
        sector_data = get_sector_analysis(df)
        hist_data = get_historical_performance(df, 90)
        sector = []
        if not sector_data:
            sector_data = get_sector_analysis(df)
        if sector_data:
            for s in sector_data:
                sector.append({
                    'sector': s.get('Sector', s.get('sector', '')),
                    'current_value': s.get('Current_Value', s.get('current_value', 0))
                })
        historical = []
        if hist_data:
            for h in hist_data:
                historical.append({
                    'date': h.get('Date', h.get('date', '')),
                    'portfolio_value': h.get('Portfolio_Value', h.get('portfolio_value', 0))
                })
        holdings = []
        for _, row in df.iterrows():
            invested = row.get('quantity', 0) * row.get('average price', 0)
            current_value = row.get('current_value', 0)
            gain_loss = current_value - invested
            gain_loss_percent = (gain_loss / invested * 100) if invested else 0
            holdings.append({
                'symbol': row.get('ticker', ''),
                'name': row.get('ticker', ''),
                'quantity': row.get('quantity', 0),
                'avg_price': row.get('average price', 0),
                'current_price': row.get('current_price', 0),
                'current_value': current_value,
                'gain_loss': gain_loss,
                'gain_loss_percent': gain_loss_percent,
                'sector': row.get('sector', ''),
            })
        return {
            'metrics': metrics,
            'sector': sector,
            'historical': historical,
            'holdings': holdings,
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error in dashboard analytics for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@router.get('/api/dashboard/analytics')
def get_dashboard_analytics_endpoint(user_id: int = Depends(get_user_id_from_token)):
    return get_dashboard_analytics(user_id) 
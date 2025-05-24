"""
main.py
Paiso.ai backend API entry point. Handles portfolio upload, analytics, and user-specific data storage.
"""

import os
import certifi
import numpy as np
import logging
from fastapi import Request, Response, Depends, Header
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
from utils.portfolio import (
    calculate_portfolio_metrics,
    fetch_realtime_prices,
    get_ai_recommendations,
    get_historical_performance,
    create_risk_profile,
    get_news,
    get_sector_analysis,
)
import hashlib
import subprocess
import threading
import shutil
import json
import sqlite3
import jwt
from config import (
    MSG_NO_PORTFOLIO, MSG_UPLOAD_SUCCESS, MSG_UPLOAD_FAIL, MSG_PORTFOLIO_DELETED,
    MSG_INVALID_TOKEN, MSG_INVALID_HEADER, MSG_MISSING_TOKEN, MSG_AUTH_REQUIRED, MSG_INTERNAL_ERROR,
    MSG_MCP_NO_MESSAGE, MSG_MCP_NO_STDIN, MSG_MCP_NO_RESPONSE, MSG_MCP_INVALID_JSON, MSG_MCP_EXCHANGE_TOKEN_FAIL, MSG_MCP_MISSING_REQUEST_TOKEN,
    MSG_OPERATION_SUCCESS, MSG_OPERATION_FAIL,
    DB_PATH, JWT_SECRET, LOG_PREFIX
)

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

portfolio_df = None  # Global for demo

API_KEY = "laql5ne82n78cuip"
API_SECRET = "lebeha15pmvtnl6dj05knc2be59tv78d"

# MCP bridge setup (from mcp_bridge.py)
print("Go executable found at:", shutil.which("go"))
print("Current working directory:", os.getcwd())
print("Target cwd for Go MCP:", "C:/Users/arung/Paiso.ai/kite-mcp-server")
print("main.go exists:", os.path.exists("C:/Users/arung/Paiso.ai/kite-mcp-server/main.go"))

# Use absolute path to Go if needed
GO_PATH = shutil.which("go") or r"C:\Go\bin\go.exe"

# Start the Go MCP server in stdio mode (only once)
if not hasattr(globals(), 'mcp_proc'):
    mcp_proc = subprocess.Popen(
        [GO_PATH, "run", "main.go"],
        cwd="C:/Users/arung/Paiso.ai/kite-mcp-server",  # Adjust path as needed
        env={**os.environ, "APP_MODE": "stdio", "KITE_API_KEY": API_KEY, "KITE_API_SECRET": API_SECRET},
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    # Thread-safe buffer for responses
    response_buffer = []

    def read_stdout():
        """Read lines from MCP process stdout and append to response buffer."""
        while True:
            if mcp_proc.stdout is not None:
                line = mcp_proc.stdout.readline()
                if line:
                    response_buffer.append(line.strip())

    def read_stderr():
        """Read lines from MCP process stderr and print as error."""
        while True:
            if mcp_proc.stderr is not None:
                line = mcp_proc.stderr.readline()
                if line:
                    print("MCP STDERR:", line.strip())

    threading.Thread(target=read_stdout, daemon=True).start()
    threading.Thread(target=read_stderr, daemon=True).start()

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

# --- JWT Helper ---
def get_user_id_from_token(authorization: str = Header(...)):
    """Extract user_id from JWT token in Authorization header."""
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

def process_portfolio_async(user_id, df):
    try:
        # Ensure 'ticker' column exists
        if 'ticker' not in df.columns:
            if 'stock symbol' in df.columns:
                df['ticker'] = df['stock symbol']
            elif 'symbol' in df.columns:
                df['ticker'] = df['symbol']
            else:
                raise Exception("No 'ticker', 'stock symbol', or 'symbol' column found in uploaded file.")
        # Fetch prices and analytics (simulate processing)
        prices_df = fetch_realtime_prices(df)
        prices_df = prices_df.rename(columns={
            'Ticker': 'ticker',
            'Live_Price': 'live_price',
            'Status': 'status',
            'Source': 'source',
            'Error': 'error'
        })
        # Only merge columns that exist in prices_df
        merge_cols = [col for col in ['ticker', 'live_price', 'status', 'source', 'error'] if col in prices_df.columns]
        df = pd.merge(
            df,
            prices_df[merge_cols],
            on='ticker',
            how='left'
        )
        # Save processed data and set status to 'ready'
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('UPDATE portfolios SET data = ?, status = ? WHERE user_id = ?',
                  (df.to_json(orient='records'), 'ready', user_id))
        conn.commit()
        conn.close()
        logging.info(f"{LOG_PREFIX} Portfolio processing complete for user_id={user_id}")
    except Exception as e:
        # On error, set status to 'failed'
        logging.error(f"{LOG_PREFIX} Portfolio processing failed for user_id={user_id}: {e}")
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('UPDATE portfolios SET status = ? WHERE user_id = ?', ('failed', user_id))
        conn.commit()
        conn.close()

@app.post('/api/upload-portfolio')
async def upload_portfolio(file: UploadFile = File(...), user_id: int = Depends(get_user_id_from_token)):
    """Upload a portfolio Excel file, process it, and store it in SQLite for the user. Accepts user Excel format."""
    logging.debug(f"{LOG_PREFIX} Received upload-portfolio request for user_id={user_id}")
    # --- Validation ---
    # 1. File type
    if not file.filename or not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        logging.warning(f"{LOG_PREFIX} Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Only .xlsx or .xls files are allowed.")
    # 2. File size
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        logging.warning(f"{LOG_PREFIX} File too large: {file.filename}, size={len(contents)} bytes")
        raise HTTPException(status_code=400, detail="File too large. Maximum allowed size is 2MB.")
    # 3. Required columns
    try:
        df = pd.read_excel(BytesIO(contents))
        df.columns = [col.strip().lower() for col in df.columns]
        missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing:
            logging.warning(f"{LOG_PREFIX} Missing required columns: {missing}")
            raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")
        # Rename columns to internal names
        df = df.rename(columns={
            'symbol': 'stock symbol',
            'quantity available': 'quantity',
            'average price': 'average price',
            'previous closing price': 'previous closing price',
        })
        # Add 'date of purchase' if missing, fill with default
        if 'date of purchase' not in df.columns:
            df['date of purchase'] = '2023-01-01'
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error reading Excel file: {e}")
        raise HTTPException(status_code=400, detail="Invalid Excel file. Please check your file format.")
    # --- Store initial record with status 'processing' and empty data ---
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('DELETE FROM portfolios WHERE user_id = ?', (user_id,))  # Only one portfolio per user
        c.execute('INSERT INTO portfolios (user_id, data, filename, filesize, status) VALUES (?, ?, ?, ?, ?)',
                  (user_id, '[]', file.filename, len(contents), 'processing'))
        conn.commit()
        conn.close()
        # Start background processing
        threading.Thread(target=process_portfolio_async, args=(user_id, df)).start()
        preview = df.head().replace([np.inf, -np.inf], np.nan).fillna(0).to_dict(orient="records")
        logging.info(f"{LOG_PREFIX} Portfolio uploaded and processing started for user_id={user_id}")
        return {"preview": preview, "message": MSG_UPLOAD_SUCCESS}
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Upload failed for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_UPLOAD_FAIL)

@app.get('/api/portfolio')
def get_portfolio(user_id: int = Depends(get_user_id_from_token)):
    """Fetch the user's portfolio from SQLite."""
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

@app.delete('/api/portfolio')
def delete_portfolio(user_id: int = Depends(get_user_id_from_token)):
    """Delete the user's portfolio from SQLite."""
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

@app.get('/api/dashboard')
def get_dashboard(user_id: int = Depends(get_user_id_from_token)):
    """Return dashboard analytics for the user's portfolio."""
    logging.debug(f"{LOG_PREFIX} Calculating dashboard metrics for user_id={user_id}")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT data FROM portfolios WHERE user_id = ?', (user_id,))
        row = c.fetchone()
        conn.close()
        if not row:
            logging.warning(f"{LOG_PREFIX} {MSG_NO_PORTFOLIO} for user_id={user_id}")
            raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
        df = pd.DataFrame(json.loads(row[0]))
        metrics = calculate_portfolio_metrics(df)
        logging.info(f"{LOG_PREFIX} Dashboard metrics calculated for user_id={user_id}")
        return metrics
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error calculating dashboard for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@app.get("/api/sector_analysis")
def sector_analysis():
    """Return sector analysis for the current portfolio (demo/global)."""
    logging.debug("Received get-sector_analysis request")
    global portfolio_df
    if portfolio_df is None:
        logging.error(MSG_NO_PORTFOLIO)
        raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
    result = get_sector_analysis(portfolio_df)
    logging.debug(f"Sector analysis result: {result}")
    return result

@app.get("/api/realtime_prices")
def realtime_prices():
    """Return real-time prices for the current portfolio (demo/global)."""
    logging.debug("Received get-realtime_prices request")
    global portfolio_df
    if portfolio_df is None:
        logging.error(MSG_NO_PORTFOLIO)
        raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
    df = fetch_realtime_prices(portfolio_df)
    logging.debug(f"Realtime prices DataFrame: {df.head()}")
    return df.to_dict(orient="records")

@app.get("/api/ai_recommendations")
def ai_recommendations():
    """Return AI recommendations for the current portfolio (demo/global)."""
    logging.debug("Received get-ai_recommendations request")
    global portfolio_df
    if portfolio_df is None:
        logging.error(MSG_NO_PORTFOLIO)
        raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
    result = get_ai_recommendations(portfolio_df)
    logging.debug(f"AI recommendations: {result}")
    return result

@app.get("/api/news")
def news():
    """Return news for the current portfolio (demo/global)."""
    logging.debug("Received get-news request")
    global portfolio_df
    if portfolio_df is None:
        logging.error(MSG_NO_PORTFOLIO)
        raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
    result = get_news(portfolio_df)
    logging.debug(f"News result: {result}")
    return result

@app.get('/api/historical')
def historical_performance(days: int = 30, user_id: int = Depends(get_user_id_from_token)):
    """Return historical performance for the user's portfolio."""
    logging.debug(f"{LOG_PREFIX} Received get-historical request for {days} days, user_id={user_id}")
    # Validate days
    if not isinstance(days, int) or days < 1 or days > MAX_DAYS:
        logging.warning(f"{LOG_PREFIX} Invalid days parameter: {days}")
        raise HTTPException(status_code=400, detail=f"Invalid 'days' parameter. Must be an integer between 1 and {MAX_DAYS}.")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT data FROM portfolios WHERE user_id = ?', (user_id,))
        row = c.fetchone()
        conn.close()
        if not row:
            logging.warning(f"{LOG_PREFIX} {MSG_NO_PORTFOLIO} for user_id={user_id}")
            raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
        df = pd.DataFrame(json.loads(row[0]))
        data = get_historical_performance(df, days=days)
        logging.info(f"{LOG_PREFIX} Historical performance calculated for user_id={user_id}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error calculating historical performance for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@app.get("/api/risk")
def risk_metrics(days: int = 30):
    """Return risk metrics for the current portfolio (demo/global)."""
    logging.debug(f"Received get-risk request for {days} days")
    # Validate days
    if not isinstance(days, int) or days < 1 or days > MAX_DAYS:
        logging.warning(f"Invalid days parameter: {days}")
        raise HTTPException(status_code=400, detail=f"Invalid 'days' parameter. Must be an integer between 1 and {MAX_DAYS}.")
    global portfolio_df
    if portfolio_df is None:
        logging.error(MSG_NO_PORTFOLIO)
        raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
    hist_data = get_historical_performance(portfolio_df, days=days)
    risk = create_risk_profile(portfolio_df, hist_data)
    logging.debug(f"Risk metrics: {risk}")
    return risk

@app.post('/api/zerodha/exchange-token')
async def exchange_token(request: Request):
    """Exchange request_token for access token with Zerodha."""
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

@app.post("/api/mcp-chat")
async def mcp_chat(request: Request):
    """Proxy chat or tool call to MCP Go server via stdio."""
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

@app.get('/api/portfolio/fileinfo')
def get_portfolio_fileinfo(user_id: int = Depends(get_user_id_from_token)):
    """Return portfolio file info (filename, filesize, uploaded_at) for the user."""
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT filename, filesize, uploaded_at FROM portfolios WHERE user_id = ?', (user_id,))
        row = c.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail=MSG_NO_PORTFOLIO)
        return {"filename": row[0], "filesize": row[1], "uploaded_at": row[2]}
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error fetching portfolio file info for user_id={user_id}: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@app.get('/api/profile')
def get_full_profile(request: Request, user_id: int = Depends(get_user_id_from_token)):
    """Aggregate user info from auth-server and portfolio file info."""
    try:
        # Call auth-server for user info
        auth_server_url = os.environ.get('AUTH_SERVER_URL', 'http://localhost:4000/api/user/profile')
        headers = {"Authorization": request.headers.get("authorization")}
        user_resp = requests.get(auth_server_url, headers=headers, timeout=5)
        if user_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Failed to fetch user info from auth-server")
        user_info = user_resp.json()
        # Get portfolio file info
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('SELECT filename, filesize, uploaded_at FROM portfolios WHERE user_id = ?', (user_id,))
        row = c.fetchone()
        conn.close()
        portfolio_file = None
        if row:
            portfolio_file = {"filename": row[0], "filesize": row[1], "uploaded_at": row[2]}
        # Flatten user_info into top-level response
        response = {**user_info, "portfolio_file": portfolio_file}
        return response
    except Exception as e:
        logging.error(f"{LOG_PREFIX} Error aggregating profile: {e}")
        raise HTTPException(status_code=500, detail=MSG_INTERNAL_ERROR)

@app.get('/api/portfolio/status')
def get_portfolio_status(user_id: int = Depends(get_user_id_from_token)):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT status FROM portfolios WHERE user_id = ?', (user_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return {'status': 'not_found'}
    return {'status': row[0]}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
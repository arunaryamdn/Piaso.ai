import pandas as pd
import requests
import logging
from .normalization import normalize_columns
import httpx
import asyncio

def fetch_realtime_prices_async(df: pd.DataFrame) -> pd.DataFrame:
    """Sync: Fetch real-time prices for each ticker in the DataFrame using Node.js API."""
    logging.debug(f"[DEBUG] Input DataFrame tickers: {df['ticker'].tolist() if 'ticker' in df.columns else 'No ticker col'}")
    df = df.copy()
    df = normalize_columns(df)
    logging.debug(f"[DEBUG] Columns after normalization: {df.columns.tolist()}")
    if 'ticker' not in df.columns and 'symbol' in df.columns:
        df = df.rename(columns={'symbol': 'ticker'})
        logging.debug(f"[DEBUG] Columns after renaming symbol to ticker: {df.columns.tolist()}")
    tickers = df['ticker'].astype(str).str.strip().str.upper().unique() if 'ticker' in df.columns else []
    prices = []
    def fetch_price(ticker):
        url = f"http://localhost:3000/api/equity/{ticker}"
        logging.debug(f"[DEBUG] Fetching price for ticker: {ticker} from {url}")
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                price = data.get('priceInfo', {}).get('lastPrice', 0)
                logging.debug(f"[DEBUG] Got price for {ticker}: {price}")
                return {'ticker': ticker, 'live_price': price, 'status': 'ok', 'source': 'node', 'error': ''}
            else:
                logging.warning(f"[DEBUG] Failed to fetch price for {ticker}: {resp.status_code}")
                return {'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'node', 'error': f'status {resp.status_code}'}
        except Exception as e:
            logging.error(f"[DEBUG] Exception fetching price for {ticker}: {e}")
            return {'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'node', 'error': str(e)}
    prices = [fetch_price(ticker) for ticker in tickers]
    prices_df = pd.DataFrame(prices)
    logging.debug(f"[DEBUG] Prices DataFrame:\n{prices_df}")
    if not prices_df.empty:
        df['ticker'] = df['ticker'].astype(str).str.strip().str.upper()
        prices_df['ticker'] = prices_df['ticker'].astype(str).str.strip().str.upper()
        df = pd.merge(df, prices_df, on='ticker', how='left')
        logging.debug(f"[DEBUG] DataFrame after merging prices:\n{df[['ticker', 'live_price', 'current_price']] if 'current_price' in df.columns else df[['ticker', 'live_price']]}")
    else:
        logging.warning("[DEBUG] Prices DataFrame is empty after fetching prices.")
    return df

# Keep the sync version for backward compatibility

def fetch_realtime_prices(df: pd.DataFrame) -> pd.DataFrame:
    """Fetch real-time prices for each ticker in the DataFrame using Node.js API (sync)."""
    logging.debug(f"[DEBUG] Input DataFrame tickers: {df['ticker'].tolist() if 'ticker' in df.columns else 'No ticker col'}")
    df = df.copy()
    # Normalize column names: lowercase and strip spaces
    df = normalize_columns(df)
    logging.debug(f"[DEBUG] Columns after normalization: {df.columns.tolist()}")
    if 'ticker' not in df.columns and 'symbol' in df.columns:
        df = df.rename(columns={'symbol': 'ticker'})
        logging.debug(f"[DEBUG] Columns after renaming symbol to ticker: {df.columns.tolist()}")
    tickers = df['ticker'].astype(str).str.strip().str.upper().unique() if 'ticker' in df.columns else []
    logging.debug(f"[DEBUG] Normalized tickers: {tickers}")
    prices = []
    for ticker in tickers:
        url = f"http://localhost:3000/api/equity/{ticker}"
        logging.debug(f"[DEBUG] Fetching price for ticker: {ticker} from {url}")
        try:
            resp = requests.get(url, timeout=5)
            logging.debug(f"[DEBUG] Response status for {ticker}: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                price = data.get('priceInfo', {}).get('lastPrice', 0)
                logging.debug(f"[DEBUG] Got price for {ticker}: {price}")
                prices.append({'ticker': ticker, 'live_price': price, 'status': 'ok', 'source': 'node', 'error': ''})
            else:
                logging.warning(f"[DEBUG] Failed to fetch price for {ticker}: {resp.status_code}")
                prices.append({'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'node', 'error': f'status {resp.status_code}'})
        except Exception as e:
            logging.error(f"[DEBUG] Exception fetching price for {ticker}: {e}")
            prices.append({'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'node', 'error': str(e)})
    prices_df = pd.DataFrame(prices)
    logging.debug(f"[DEBUG] Prices DataFrame:\n{prices_df}")
    # Merge prices back to original df
    if not prices_df.empty:
        df['ticker'] = df['ticker'].astype(str).str.strip().str.upper()
        prices_df['ticker'] = prices_df['ticker'].astype(str).str.strip().str.upper()
        df = pd.merge(df, prices_df, on='ticker', how='left')
        logging.debug(f"[DEBUG] DataFrame after merging prices:\n{df[['ticker', 'live_price', 'current_price']] if 'current_price' in df.columns else df[['ticker', 'live_price']]}")
    else:
        logging.warning("[DEBUG] Prices DataFrame is empty after fetching prices.")
    return df 
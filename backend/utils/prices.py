import pandas as pd
import logging
from .normalization import normalize_columns
import httpx
import asyncio

def fetch_realtime_prices_async(df: pd.DataFrame) -> pd.DataFrame:
    """Sync: Fetch real-time prices for each ticker in the DataFrame using yfinance."""
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
        logging.debug(f"[DEBUG] Fetching price for ticker: {ticker} via yfinance")
        try:
            from backend.utils.nse_client import get_equity_quote
            data = get_equity_quote(ticker)
            if data:
                return {'ticker': ticker, 'live_price': data['lastPrice'], 'status': 'ok', 'source': 'yfinance', 'error': ''}
            else:
                return {'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'yfinance', 'error': 'not found'}
        except Exception as e:
            logging.error(f"[DEBUG] Exception fetching price for {ticker}: {e}")
            return {'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'yfinance', 'error': str(e)}
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
    """Fetch real-time prices for each ticker in the DataFrame using yfinance (sync)."""
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
        logging.debug(f"[DEBUG] Fetching price for ticker: {ticker} via yfinance")
        try:
            from backend.utils.nse_client import get_equity_quote
            data = get_equity_quote(ticker)
            if data:
                logging.debug(f"[DEBUG] Got price for {ticker}: {data['lastPrice']}")
                prices.append({'ticker': ticker, 'live_price': data['lastPrice'], 'status': 'ok', 'source': 'yfinance', 'error': ''})
            else:
                logging.warning(f"[DEBUG] Symbol not found for {ticker}")
                prices.append({'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'yfinance', 'error': 'not found'})
        except Exception as e:
            logging.error(f"[DEBUG] Exception fetching price for {ticker}: {e}")
            prices.append({'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'yfinance', 'error': str(e)})
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
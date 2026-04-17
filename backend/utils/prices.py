import pandas as pd
import requests
import logging
from .normalization import normalize_columns
from backend.config import NSE_API_BASE


def fetch_realtime_prices(df: pd.DataFrame) -> pd.DataFrame:
    """Fetch real-time prices for each ticker via the NSE API."""
    df = df.copy()
    df = normalize_columns(df)
    if 'ticker' not in df.columns and 'symbol' in df.columns:
        df = df.rename(columns={'symbol': 'ticker'})
    if 'ticker' not in df.columns:
        return df

    tickers = df['ticker'].astype(str).str.strip().str.upper().unique()
    prices = []
    for ticker in tickers:
        symbol = ticker.replace('.NS', '')
        url = f"{NSE_API_BASE}/equity/{symbol}"
        try:
            resp = requests.get(url, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                price = data.get('priceInfo', {}).get('lastPrice', 0)
                prices.append({'ticker': ticker, 'live_price': price, 'status': 'ok', 'source': 'nse', 'error': ''})
            else:
                prices.append({'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'nse', 'error': f'HTTP {resp.status_code}'})
        except Exception as e:
            logging.warning(f"Price fetch failed for {ticker}: {e}")
            prices.append({'ticker': ticker, 'live_price': 0, 'status': 'fail', 'source': 'nse', 'error': str(e)})

    prices_df = pd.DataFrame(prices)
    if not prices_df.empty:
        df['ticker'] = df['ticker'].astype(str).str.strip().str.upper()
        prices_df['ticker'] = prices_df['ticker'].astype(str).str.strip().str.upper()
        df = pd.merge(df, prices_df, on='ticker', how='left')
    return df


# Alias for backward compatibility
fetch_realtime_prices_async = fetch_realtime_prices

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import logging
import asyncio
import httpx
from typing import List, Dict, Any, Sequence, Optional
from backend.config import NSE_API_BASE

IST = ZoneInfo("Asia/Kolkata")


def get_historical_performance(
    df: pd.DataFrame,
    days: int = 30,
    max_workers: int = 3,
    api_timeout: int = 30,
    upload_date: Optional[str] = None,
) -> Sequence[Dict[str, Any]]:
    """Calculate historical portfolio value over a given number of days."""
    start_date = (datetime.now(IST) - timedelta(days=days)).strftime('%Y-%m-%d')
    end_date = datetime.now(IST).strftime('%Y-%m-%d')
    date_range = pd.date_range(start=start_date, end=end_date)
    hist_data = pd.DataFrame(index=date_range)
    hist_data.index.name = 'Date'
    hist_data['Portfolio_Value'] = 0.0

    async def fetch_stock(row, sem):
        ticker = row.get('Ticker') or row.get('ticker')
        quantity = row.get('Quantity', 0) or row.get('quantity', 0)
        if not ticker or quantity == 0:
            return None
        symbol = ticker.replace('.NS', '') if isinstance(ticker, str) and ticker.endswith('.NS') else ticker
        url = f"{NSE_API_BASE}/equity/historical/{symbol}"
        params = {"dateStart": start_date, "dateEnd": end_date}
        async with sem:
            for attempt in range(3):
                try:
                    async with httpx.AsyncClient(timeout=api_timeout) as client:
                        resp = await client.get(url, params=params)
                        if resp.status_code == 200:
                            data = resp.json()
                            closes = {}
                            if isinstance(data, list):
                                for chunk in data:
                                    for d in chunk.get('data', []):
                                        if 'CH_CLOSING_PRICE' in d and 'CH_TIMESTAMP' in d:
                                            closes[d['CH_TIMESTAMP']] = float(d['CH_CLOSING_PRICE'])
                            elif isinstance(data, dict) and 'data' in data:
                                for d in data['data']:
                                    if 'CH_CLOSING_PRICE' in d and 'CH_TIMESTAMP' in d:
                                        closes[d['CH_TIMESTAMP']] = float(d['CH_CLOSING_PRICE'])
                            if closes:
                                price_series = pd.Series(closes)
                                price_series.index = pd.to_datetime(price_series.index)
                                price_series = price_series.reindex(date_range, method='ffill')
                                return price_series * quantity
                except Exception as e:
                    logging.warning(f"Historical fetch failed for {symbol} (attempt {attempt+1}): {e}")
                    if attempt < 2:
                        await asyncio.sleep(2 ** attempt)
        return None

    async def fetch_all():
        sem = asyncio.Semaphore(max_workers)
        tasks = [fetch_stock(row, sem) for _, row in df.iterrows()]
        for stock_values in await asyncio.gather(*tasks, return_exceptions=True):
            if stock_values is not None and not isinstance(stock_values, Exception):
                hist_data['Portfolio_Value'] += stock_values.reindex(hist_data.index).fillna(method='ffill').fillna(0)

    asyncio.run(fetch_all())

    hist_data['Portfolio_Value'] = hist_data['Portfolio_Value'].replace([np.inf, -np.inf], np.nan).fillna(0)

    if upload_date is not None:
        try:
            upload_dt = pd.to_datetime(upload_date)
            after = hist_data.loc[hist_data.index >= upload_dt, 'Portfolio_Value']
            first_nonzero = after[after > 0].iloc[0] if (after > 0).any() else 0.0
            hist_data.loc[hist_data.index < upload_dt, 'Portfolio_Value'] = first_nonzero
        except Exception as e:
            logging.warning(f"Forward-fill before upload_date failed: {e}")

    hist_data = hist_data.reset_index()
    hist_data['Date'] = hist_data['Date'].dt.strftime('%Y-%m-%d')
    return hist_data.to_dict(orient='records')  # type: ignore

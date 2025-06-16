import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import logging
import asyncio
import httpx
from typing import List, Dict, Any, Sequence, Optional

IST = ZoneInfo("Asia/Kolkata")

def get_historical_performance(df: pd.DataFrame, days: int = 30, max_workers: int = 3, api_timeout: int = 30, upload_date: Optional[str] = None) -> Sequence[Dict[str, Any]]:
    """Calculate historical performance for the portfolio over a given number of days (async, concurrent)."""
    start_date = (datetime.now(IST) - timedelta(days=days)).strftime('%Y-%m-%d')
    end_date = datetime.now(IST).strftime('%Y-%m-%d')
    if start_date > end_date:
        start_date, end_date = end_date, start_date
    date_range = pd.date_range(start=start_date, end=end_date)
    hist_data = pd.DataFrame(index=date_range)
    hist_data.index.name = 'Date'
    hist_data['Portfolio_Value'] = 0.0

    async def async_fetch_stock_performance(row, start_date, end_date, hist_data_index, api_timeout):
        ticker = row.get('Ticker') or row.get('ticker')
        quantity = row.get('Quantity', 0) or row.get('quantity', 0)
        if not ticker or quantity == 0:
            return ticker, None
        symbol = ticker.replace('.NS', '') if isinstance(ticker, str) and ticker.endswith('.NS') else ticker
        url = f"http://localhost:3000/api/equity/historical/{symbol}"
        params = {"dateStart": start_date, "dateEnd": end_date}
        retries = 3
        for attempt in range(retries):
            try:
                async with httpx.AsyncClient(timeout=api_timeout) as client:
                    response = await client.get(url, params=params)
                    if response.status_code == 200:
                        data = response.json()
                        closes = {}
                        # Support both list and dict response
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
                            # Build a price series indexed by date
                            price_series = pd.Series(closes)
                            price_series.index = pd.to_datetime(price_series.index)
                            # Reindex to match hist_data_index, forward-fill missing dates
                            price_series = price_series.reindex(hist_data_index, method='ffill')
                            stock_values = price_series * quantity
                            return ticker, stock_values
                    else:
                        await asyncio.sleep(2 ** attempt)
            except Exception as e:
                logging.error(f"[ERROR] async_fetch_stock_performance for {symbol}: {e}")
                if attempt < retries - 1:
                    await asyncio.sleep(2 ** attempt)
        return ticker, None

    async def fetch_all():
        sem = asyncio.Semaphore(max_workers)
        async def sem_fetch(row):
            async with sem:
                return await async_fetch_stock_performance(row, start_date, end_date, hist_data.index, api_timeout)
        tasks = [sem_fetch(row) for _, row in df.iterrows()]
        results = []
        for coro in asyncio.as_completed(tasks):
            ticker, stock_values = await coro
            if stock_values is not None:
                hist_data['Portfolio_Value'] += stock_values.reindex(hist_data.index).fillna(method='ffill')
            results.append((ticker, stock_values))
        return results

    asyncio.run(fetch_all())
    hist_data['Portfolio_Value'] = hist_data['Portfolio_Value'].replace([np.inf, -np.inf], np.nan).fillna(0)
    # Forward-fill before upload_date if provided
    if upload_date is not None:
        try:
            upload_dt = pd.to_datetime(upload_date)
            # Find the first nonzero value on or after upload_date
            after_upload = hist_data.loc[hist_data.index >= upload_dt, 'Portfolio_Value']
            first_nonzero = after_upload[after_upload > 0].iloc[0] if (after_upload > 0).any() else 0.0
            hist_data.loc[hist_data.index < upload_dt, 'Portfolio_Value'] = first_nonzero
        except Exception as e:
            logging.error(f"[DEBUG] Error in forward-fill before upload_date: {e}")
    hist_data = hist_data.reset_index()
    hist_data['Date'] = hist_data['Date'].dt.strftime('%Y-%m-%d')
    logging.debug(f"[DEBUG] hist_data DataFrame before to_dict:\n{hist_data}")
    result = hist_data.to_dict(orient='records')
    logging.debug(f"[DEBUG] get_historical_performance returning: {result}")
    return result  # type: ignore 
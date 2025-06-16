import pandas as pd
import numpy as np
import logging
from .normalization import normalize_columns, get_first_column
import requests
from .cagr import calculate_cagr
from datetime import datetime, timedelta

def get_portfolio_metrics(df: pd.DataFrame) -> dict:
    """Calculate portfolio metrics for multiple timeframes (last year, month, week, day, today), including top performer, top loser, and CAGR. Uses only trading days returned by the Node.js API."""
    logging.debug("Calculating portfolio metrics history for multiple timeframes.")
    df = df.copy()
    df.columns = [col.strip().lower() for col in df.columns]
    if 'ticker' not in df.columns and 'stock symbol' in df.columns:
        df['ticker'] = df['stock symbol']
    timeframes = {
        'last_year': (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d'),
        'last_month': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
        'last_week': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),
        'last_day': (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'),
        'today': datetime.now().strftime('%Y-%m-%d'),
    }
    invested_amount = float((df['quantity'] * df['average price']).sum())
    results = {tf: {'total_value': 0.0, 'profit_loss': 0.0, 'change_percent': 0.0, 'price_date': None, 'fallback': False} for tf in timeframes}
    top_performer = {tf: {'name': None, 'percent': float('-inf')} for tf in timeframes}
    top_loser = {tf: {'name': None, 'percent': float('inf')} for tf in timeframes}
    cagr = {tf: 0.0 for tf in timeframes}
    for _, row in df.iterrows():
        ticker = row.get('ticker')
        quantity = row.get('quantity', 0)
        avg_price = row.get('average price', 0)
        if not ticker or quantity == 0 or avg_price == 0:
            continue
        symbol = ticker.replace('.NS', '') if isinstance(ticker, str) and ticker.endswith('.NS') else ticker
        for tf, start_date in timeframes.items():
            end_date = datetime.now().strftime('%Y-%m-%d')
            price = None
            used_date = end_date
            fallback = False
            try:
                url = f'http://localhost:3000/api/equity/historical/{symbol}?dateStart={start_date}&dateEnd={end_date}'
                resp = requests.get(url, timeout=10)
                closes = []
                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list):
                        for chunk in data:
                            closes += [float(d['CH_CLOSING_PRICE']) for d in chunk['data'] if 'CH_CLOSING_PRICE' in d]
                    elif isinstance(data, dict) and 'data' in data:
                        closes = [float(d['CH_CLOSING_PRICE']) for d in data['data'] if 'CH_CLOSING_PRICE' in d]
                # Handle cases:
                if not closes:
                    start_price = end_price = 0
                elif len(closes) == 1:
                    start_price = end_price = closes[0]
                else:
                    start_price = closes[0]
                    end_price = closes[-1]
                price = end_price
                used_date = end_date
            except Exception as e:
                logging.error(f"Error fetching historical price for {symbol} from {start_date} to {end_date}: {e}")
                start_price = end_price = 0
            if price is not None:
                value = price * quantity
                results[tf]['total_value'] += value
                results[tf]['profit_loss'] += (end_price - avg_price) * quantity
                percent_return = ((end_price - avg_price) / avg_price) * 100 if avg_price else 0
                if percent_return > top_performer[tf]['percent']:
                    top_performer[tf] = {'name': str(ticker), 'percent': percent_return}
                if percent_return < top_loser[tf]['percent']:
                    top_loser[tf] = {'name': str(ticker), 'percent': percent_return}
                # CAGR calculation (robust)
                try:
                    years = max((datetime.now() - datetime.strptime(start_date, '%Y-%m-%d')).days / 365.25, 1e-6)
                    if avg_price > 0 and years > 0 and end_price > 0:
                        cagr_val = ((end_price / avg_price) ** (1 / years) - 1) * 100
                        if abs(cagr_val) < 1000:
                            cagr[tf] = round(cagr_val, 2)
                except Exception as e:
                    logging.error(f"CAGR calculation error for {symbol} on {start_date}: {e}")
                results[tf]['price_date'] = used_date
                results[tf]['fallback'] = fallback
    for tf in timeframes:
        if invested_amount > 0:
            results[tf]['change_percent'] = (results[tf]['profit_loss'] / invested_amount) * 100
        else:
            results[tf]['change_percent'] = 0.0
        if top_performer[tf]['name'] is None:
            top_performer[tf] = {'name': None, 'percent': 0.0}
        if top_loser[tf]['name'] is None:
            top_loser[tf] = {'name': None, 'percent': 0.0}
    # Return price_date and fallback for each tf so frontend can show tooltip if fallback occurred
    return {
        'total_value': {tf: results[tf]['total_value'] for tf in timeframes},
        'profit_loss': {tf: results[tf]['profit_loss'] for tf in timeframes},
        'change_percent': {tf: results[tf]['change_percent'] for tf in timeframes},
        'invested_amount': invested_amount,
        'top_performer': {tf: top_performer[tf] for tf in timeframes},
        'top_loser': {tf: top_loser[tf] for tf in timeframes},
        'cagr': cagr,
        'price_date': {tf: results[tf]['price_date'] for tf in timeframes},
        'fallback': {tf: results[tf]['fallback'] for tf in timeframes},
    } 
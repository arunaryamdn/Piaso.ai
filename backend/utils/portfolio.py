import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
import logging
from config import (
    AI_RECO_BUY_MORE, AI_RECO_SELL, AI_RECO_HOLD,
    AI_RECO_REASON_DOWN, AI_RECO_REASON_UP, AI_RECO_REASON_TEMP_LOSS, AI_RECO_REASON_NO_SIGNAL
)

logging.basicConfig(level=logging.DEBUG)

def normalize_columns(df):
    # Lowercase, strip, and replace underscores with spaces for matching
    df.columns = [col.strip().lower().replace('_', ' ') for col in df.columns]
    return df

def get_first_column(df, candidates):
    for col in candidates:
        if col in df.columns:
            return col
    return None

def calculate_portfolio_metrics(df: pd.DataFrame) -> dict:
    """Calculate portfolio metrics and summary statistics for a given DataFrame. Updated for new column names."""
    logging.debug(f"Calculating portfolio metrics for DataFrame with columns: {df.columns.tolist()} and shape: {df.shape}")
    df = normalize_columns(df)
    # Ensure required columns exist (new names)
    for col in ['quantity', 'quantity available', 'average price', 'previous closing price', 'stock symbol']:
        if col not in df:
            df[col] = 0
    # Add 'ticker' column if missing (use 'stock symbol')
    if 'ticker' not in df.columns and 'stock symbol' in df.columns:
        df['ticker'] = df['stock symbol']
    quantity_col = get_first_column(df, ['quantity', 'quantity available'])
    # Patch: Always use current_price if available, else fallback to live_price, else fallback to price columns
    price_col = None
    if 'current price' in df.columns:
        price_col = 'current price'
    elif 'live price' in df.columns:
        price_col = 'live price'
    else:
        price_col = get_first_column(df, ['previous closing price', 'current price', 'average price', 'avg price'])
    # Calculate investment, value, P/L
    df['investment'] = df[quantity_col] * df['average price'] if quantity_col and 'average price' in df else 0
    if quantity_col and price_col:
        df['current_value'] = df[quantity_col] * df[price_col]
        df['current_price'] = df[price_col]
    else:
        df['current_value'] = 0
        df['current_price'] = 0
    df['p_l'] = df['current_value'] - df['investment']
    df['p_l_percent'] = (df['p_l'] / df['investment']) * 100 if (df['investment'] != 0).any() else 0
    # Portfolio metrics
    total_investment = df['investment'].sum()
    total_value = df['current_value'].sum()
    total_pl = df['p_l'].sum()
    pl_percent = (total_pl / total_investment * 100) if total_investment > 0 else 0
    num_stocks = len(df)
    profit_stocks = len(df[df['p_l'] > 0])
    loss_stocks = len(df[df['p_l'] < 0])
    # Top performers/losers
    top_performers = df.nlargest(3, 'p_l_percent')[['ticker', 'p_l_percent']].rename(columns={'ticker': 'Stock', 'p_l_percent': 'P_L_Percent'})
    top_losers = df.nsmallest(3, 'p_l_percent')[['ticker', 'p_l_percent']].rename(columns={'ticker': 'Stock', 'p_l_percent': 'P_L_Percent'})
    # Portfolio distribution
    distribution = df[['ticker', 'current_value']].rename(columns={'ticker': 'Stock', 'current_value': 'Current_Value'})
    # Replace NaN and inf with None for JSON compliance
    top_performers = top_performers.replace([np.inf, -np.inf, np.nan], None)
    top_losers = top_losers.replace([np.inf, -np.inf, np.nan], None)
    distribution = distribution.replace([np.inf, -np.inf, np.nan], None)
    # Add holdings for frontend table (all keys lowercase)
    holdings = []
    for _, row in df.iterrows():
        holdings.append({
            'symbol': row.get('ticker', ''),
            'name': row.get('ticker', ''),
            'quantity': row.get(quantity_col, 0),
            'avg_price': row.get('average price', 0),
            'ltp': row.get('current_price', 0),
            'change': round(((row.get('current_price', 0) - row.get('average price', 0)) / row.get('average price', 1)) * 100, 2) if row.get('average price', 0) else 0,
            'value': row.get('current_value', 0),
        })
    return {
        'metrics': {
            'total_investment': float(total_investment),
            'total_value': float(total_value),
            'total_pl': float(total_pl),
            'pl_percent': float(pl_percent),
            'num_stocks': int(num_stocks),
            'profit_stocks': int(profit_stocks),
            'loss_stocks': int(loss_stocks),
        },
        'top_performers': top_performers.to_dict(orient='records'),
        'top_losers': top_losers.to_dict(orient='records'),
        'distribution': distribution.to_dict(orient='records'),
        'holdings': holdings,
    }

def fetch_realtime_prices(df: pd.DataFrame) -> pd.DataFrame:
    """Fetch real-time prices for each ticker in the DataFrame using Node.js API."""
    logging.debug(f"Fetching realtime prices for DataFrame with columns: {df.columns.tolist()} and shape: {df.shape}")
    df = df.copy()
    # Normalize column names: lowercase and strip spaces
    df.columns = [col.strip().lower() for col in df.columns]
    logging.debug(f"Columns after normalization: {df.columns.tolist()}")
    if 'ticker' not in df.columns and 'symbol' in df.columns:
        df = df.rename(columns={'symbol': 'ticker'})
        logging.debug(f"Columns after renaming symbol to ticker: {df.columns.tolist()}")
    # Ensure required columns exist
    for col in ['ticker', 'quantity', 'avg_price']:
        if col not in df.columns:
            df[col] = 0
    prices = []
    for _, row in df.iterrows():
        ticker = row.get('ticker')
        logging.debug(f"Processing ticker: {ticker}")
        avg_price = row.get('avg_price', 0)
        live_price = None
        status = 'N/A'
        if not ticker:
            prices.append({'Ticker': None, 'Live_Price': None, 'Avg_Price': avg_price, 'Status': 'N/A', 'Source': 'None'})
            continue
        # Only use Node.js API
        try:
            symbol = ticker.replace('.NS', '') if isinstance(ticker, str) and ticker.endswith('.NS') else ticker
            resp = requests.get(f'http://localhost:3000/api/equity/{symbol}', timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                logging.debug(f"Node.js API response for {symbol}: {data}")
                if 'priceInfo' in data and 'lastPrice' in data['priceInfo']:
                    live_price = float(data['priceInfo']['lastPrice'])
                    status = 'NodeAPI'
        except Exception as e:
            logging.error(f"Node.js API error for {ticker}: {e}")
        if live_price is not None:
            if avg_price < live_price:
                rel_status = 'Live > Avg'
            elif avg_price > live_price:
                rel_status = 'Avg > Live'
            else:
                rel_status = 'Equal'
        else:
            rel_status = 'N/A'
        prices.append({
            'Ticker': ticker,
            'Live_Price': live_price,
            'Avg_Price': avg_price,
            'Status': rel_status,
            'Source': status,
            'Error': None if live_price is not None else 'No price found from any source'
        })
    logging.debug(f"Final prices DataFrame: {prices}")
    result_df = pd.DataFrame(prices)
    # Ensure 'Ticker' column exists for downstream code
    if 'Symbol' in result_df.columns and 'Ticker' not in result_df.columns:
        result_df = result_df.rename(columns={'Symbol': 'Ticker'})
    return result_df

def get_ai_recommendations(df: pd.DataFrame):
    """Generate AI recommendations for each stock in the portfolio."""
    recos = []
    for _, row in df.iterrows():
        symbol = row.get('Ticker') or row.get('ticker')
        pl_percent = row.get('P_L_Percent', 0) or row.get('p_l_percent', 0)
        sector = row.get('Sector', 'Unknown') or row.get('sector', 'Unknown')
        # Simple logic: recommend based on P/L %
        if pl_percent < -10:
            rec = AI_RECO_BUY_MORE
            reason = AI_RECO_REASON_DOWN
        elif pl_percent > 20:
            rec = AI_RECO_SELL
            reason = AI_RECO_REASON_UP
        elif pl_percent < 0:
            rec = AI_RECO_HOLD
            reason = AI_RECO_REASON_TEMP_LOSS
        else:
            rec = AI_RECO_HOLD
            reason = AI_RECO_REASON_NO_SIGNAL
        recos.append({
            'Symbol': symbol,
            'Sector': sector,
            'P/L %': round(pl_percent, 2),
            'Recommendation': rec,
            'Reason': reason
        })
    return recos

def get_historical_performance(df: pd.DataFrame, days: int = 30):
    """Calculate historical performance for the portfolio over a given number of days."""
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')
    date_range = pd.date_range(start=start_date, end=end_date)
    hist_data = pd.DataFrame(index=date_range)
    hist_data.index.name = 'Date'
    hist_data['Portfolio_Value'] = 0.0
    for _, row in df.iterrows():
        ticker = row.get('Ticker') or row.get('ticker')
        quantity = row.get('Quantity', 0) or row.get('quantity', 0)
        stock_values = None
        # Only use Node.js API
        try:
            symbol = ticker.replace('.NS', '') if isinstance(ticker, str) and ticker.endswith('.NS') else ticker
            if symbol and symbol != 'None':
                resp = requests.get(f'http://localhost:3000/api/equity/historical/{symbol}?dateStart={start_date}&dateEnd={end_date}', timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    closes = []
                    if isinstance(data, list):
                        for chunk in data:
                            closes += [float(d['CH_CLOSING_PRICE']) for d in chunk['data'] if 'CH_CLOSING_PRICE' in d and d['data']]
                    elif isinstance(data, dict) and 'data' in data:
                        closes = [float(d['CH_CLOSING_PRICE']) for d in data['data'] if 'CH_CLOSING_PRICE' in d]
                    if closes:
                        stock_values = pd.Series(closes, index=date_range[:len(closes)]) * quantity
        except Exception:
            pass
        if stock_values is not None:
            hist_data['Portfolio_Value'] += stock_values.reindex(hist_data.index).fillna(method='ffill')
    hist_data['Portfolio_Value'] = hist_data['Portfolio_Value'].replace([np.inf, -np.inf], np.nan).fillna(0)
    hist_data = hist_data.reset_index()
    hist_data['Date'] = hist_data['Date'].dt.strftime('%Y-%m-%d')
    return hist_data.to_dict(orient='records')

def create_risk_profile(df: pd.DataFrame, hist_data: list):
    """Create a risk profile for the portfolio based on historical data."""
    import pandas as pd
    import numpy as np
    # Convert hist_data to DataFrame if needed
    if isinstance(hist_data, list):
        hist_df = pd.DataFrame(hist_data)
    else:
        hist_df = hist_data
    risk_profile = {}
    if hist_df is None or len(hist_df) < 2 or 'Portfolio_Value' not in hist_df:
        return {
            "volatility": None,
            "max_drawdown": None,
            "top_sector": None,
            "top_sector_exposure": None,
            "sector_concentration": None,
            "num_sectors": None
        }
    # Volatility (annualized std dev of daily returns)
    hist_df['Portfolio_Value'] = pd.to_numeric(hist_df['Portfolio_Value'], errors='coerce').fillna(0)
    hist_df['Daily_Return'] = hist_df['Portfolio_Value'].pct_change().fillna(0)
    volatility = hist_df['Daily_Return'].std() * np.sqrt(252) * 100
    # Max drawdown
    cumulative = hist_df['Portfolio_Value'].cummax()
    drawdown = (hist_df['Portfolio_Value'] - cumulative) / cumulative
    max_drawdown = drawdown.min() * 100
    # Sector exposure
    if 'Sector' in df:
        sector_exposure = df.groupby('Sector')['Current_Value'].sum()
        total = sector_exposure.sum()
        top_sector = sector_exposure.idxmax() if not sector_exposure.empty else None
        top_sector_exposure = (sector_exposure.max() / total * 100) if total > 0 else None
        sector_concentration = (sector_exposure.max() / total * 100) if total > 0 else None
        num_sectors = len(sector_exposure)
    else:
        top_sector = None
        top_sector_exposure = None
        sector_concentration = None
        num_sectors = None
    return {
        "volatility": round(volatility, 2) if volatility is not None else None,
        "max_drawdown": round(max_drawdown, 2) if max_drawdown is not None else None,
        "top_sector": top_sector,
        "top_sector_exposure": round(top_sector_exposure, 2) if top_sector_exposure is not None else None,
        "sector_concentration": round(sector_concentration, 2) if sector_concentration is not None else None,
        "num_sectors": num_sectors
    }

def get_sector_analysis(df: pd.DataFrame):
    """Group by sector and sum current value for sector analysis."""
    df = normalize_columns(df)
    print("DEBUG: Columns after normalization:", df.columns.tolist())
    print("DEBUG: First few rows:", df.head().to_dict())
    quantity_col = get_first_column(df, ['quantity', 'quantity available'])
    price_col = get_first_column(df, ['live price', 'previous closing price', 'previous closing price', 'current price', 'average price', 'avg price'])
    # If current value is missing, compute it
    if 'current value' not in df and quantity_col and price_col:
        df['current value'] = df[quantity_col] * df[price_col]
    # Only proceed if sector and current value exist
    if 'sector' in df and 'current value' in df:
        sector_dist = df.groupby('sector')['current value'].sum().reset_index()
        sector_dist = sector_dist.rename(columns={'current value': 'Current_Value', 'sector': 'Sector'})
        print("DEBUG: Sector data being returned:", sector_dist.to_dict(orient='records'))
        return sector_dist.to_dict(orient='records')
    print("DEBUG: Sector or current value column missing, cannot compute sector allocation.")
    return []

def get_news(df: pd.DataFrame):
    """Placeholder: no yfinance, no news fetching."""
    return {}

def get_portfolio_metrics_history(df: pd.DataFrame) -> dict:
    """Calculate portfolio metrics for multiple timeframes (last year, month, week, day, today), including top performer, top loser, and CAGR."""
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
    results = {tf: {'total_value': 0.0, 'profit_loss': 0.0, 'change_percent': 0.0} for tf in timeframes}
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
        for tf, date_str in timeframes.items():
            try:
                resp = requests.get(f'http://localhost:3000/api/equity/historical/{symbol}?dateStart={date_str}&dateEnd={date_str}', timeout=10)
                price = None
                if resp.status_code == 200:
                    data = resp.json()
                    closes = []
                    if isinstance(data, list):
                        for chunk in data:
                            closes += [float(d['CH_CLOSING_PRICE']) for d in chunk['data'] if 'CH_CLOSING_PRICE' in d]
                    elif isinstance(data, dict) and 'data' in data:
                        closes = [float(d['CH_CLOSING_PRICE']) for d in data['data'] if 'CH_CLOSING_PRICE' in d]
                    if closes:
                        price = closes[-1]
                if price is not None:
                    value = price * quantity
                    results[tf]['total_value'] += value
                    results[tf]['profit_loss'] += (price - avg_price) * quantity
                    percent_return = ((price - avg_price) / avg_price) * 100
                    if percent_return > top_performer[tf]['percent']:
                        top_performer[tf] = {'name': str(ticker), 'percent': percent_return}
                    if percent_return < top_loser[tf]['percent']:
                        top_loser[tf] = {'name': str(ticker), 'percent': percent_return}
                    # CAGR calculation (robust)
                    try:
                        years = max((datetime.now() - datetime.strptime(date_str, '%Y-%m-%d')).days / 365.25, 1e-6)
                        if avg_price > 0 and years > 0 and price > 0:
                            cagr_val = ((price / avg_price) ** (1 / years) - 1) * 100
                            # Clamp to reasonable range
                            if abs(cagr_val) < 1000:
                                cagr[tf] = round(cagr_val, 2)
                    except Exception as e:
                        logging.error(f"CAGR calculation error for {symbol} on {date_str}: {e}")
            except Exception as e:
                logging.error(f"Error fetching historical price for {symbol} on {date_str}: {e}")
                continue
    for tf in timeframes:
        if invested_amount > 0:
            results[tf]['change_percent'] = (results[tf]['profit_loss'] / invested_amount) * 100
        else:
            results[tf]['change_percent'] = 0.0
        if top_performer[tf]['name'] is None:
            top_performer[tf] = {'name': None, 'percent': 0.0}
        if top_loser[tf]['name'] is None:
            top_loser[tf] = {'name': None, 'percent': 0.0}
    return {
        'total_value': {tf: results[tf]['total_value'] for tf in timeframes},
        'profit_loss': {tf: results[tf]['profit_loss'] for tf in timeframes},
        'change_percent': {tf: results[tf]['change_percent'] for tf in timeframes},
        'invested_amount': invested_amount,
        'top_performer': {tf: top_performer[tf] for tf in timeframes},
        'top_loser': {tf: top_loser[tf] for tf in timeframes},
        'cagr': cagr,
    }

# Expose all real business logic for import in main.py
__all__ = [
    'calculate_portfolio_metrics',
    'fetch_realtime_prices',
    'get_ai_recommendations',
    'get_historical_performance',
    'create_risk_profile',
    'get_news',
    'get_sector_analysis',
    'get_portfolio_metrics_history',
]
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import yfinance as yf
import requests

def calculate_portfolio_metrics(df: pd.DataFrame) -> dict:
    # Ensure required columns exist
    for col in ['Quantity', 'Avg_Price', 'Current_Price']:
        if col not in df:
            df[col] = 0
    # Calculate investment, value, P/L
    df['Investment'] = df['Quantity'] * df['Avg_Price']
    df['Current_Value'] = df['Quantity'] * df['Current_Price']
    df['P_L'] = df['Current_Value'] - df['Investment']
    df['P_L_Percent'] = (df['P_L'] / df['Investment']) * 100
    # Portfolio metrics
    total_investment = df['Investment'].sum()
    total_value = df['Current_Value'].sum()
    total_pl = df['P_L'].sum()
    pl_percent = (total_pl / total_investment * 100) if total_investment > 0 else 0
    num_stocks = len(df)
    profit_stocks = len(df[df['P_L'] > 0])
    loss_stocks = len(df[df['P_L'] < 0])
    # Top performers/losers
    top_performers = df.nlargest(3, 'P_L_Percent')[['Ticker', 'P_L_Percent']].rename(columns={'Ticker': 'Stock'})
    top_losers = df.nsmallest(3, 'P_L_Percent')[['Ticker', 'P_L_Percent']].rename(columns={'Ticker': 'Stock'})
    # Portfolio distribution
    distribution = df[['Ticker', 'Current_Value']].rename(columns={'Ticker': 'Stock'})
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
    }

def fetch_realtime_prices(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    prices = []
    for _, row in df.iterrows():
        ticker = row.get('Ticker')
        avg_price = row.get('Avg_Price', 0)
        live_price = None
        status = 'N/A'
        if not ticker:
            prices.append({'Symbol': None, 'Live_Price': None, 'Avg_Price': avg_price, 'Status': 'N/A', 'Source': 'None'})
            continue
        # 1. Try stock-nse-india Node.js API
        try:
            symbol = ticker.replace('.NS', '') if isinstance(ticker, str) and ticker.endswith('.NS') else ticker
            resp = requests.get(f'http://localhost:3000/api/quote-equity?symbol={symbol}', timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                if 'priceInfo' in data and 'lastPrice' in data['priceInfo']:
                    live_price = float(data['priceInfo']['lastPrice'])
                    status = 'NodeAPI'
        except Exception:
            pass
        # 2. Fallback to yfinance
        if live_price is None:
            try:
                yf_ticker = yf.Ticker(ticker)
                hist = yf_ticker.history(period='1d')
                if not hist.empty:
                    live_price = float(hist['Close'].iloc[-1])
                    status = 'Yahoo'
            except Exception:
                pass
        # 3. Fallback to nsepython
        if live_price is None:
            try:
                from nsepython import nsefetch
                nse_symbol = ticker.replace('.NS', '') if isinstance(ticker, str) else ticker
                nse_data = nsefetch(f'https://www.nseindia.com/api/quote-equity?symbol={nse_symbol}')
                if nse_data and 'priceInfo' in nse_data and 'lastPrice' in nse_data['priceInfo']:
                    live_price = float(nse_data['priceInfo']['lastPrice'])
                    status = 'nsepython'
            except Exception:
                pass
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
            'Symbol': ticker,
            'Live_Price': live_price,
            'Avg_Price': avg_price,
            'Status': rel_status,
            'Source': status
        })
    return pd.DataFrame(prices)

def get_ai_recommendations(df: pd.DataFrame):
    # Realistic logic: Use P/L %, sector, and price trend for recommendations
    import yfinance as yf
    recos = []
    for _, row in df.iterrows():
        symbol = row.get('Ticker')
        pl_percent = row.get('P_L_Percent', 0)
        sector = row.get('Sector', 'Unknown')
        try:
            # Get recent price trend (last 7 days)
            hist = yf.Ticker(symbol).history(period='7d')
            trend = 'Up' if not hist.empty and hist['Close'].iloc[-1] > hist['Close'].iloc[0] else 'Down'
        except Exception:
            trend = 'Unknown'
        if pl_percent < -10 and trend == 'Up':
            rec = 'Buy More'
            reason = 'Stock is recovering from a dip.'
        elif pl_percent > 20 and trend == 'Down':
            rec = 'Sell'
            reason = 'Stock is up significantly but showing weakness.'
        elif pl_percent < 0:
            rec = 'Hold'
            reason = 'Temporary loss, but no strong sell signal.'
        else:
            rec = 'Hold'
            reason = 'No strong buy/sell signal.'
        recos.append({
            'Symbol': symbol,
            'Sector': sector,
            'P/L %': round(pl_percent, 2),
            'Trend': trend,
            'Recommendation': rec,
            'Reason': reason
        })
    return recos

def get_historical_performance(df: pd.DataFrame, days: int = 30):
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')
    date_range = pd.date_range(start=start_date, end=end_date)
    hist_data = pd.DataFrame(index=date_range)
    hist_data.index.name = 'Date'
    hist_data['Portfolio_Value'] = 0.0
    for _, row in df.iterrows():
        ticker = row.get('Ticker')
        quantity = row.get('Quantity', 0)
        stock_values = None
        # 1. Try stock-nse-india Node.js API
        try:
            symbol = ticker.replace('.NS', '') if isinstance(ticker, str) and ticker.endswith('.NS') else ticker
            resp = requests.get(f'http://localhost:3000/api/historical/cm/equity?symbol={symbol}&from={start_date}&to={end_date}', timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                # Try to extract closing prices from the response
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
        # 2. Fallback to yfinance
        if stock_values is None:
            try:
                stock_hist = yf.download(ticker, start=start_date, end=end_date, progress=False)
                if stock_hist is not None and not stock_hist.empty and 'Close' in stock_hist:
                    stock_values = stock_hist['Close'] * quantity
            except Exception:
                pass
        # 3. Fallback to nsepython
        if stock_values is None:
            try:
                from nsepython import nsefetch
                nse_symbol = ticker.replace('.NS', '') if isinstance(ticker, str) else ticker
                nse_data = nsefetch(f'https://www.nseindia.com/api/quote-equity?symbol={nse_symbol}')
                if nse_data and 'priceInfo' in nse_data and 'lastPrice' in nse_data['priceInfo']:
                    last_price = float(nse_data['priceInfo']['lastPrice'])
                    stock_values = pd.Series([last_price] * len(date_range), index=date_range) * quantity
            except Exception:
                pass
        if stock_values is not None:
            hist_data['Portfolio_Value'] += stock_values.reindex(hist_data.index).fillna(method='ffill')
    hist_data['Portfolio_Value'] = hist_data['Portfolio_Value'].replace([np.inf, -np.inf], np.nan).fillna(0)
    hist_data = hist_data.reset_index()
    hist_data['Date'] = hist_data['Date'].dt.strftime('%Y-%m-%d')
    return hist_data.to_dict(orient='records')

def create_risk_profile(df: pd.DataFrame, hist_data: list):
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
    # Group by sector and sum current value
    if 'Sector' in df and 'Current_Value' in df:
        sector_dist = df.groupby('Sector')['Current_Value'].sum().reset_index()
        sector_dist = sector_dist.rename(columns={'Current_Value': 'Current_Value', 'Sector': 'Sector'})
        return sector_dist.to_dict(orient='records')
    return []

def get_news(df: pd.DataFrame):
    import yfinance as yf
    import time
    news_dict = {}
    tickers = df['Ticker'].unique() if 'Ticker' in df else []
    for ticker in tickers:
        try:
            ticker_obj = yf.Ticker(ticker)
            articles = ticker_obj.news[:5] if hasattr(ticker_obj, 'news') else []
            news_dict[ticker] = [
                {
                    'title': article.get('title', ''),
                    'link': article.get('link', ''),
                    'publisher': article.get('publisher', ''),
                    'providerPublishTime': article.get('providerPublishTime', '')
                }
                for article in articles
            ]
            time.sleep(0.1)  # avoid rate limits
        except Exception:
            news_dict[ticker] = []
    return news_dict

# Expose all real business logic for import in main.py
__all__ = [
    'calculate_portfolio_metrics',
    'fetch_realtime_prices',
    'get_ai_recommendations',
    'get_historical_performance',
    'create_risk_profile',
    'get_news',
    'get_sector_analysis',
]
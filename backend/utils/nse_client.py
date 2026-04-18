"""
NSE data fetcher using yfinance.
Replaces the stock-nse-india Node.js service.
"""
import logging
import yfinance as yf

logger = logging.getLogger(__name__)


def get_equity_quote(symbol: str) -> dict | None:
    """Fetch current price and basic info for an NSE symbol."""
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        hist = ticker.history(period="2d")
        if hist.empty:
            return None
        last_price = float(hist["Close"].iloc[-1])
        prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else last_price
        change = last_price - prev_close
        p_change = (change / prev_close * 100) if prev_close else 0
        info = ticker.fast_info
        return {
            "symbol": symbol,
            "lastPrice": round(last_price, 2),
            "previousClose": round(prev_close, 2),
            "change": round(change, 2),
            "pChange": round(p_change, 2),
            "marketCap": getattr(info, "market_cap", None),
        }
    except Exception as e:
        logger.warning(f"NSE quote failed for {symbol}: {e}")
        return None


def get_equity_historical(symbol: str, period: str = "1y") -> list[dict]:
    """Fetch OHLC historical data. period: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max"""
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        hist = ticker.history(period=period)
        if hist.empty:
            return []
        return [
            {
                "date": str(idx.date()),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for idx, row in hist.iterrows()
        ]
    except Exception as e:
        logger.warning(f"NSE historical failed for {symbol}: {e}")
        return []

import logging
from typing import Any, Dict, List
import pandas as pd


def get_news(tickers: List[str], max_per_ticker: int = 3) -> List[Dict[str, Any]]:
    """Fetch recent news for a list of stock tickers via yfinance."""
    results: List[Dict[str, Any]] = []
    try:
        import yfinance as yf
    except ImportError:
        logging.warning("yfinance not installed — news unavailable")
        return results

    for ticker in tickers[:10]:
        try:
            t = yf.Ticker(ticker)
            news = t.news or []
            for item in news[:max_per_ticker]:
                results.append({
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "publisher": item.get("publisher", ""),
                    "published": item.get("providerPublishTime"),
                    "symbol": ticker.replace(".NS", ""),
                    "thumbnail": (item.get("thumbnail") or {}).get("resolutions", [{}])[0].get("url"),
                })
        except Exception as e:
            logging.warning(f"News fetch failed for {ticker}: {e}")

    return results


get_news_async = get_news

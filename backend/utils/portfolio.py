# portfolio.py now only re-exports from modular files
from .metrics import get_portfolio_metrics
from .prices import fetch_realtime_prices, fetch_realtime_prices_async
from .performance import get_historical_performance
from .risk import create_risk_profile
from .normalization import normalize_columns, get_first_column
from .news import get_news, get_news_async
from .sector import get_sector_analysis
from .preprocess import preprocess_portfolio

__all__ = [
    'fetch_realtime_prices',
    'fetch_realtime_prices_async',
    'get_historical_performance',
    'create_risk_profile',
    'get_news',
    'get_news_async',
    'get_sector_analysis',
    'get_portfolio_metrics',
    'normalize_columns',
    'get_first_column',
    'preprocess_portfolio',
]
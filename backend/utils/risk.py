import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any, Sequence
from .normalization import normalize_columns

def create_risk_profile(df: pd.DataFrame, hist_data: list) -> Dict[str, Any]:
    """Create a risk profile for the portfolio based on historical data."""
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
    hist_df['Portfolio_Value'] = pd.to_numeric(hist_df['Portfolio_Value'], errors='coerce').fillna(0)
    hist_df['Daily_Return'] = hist_df['Portfolio_Value'].pct_change().fillna(0)
    volatility = hist_df['Daily_Return'].std() * np.sqrt(252) * 100
    cumulative = hist_df['Portfolio_Value'].cummax()
    drawdown = (hist_df['Portfolio_Value'] - cumulative) / cumulative
    max_drawdown = drawdown.min() * 100
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
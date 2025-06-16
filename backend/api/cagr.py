import pandas as pd
import numpy as np
import logging
import requests
from datetime import datetime, timedelta
from collections import defaultdict


def calculate_cagr(start_value, end_value, years):
    if start_value <= 0 or years <= 0:
        return 0
    try:
        cagr_val = (end_value / start_value) ** (1 / years) - 1
        return round(cagr_val, 2)
    except Exception as e:
        logging.error(f"CAGR calculation error: {e}")
        return 0

def portfolio_cagr(portfolio, get_price, current_date):
    total_invested = 0
    total_current = 0
    for row in portfolio:
        symbol = row["symbol"]
        buy_date = row["buy_date"]
        buy_price = row["buy_price"]
        quantity = row["quantity"]
        current_price = get_price(symbol, current_date)
        total_invested += buy_price * quantity
        total_current += current_price * quantity
    # Use weighted average holding period
    min_date = min(buy_date for row in portfolio)
    max_years = (pd.to_datetime(current_date) - pd.to_datetime(min_date)).days / 365.25
    return calculate_cagr(total_invested, total_current, max_years)

def sector_weighted_cagr(portfolio, get_price, get_sector, current_date):
    sector_groups = defaultdict(list)
    for row in portfolio:
        sector = row.get("sector") or get_sector(row["symbol"])
        row["sector"] = sector
        sector_groups[sector].append(row)
    result = {}
    for sector, rows in sector_groups.items():
        total_invested = 0
        total_current = 0
        weighted_years = 0
        for row in rows:
            symbol = row["symbol"]
            buy_price = row["buy_price"]
            quantity = row["quantity"]
            buy_date = row["buy_date"]
            current_price = get_price(symbol, current_date)
            years = (pd.to_datetime(current_date) - pd.to_datetime(buy_date)).days / 365.25
            total_invested += buy_price * quantity
            total_current += current_price * quantity
            weighted_years += years * (buy_price * quantity)
        avg_years = weighted_years / total_invested if total_invested else 0
        result[sector] = calculate_cagr(total_invested, total_current, avg_years)
    return result

def symbol_level_cagr(symbol, get_price, current_date):
    result = []
    for row in portfolio:
        symbol = row["symbol"]
        buy_price = row["buy_price"]
        buy_date = row["buy_date"]
        current_price = get_price(symbol, current_date)
        years = (pd.to_datetime(current_date) - pd.to_datetime(buy_date)).days / 365.25
        cagr_val = calculate_cagr(buy_price, current_price, years)
        result.append({
            symbol,
            cagr_val
        })
    return result

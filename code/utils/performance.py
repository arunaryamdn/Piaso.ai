import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import streamlit as st

def get_historical_performance(df, days=30):
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')
    date_range = pd.date_range(start=start_date, end=end_date)
    hist_data = pd.DataFrame(index=date_range)
    hist_data.index.name = 'Date'
    hist_data['Portfolio_Value'] = 0.0

    with st.spinner("Calculating historical performance..."):
        for _, row in df.iterrows():
            ticker = row['Ticker']
            quantity = row['Quantity']
            if row['Current_Price'] <= 0:
                continue
            try:
                stock_hist = yf.download(ticker, start=start_date, end=end_date, progress=False)
                if isinstance(stock_hist, pd.DataFrame) and not stock_hist.empty and 'Close' in stock_hist.columns:
                    stock_values = stock_hist['Close'] * quantity
                    hist_data['Portfolio_Value'] += stock_values.reindex(hist_data.index).fillna(method='ffill')
            except Exception as e:
                st.warning(f"Error fetching historical data for {ticker}: {e}")
                continue

    if not hist_data.empty and hist_data['Portfolio_Value'].sum() > 0:
        hist_data['Daily_Return'] = hist_data['Portfolio_Value'].pct_change()
        hist_data.replace([np.inf, -np.inf], np.nan, inplace=True)
        # Forward fill missing values
        hist_data = hist_data.ffill()

    return hist_data 
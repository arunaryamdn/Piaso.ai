import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import streamlit as st
from curl_cffi import requests
from nsepython import nsefetch
from utils.nse_node_api import get_nse_historical, normalize_nse_historical_response
import plotly.graph_objects as go
import asyncio
import httpx

async def async_fetch_stock_performance(row, start_date, end_date, hist_data_index, api_timeout):
    ticker = row['Ticker']
    quantity = row['Quantity']
    if row['Current_Price'] <= 0:
        return ticker, None
    symbol = ticker.replace('.NS', '')
    url = f"http://localhost:3000/api/equity/historical/{symbol}"
    params = {"from": start_date, "to": end_date}
    retries = 3
    for attempt in range(retries):
        try:
            async with httpx.AsyncClient(timeout=api_timeout) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    nse_data = response.json()
                    data_list = normalize_nse_historical_response(nse_data)
                    if data_list:
                        nse_df = pd.DataFrame(data_list)
                        nse_df['Date'] = pd.to_datetime(nse_df['CH_TIMESTAMP'])
                        nse_df.set_index('Date', inplace=True)
                        nse_df = nse_df.reindex(hist_data_index)
                        if 'CLOSE' not in nse_df.columns and 'CH_CLOSING_PRICE' in nse_df.columns:
                            nse_df['CLOSE'] = nse_df['CH_CLOSING_PRICE']
                        if 'CLOSE' in nse_df.columns:
                            nse_df['CLOSE'] = pd.to_numeric(nse_df['CLOSE'], errors='coerce')
                            stock_values = nse_df['CLOSE'] * quantity
                            return ticker, stock_values.fillna(method='ffill')
                else:
                    await asyncio.sleep(2 ** attempt)
        except Exception as e:
            if attempt < retries - 1:
                await asyncio.sleep(2 ** attempt)
    return ticker, None

def get_historical_performance(df, days=30):
    # User controls for performance
    st.sidebar.subheader('Performance Settings')
    max_workers = st.sidebar.slider('Parallel Fetches (Async)', min_value=1, max_value=10, value=3, help='Number of stocks to fetch in parallel')
    api_timeout = st.sidebar.slider('API Timeout (seconds)', min_value=5, max_value=60, value=30, help='Timeout for each API call')
    # API health check
    api_health = 'Unknown'
    try:
        resp = requests.get('http://localhost:3000/api/health', timeout=5)
        if resp.status_code == 200:
            api_health = '🟢 Healthy'
        else:
            api_health = '🟠 Unstable'
    except Exception:
        api_health = '🔴 Down'
    st.sidebar.markdown(f"**Node.js API Status:** {api_health}")

    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')
    date_range = pd.date_range(start=start_date, end=end_date)
    hist_data = pd.DataFrame(index=date_range)
    hist_data.index.name = 'Date'
    hist_data['Portfolio_Value'] = 0.0

    progress_bar = st.progress(0)
    status_placeholder = st.empty()
    processed_stocks = set()
    stock_placeholders = {row['Ticker']: st.empty() for _, row in df.iterrows()}
    total = len(df)
    # Partial results table
    partial_table_placeholder = st.empty()
    partial_results = {}
    failed_stocks = []

    async def fetch_all():
        sem = asyncio.Semaphore(max_workers)
        async def sem_fetch(row):
            async with sem:
                return await async_fetch_stock_performance(row, start_date, end_date, hist_data.index, api_timeout)
        tasks = [sem_fetch(row) for _, row in df.iterrows()]
        results = []
        for i, coro in enumerate(asyncio.as_completed(tasks), 1):
            ticker, stock_values = await coro
            processed_stocks.add(ticker)
            if stock_values is not None:
                hist_data['Portfolio_Value'] += stock_values
                stock_placeholders[ticker].success(f"✅ {ticker} data loaded.")
                partial_results[ticker] = stock_values
                st.toast(f"{ticker} loaded successfully!", icon="✅")
            else:
                stock_placeholders[ticker].warning(f"⚠️ {ticker} data not available.")
                partial_results[ticker] = None
                failed_stocks.append(ticker)
                st.toast(f"{ticker} failed to load.", icon="⚠️")
            # Show partial results table
            partial_df = pd.DataFrame({k: v for k, v in partial_results.items() if v is not None})
            if not partial_df.empty:
                partial_table_placeholder.dataframe(partial_df, use_container_width=True)
            progress_bar.progress(i / total)
            status_placeholder.info(f"Processed {i}/{total} stocks...")
            results.append((ticker, stock_values))
        progress_bar.empty()
        status_placeholder.success("All stocks processed.")
        return results

    asyncio.run(fetch_all())

    # Show summary of failed stocks
    if failed_stocks:
        with st.expander("Show Failed/Slow Stocks"):
            st.warning(f"The following stocks could not be fetched (may be delisted, slow, or incorrect symbol): {', '.join(failed_stocks)}")

    # Enhanced partial results table with conditional formatting and sparklines
    if partial_results:
        with st.expander("Show Partial Results Table with Trends"):
            partial_df = pd.DataFrame({k: v for k, v in partial_results.items() if v is not None})
            if not partial_df.empty:
                # Conditional formatting: green for positive, red for negative
                def highlight(val):
                    if isinstance(val, (int, float)):
                        if val > 0:
                            return 'background-color: #d4f8e8; color: #228B22; font-weight: bold;'
                        elif val < 0:
                            return 'background-color: #ffeaea; color: #b22222; font-weight: bold;'
                    return ''
                styled_df = partial_df.style.applymap(highlight)
                st.dataframe(styled_df, use_container_width=True)
                # Mini-sparklines for each stock
                st.markdown("**Stock Trends (Sparklines):**")
                spark_cols = st.columns(len(partial_df.columns))
                for i, col in enumerate(partial_df.columns):
                    with spark_cols[i]:
                        fig = go.Figure()
                        fig.add_trace(go.Scatter(y=partial_df[col], mode='lines', line=dict(width=2, color='#22223b')))
                        fig.update_layout(
                            margin=dict(l=0, r=0, t=0, b=0),
                            height=60,
                            width=120,
                            xaxis=dict(visible=False),
                            yaxis=dict(visible=False),
                            plot_bgcolor='rgba(0,0,0,0)',
                            paper_bgcolor='rgba(0,0,0,0)'
                        )
                        st.plotly_chart(fig, use_container_width=True)

    if not hist_data.empty and hist_data['Portfolio_Value'].sum() > 0:
        hist_data['Daily_Return'] = hist_data['Portfolio_Value'].pct_change()
        hist_data.replace([np.inf, -np.inf], np.nan, inplace=True)
        # Forward fill missing values
        hist_data = hist_data.ffill()

    return hist_data 
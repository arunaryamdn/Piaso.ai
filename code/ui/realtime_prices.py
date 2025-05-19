import streamlit as st
import pandas as pd
import yfinance as yf
import logging

def show_realtime_prices(df):
    st.subheader('📈 Real-Time Stock Prices')
    refresh = st.button('Refresh Prices')
    failed = []
    prices_data = []
    for idx, row in df.iterrows():
        symbol = row['Ticker']
        avg_price = row['Avg_Price']
        try:
            ticker = yf.Ticker(str(symbol) + ".NS")
            live_price = ticker.history(period='1d').iloc[-1]['Close']
            live_price_str = f"{live_price:,.2f}"
        except Exception as e:
            failed.append(symbol)
            live_price = None
            live_price_str = 'N/A'
        if live_price is not None:
            if avg_price < live_price:
                status = 'Live > Avg'
                color = 'lightgreen'
            elif avg_price > live_price:
                status = 'Avg > Live'
                color = 'lightcoral'
            else:
                status = 'Equal'
                color = 'khaki'
        else:
            status = 'N/A'
            color = 'lightgray'
        prices_data.append({
            'Symbol': symbol,
            'Avg Price (₹)': f"{avg_price:,.2f}",
            'Live Price (₹)': live_price_str,
            'Status': status,
            'Color': color
        })
        logging.info(f'Fetched live price for {symbol}: {live_price}')
    prices_df = pd.DataFrame(prices_data)
    if 'Color' in prices_df.columns and not prices_df['Color'].isnull().all():
        def highlight_status(row):
            color = row['Color'] if 'Color' in row else ''
            return [f'background-color: {color}; color: black; font-weight: bold' if col == 'Status' else '' for col in row.index]
        styled_df = prices_df.drop(columns=['Color']).style.apply(highlight_status, axis=1)
        st.dataframe(
            styled_df,
            use_container_width=True,
            hide_index=True
        )
    else:
        st.dataframe(prices_df, use_container_width=True, hide_index=True)
    if failed:
        with st.expander('Show Failed Ticker Fetches'):
            st.write('The following tickers could not be fetched (may be delisted or incorrect):')
            st.write(', '.join(map(str, failed)))

def show_realtime_prices_page(df):
    show_realtime_prices(df)
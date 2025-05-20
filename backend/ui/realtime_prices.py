import streamlit as st
import pandas as pd
import requests

BACKEND_URL = "http://localhost:8000/api"

def show_realtime_prices(df):
    st.subheader('📈 Real-Time Stock Prices')
    refresh = st.button('Refresh Prices')
    data = df.to_dict(orient='records')
    if st.session_state.get('realtime_prices') is None or refresh:
        with st.spinner("Fetching real-time prices from backend..."):
            resp = requests.post(f"{BACKEND_URL}/realtime_prices", json={"portfolio": data})
            prices_data = resp.json() if resp.status_code == 200 else []
            st.session_state['realtime_prices'] = prices_data
    else:
        prices_data = st.session_state['realtime_prices']
    if prices_data:
        prices_df = pd.DataFrame(prices_data)
        st.dataframe(prices_df)
    else:
        st.info("No real-time price data available.")

def show_realtime_prices_page(df):
    show_realtime_prices(df)
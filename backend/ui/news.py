import streamlit as st
import pandas as pd
import requests

BACKEND_URL = "http://localhost:8000/api"

def show_news(df):
    st.header("📰 Latest News for Your Portfolio")
    if 'Ticker' not in df.columns:
        st.warning("No 'Ticker' column found in your portfolio.")
        return
    data = df.to_dict(orient='records')
    with st.spinner("Fetching news from backend..."):
        resp = requests.post(f"{BACKEND_URL}/news", json={"portfolio": data})
        news_data = resp.json() if resp.status_code == 200 else {}
    tickers = news_data.keys() if news_data else []
    for ticker in tickers:
        st.subheader(f"News for {ticker}")
        articles = news_data[ticker]
        if articles:
            for article in articles:
                st.markdown(f"**[{article.get('title', 'No Title')}]({article.get('link', '#')})**")
                st.write(article.get('publisher', ''))
                publish_time = article.get('providerPublishTime', '')
                st.caption(publish_time)
                st.write("---")
        else:
            st.write("No recent news found.")

def show_news_page(df):
    show_news(df)
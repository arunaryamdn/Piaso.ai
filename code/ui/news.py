import streamlit as st
import yfinance as yf
import datetime

def fetch_yahoo_news(symbol):
    try:
        ticker = yf.Ticker(symbol)
        return ticker.news[:5]  # Get the latest 5 news articles
    except Exception as e:
        return []

def show_news(df):
    st.header("📰 Latest News for Your Portfolio")
    if 'Symbol' not in df.columns:
        st.warning("No 'Symbol' column found in your portfolio.")
        return

    symbols = df['Symbol'].unique()
    for symbol in symbols:
        # Ensure symbol is in Yahoo Finance format for NSE stocks
        if not symbol.endswith('.NS'):
            yf_symbol = symbol + '.NS'
        else:
            yf_symbol = symbol
        st.subheader(f"News for {symbol}")
        articles = fetch_yahoo_news(yf_symbol)
        if articles:
            for article in articles:
                st.markdown(f"**[{article.get('title', 'No Title')}]({article.get('link', '#')})**")
                st.write(article.get('publisher', ''))
                publish_time = article.get('providerPublishTime', '')
                if publish_time:
                    publish_time = datetime.datetime.fromtimestamp(publish_time).strftime('%Y-%m-%d %H:%M')
                st.caption(publish_time)
                st.write("---")
        else:
            st.write("No recent news found.")

def show_news_page(df):
    show_news(df)
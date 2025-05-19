# File: /StockMarketAnalyser/StockMarketAnalyser/code/main.py

import streamlit as st
import pandas as pd
from utils.file_io import upload_portfolio
from ui.dashboard import show_summary_cards
from ui.portfolio_table import show_portfolio_table
from ui.sector_analysis import show_sector_distribution
from ui.realtime_prices import show_realtime_prices
from ui.logs import show_logs
from ui.ai_recommendations import ai_recommendations
from ui.news import show_news

st.set_page_config(page_title='Stock Market Analyzer', layout='wide')

st.sidebar.title('Navigation')
page = st.sidebar.radio(
    'Go to',
    ['Dashboard', 'Portfolio Table', 'Sector Analysis', 'Real-Time Prices', 'AI Recommendations', 'Logs', 'News']
)

st.title('📊 Indian Stock Market Analyzer')

def main():
    df = upload_portfolio()
    if df is not None:
        if page == 'Dashboard':
            show_summary_cards(df)
        elif page == 'Portfolio Table':
            show_portfolio_table(df)
        elif page == 'Sector Analysis':
            show_sector_distribution(df)
        elif page == 'Real-Time Prices':
            show_realtime_prices(df)
        elif page == 'Logs':
            show_logs()
        elif page == 'AI Recommendations':
            ai_recommendations(df)
        elif page == 'News':
            show_news(df)
        else:
            st.info('Select a page from the sidebar.')
    else:
        st.info('Please upload your stock portfolio Excel file to begin analysis.')

if __name__ == '__main__':
    main()
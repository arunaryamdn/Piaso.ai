# File: /StockMarketAnalyser/StockMarketAnalyser/code/main.py

import streamlit as st
import pandas as pd
import yfinance as yf
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
from datetime import datetime, timedelta
from io import BytesIO
import os
import certifi

from utils.file_io import upload_portfolio
from utils.preprocess import preprocess_portfolio
from utils.risk import create_risk_profile
from utils.performance import get_historical_performance
from ui.dashboard import show_dashboard_page
from ui.portfolio_table import show_portfolio_table_page
from ui.sector_analysis import show_sector_analysis_page
from ui.realtime_prices import show_realtime_prices_page
from ui.ai_recommendations import show_ai_recommendations_page
from ui.news import show_news_page

# Fix SSL certificate issues
os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

# Theme configuration
def apply_theme():
    st.markdown("""
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
            /* App background */
            .stApp {
                background: linear-gradient(135deg, #f9fafc 0%, #e7eaf6 100%) !important;
                color: #22223b !important;
                font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
            }
            /* Sidebar */
            .stSidebarContent {
                background: #fff !important;
                border-radius: 1.5rem !important;
                margin: 1rem 0.5rem 1rem 0.5rem !important;
                box-shadow: 0 4px 24px rgba(0,0,0,0.07);
            }
            /* Radio buttons - make selected indicator and label black */
            div[role="radiogroup"] > label[data-baseweb="radio"] > div:first-child {
                border-color: #22223b !important;
            }
            div[role="radiogroup"] > label[data-baseweb="radio"][aria-checked="true"] > div:first-child {
                background-color: #22223b !important;
                border-color: #22223b !important;
            }
            div[role="radiogroup"] > label[data-baseweb="radio"][aria-checked="true"] > div:nth-child(2) {
                color: #22223b !important;
            }
            /* ...rest of your CSS... */
        </style>
    """, unsafe_allow_html=True)

# Configure the page
def main():
    st.set_page_config(
        page_title="📊 Stock Market Analyzer",
        layout="wide",
        initial_sidebar_state="auto"
    )
    # Theme selection in sidebar
    st.sidebar.title('Settings')
    theme = st.sidebar.radio('Theme', ['Light', 'Dark'], key='theme_selector')
    st.session_state['theme'] = theme
    apply_theme()
    # Navigation with icons
    st.sidebar.title('Navigation')
    page = st.sidebar.radio(
        'Go to',
        ['📊 Dashboard', '📋 Portfolio Table', '📈 Sector Analysis', '💹 Real-Time Prices', '🤖 AI Recommendations', '📰 News']
    )
    # Remove icons from page name for processing
    page = page.split(' ', 1)[1]
    st.title('📊 Indian Stock Market Analyzer')
    st.markdown("---")
    df = upload_portfolio()
    if df is not None:
        df = preprocess_portfolio(df)
        if page == 'Dashboard':
            show_dashboard_page(df, theme)
        elif page == 'Portfolio Table':
            show_portfolio_table_page(df)
        elif page == 'Sector Analysis':
            show_sector_analysis_page(df)
        elif page == 'Real-Time Prices':
            show_realtime_prices_page(df)
        elif page == 'AI Recommendations':
            show_ai_recommendations_page(df)
        elif page == 'News':
            show_news_page(df)
        else:
            st.info('Select a page from the sidebar.')
    else:
        st.info('Please upload your stock portfolio Excel file to begin analysis.')

if __name__ == '__main__':
    main()
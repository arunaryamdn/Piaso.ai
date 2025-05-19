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
from utils.comparative import comparative_chart_controls, prepare_comparative_data, render_comparative_chart
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
def apply_theme(theme):
    if theme == 'Modern':
        st.markdown("""
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
                .stApp {
                    background: linear-gradient(135deg, #f9fafc 0%, #e7eaf6 100%) !important;
                    color: #22223b !important;
                    font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
                }
                .stSidebarContent {
                    background: #fff !important;
                    border-radius: 1.5rem !important;
                    margin: 1rem 0.5rem 1rem 0.5rem !important;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
                }
                .stButton>button, .stRadio>div {
                    border-radius: 0.5rem !important;
                }
                .stMetric {
                    border-radius: 1rem !important;
                    background: #f4f6fb !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    padding: 0.5rem 1rem;
                }
                .stDataFrame, .stTable {
                    border-radius: 1rem !important;
                    background: #fff !important;
                }
                .stPlotlyChart>div {
                    border-radius: 1rem !important;
                    background: #fff !important;
                }
                .stExpander {
                    border-radius: 1rem !important;
                }
                /* Custom logo */
                .stSidebar .sidebar-content:before {
                    content: url('https://img.icons8.com/ios-filled/50/22223b/line-chart.png');
                    display: block;
                    margin: 0 auto 1rem auto;
                    width: 48px;
                    height: 48px;
                }
            </style>
            <link rel="icon" href="https://img.icons8.com/ios-filled/50/22223b/line-chart.png" type="image/png">
        """, unsafe_allow_html=True)
    elif theme == 'Dark':
        st.markdown("""
            <style>
                .stApp {
                    background: linear-gradient(135deg, #232946 0%, #121629 100%) !important;
                    color: #f4f6fb !important;
                }
                .stSidebarContent {
                    background: #232946 !important;
                    color: #f4f6fb !important;
                }
                .stMetric, .stDataFrame, .stTable, .stPlotlyChart>div, .stExpander {
                    background: #232946 !important;
                    color: #f4f6fb !important;
                }
            </style>
        """, unsafe_allow_html=True)
    else:  # Light
        st.markdown("""
            <style>
                .stApp {
                    background: linear-gradient(135deg, #f9fafc 0%, #e7eaf6 100%) !important;
                    color: #22223b !important;
                }
                .stSidebarContent {
                    background: #fff !important;
                }
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
    theme = st.sidebar.radio('Theme', ['Light', 'Dark', 'Modern'], key='theme_selector')
    st.session_state['theme'] = theme
    apply_theme(theme)
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
        # Main navigation/pages
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
        # --- Comparative Chart Section ---
        st.markdown('---')
        st.header('📈 Comparative Chart')
        # Build all_data dict: symbol -> historical DataFrame (must have DATE, CLOSE)
        # Example assumes you have a function get_historical_performance(df) that returns a dict
        all_data = get_historical_performance(df)
        if all_data:
            dfs, mode, date_range, selected_symbols = comparative_chart_controls(all_data)
            comp_df = prepare_comparative_data(dfs, mode=mode)
            render_comparative_chart(comp_df, x_col='DATE', y_col='VALUE', group_col='LABEL', mode=mode)
        else:
            st.info('No historical data available for comparative chart.')
    else:
        st.info('Please upload your stock portfolio Excel file to begin analysis.')

if __name__ == '__main__':
    main()
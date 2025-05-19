import streamlit as st
import pandas as pd
import plotly.express as px
import logging

def show_sector_distribution(df):
    st.subheader('📊 Sector Distribution')
    sector_dist = df.groupby('Sector').sum(numeric_only=True).reset_index()
    fig = px.pie(sector_dist, values='Quantity Available', names='Sector', title='Portfolio Sector Distribution')
    st.plotly_chart(fig)
    logging.info('Sector distribution chart displayed.')

def show_sector_analysis_page(df):
    show_sector_distribution(df)
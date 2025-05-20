import streamlit as st
import pandas as pd
import requests
import plotly.express as px
import logging

BACKEND_URL = "http://localhost:8000/api"

def show_sector_distribution(df):
    st.subheader('📊 Sector Distribution')
    data = df.to_dict(orient='records')
    with st.spinner("Loading sector distribution..."):
        resp = requests.post(f"{BACKEND_URL}/sector_analysis", json={"portfolio": data})
        sector_dist = resp.json() if resp.status_code == 200 else []
    if sector_dist:
        sector_df = pd.DataFrame(sector_dist)
        fig = px.pie(sector_df, values='Quantity', names='Sector', title='Portfolio Sector Distribution')
        st.plotly_chart(fig)
    else:
        st.info("No sector data available.")

def show_sector_analysis_page(df):
    show_sector_distribution(df)
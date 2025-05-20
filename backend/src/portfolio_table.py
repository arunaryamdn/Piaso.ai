import streamlit as st
import pandas as pd
import requests
from io import BytesIO

BACKEND_URL = "http://localhost:8000/api"

def show_portfolio_table(df):
    st.subheader('📄 Portfolio Data')
    search = st.text_input('Search by Symbol or Sector')
    # Convert DataFrame to JSON for backend
    data = df.to_dict(orient='records')
    params = {"search": search} if search else {}
    with st.spinner("Loading portfolio table..."):
        resp = requests.post(f"{BACKEND_URL}/portfolio_table", json={"portfolio": data, **params})
        table_data = resp.json() if resp.status_code == 200 else []
    filtered = pd.DataFrame(table_data)
    if not filtered.empty:
        st.dataframe(filtered)
        # Download button using backend-generated Excel file
        excel_resp = requests.post(f"{BACKEND_URL}/portfolio_excel", json={"portfolio": data, **params})
        if excel_resp.status_code == 200:
            st.download_button('Download Portfolio as Excel', excel_resp.content, file_name='portfolio.xlsx')
    else:
        st.info("No data to display.")

def show_portfolio_table_page(df):
    show_portfolio_table(df)
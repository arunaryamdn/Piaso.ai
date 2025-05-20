import streamlit as st
import pandas as pd
import requests

BACKEND_URL = "http://localhost:8000/api"

def ai_recommendations(df):
    st.subheader('🤖 Advanced AI Stock Recommendations')
    st.info('These recommendations use your portfolio and backend analytics. For real investment decisions, always consult a financial advisor.')
    data = df.to_dict(orient='records')
    with st.spinner("Fetching AI recommendations from backend..."):
        resp = requests.post(f"{BACKEND_URL}/ai_recommendations", json={"portfolio": data})
        recs = resp.json() if resp.status_code == 200 else []
    if recs:
        recs_df = pd.DataFrame(recs)
        st.dataframe(recs_df)
    else:
        st.info("No recommendations available.")

def show_ai_recommendations_page(df):
    ai_recommendations(df)
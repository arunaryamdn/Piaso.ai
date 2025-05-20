import streamlit as st
import requests

BACKEND_URL = "http://localhost:8000/api"

def show_logs():
    st.header("📜 Application Logs")
    with st.spinner("Fetching logs from backend..."):
        resp = requests.get(f"{BACKEND_URL}/logs")
        logs = resp.json() if resp.status_code == 200 else []
    if logs:
        for entry in logs:
            st.text(entry)
    else:
        st.info("No logs available.")

def show_logs_page():
    show_logs()
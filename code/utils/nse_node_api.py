import streamlit as st
import requests
import time

NODE_API_URL = "http://localhost:3000/api"

@st.cache_data(show_spinner=False)
def get_nse_historical(symbol, start_date, end_date):
    url = f"{NODE_API_URL}/equity/historical/{symbol}"
    params = {"from": start_date, "to": end_date}
    print(f"[DEBUG] Calling: {url} with params: {params}")
    retries = 3
    for attempt in range(retries):
        try:
            response = requests.get(url, params=params, timeout=30)
            print(f"[DEBUG] Response status: {response.status_code}")
            if response.status_code == 200:
                print(f"[DEBUG] Response JSON: {response.json()}")
                return response.json()
            else:
                print(f"[DEBUG] Non-200 response: {response.text}")
        except Exception as e:
            print(f"[DEBUG] Exception during API call (attempt {attempt+1}): {e}")
        if attempt < retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
    return None

@st.cache_data(show_spinner=False)
def get_nse_quote(symbol):
    url = f"{NODE_API_URL}/equity/quote/{symbol}"
    print(f"[DEBUG] Calling: {url}")
    retries = 3
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=30)
            print(f"[DEBUG] Response status: {response.status_code}")
            if response.status_code == 200:
                print(f"[DEBUG] Response JSON: {response.json()}")
                return response.json()
            else:
                print(f"[DEBUG] Non-200 response: {response.text}")
        except Exception as e:
            print(f"[DEBUG] Exception during API call (attempt {attempt+1}): {e}")
        if attempt < retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
    return None

def normalize_nse_historical_response(nse_data):
    if isinstance(nse_data, list) and len(nse_data) > 0 and 'data' in nse_data[0]:
        return nse_data[0]['data']
    elif isinstance(nse_data, dict) and 'data' in nse_data:
        return nse_data['data']
    return None 
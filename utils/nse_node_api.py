import requests

NODE_API_URL = "http://localhost:3000/api"

def get_nse_historical(symbol, start_date, end_date):
    url = f"{NODE_API_URL}/equity/historical/{symbol}"
    params = {"from": start_date, "to": end_date}
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass
    return None

def get_nse_quote(symbol):
    url = f"{NODE_API_URL}/equity/quote/{symbol}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass
    return None 
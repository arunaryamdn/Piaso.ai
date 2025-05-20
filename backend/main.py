# File: /StockMarketAnalyser/StockMarketAnalyser/code/main.py

import os
import certifi
import numpy as np

# --- FastAPI Imports and Setup ---
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
from utils.portfolio import (
    calculate_portfolio_metrics,
    fetch_realtime_prices,
    get_ai_recommendations,
    get_historical_performance,
    create_risk_profile,
    get_news,
    get_sector_analysis,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:800"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

portfolio_df = None  # Global for demo

@app.post("/api/upload-portfolio")
async def upload_portfolio(file: UploadFile = File(...)):
    global portfolio_df
    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))
    df = fetch_realtime_prices(df)  # Normalizes columns
    portfolio_df = df
    preview = df.head().replace([np.inf, -np.inf], np.nan).fillna(0).to_dict(orient="records")
    return {"preview": preview}

@app.get("/api/portfolio")
def get_portfolio():
    global portfolio_df
    if portfolio_df is None:
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    df = portfolio_df.replace([np.inf, -np.inf], np.nan).fillna(0)
    return df.to_dict(orient="records")

@app.get("/api/dashboard")
def get_dashboard():
    global portfolio_df
    if portfolio_df is None:
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    metrics = calculate_portfolio_metrics(portfolio_df)
    return metrics

@app.get("/api/sector_analysis")
def sector_analysis():
    global portfolio_df
    if portfolio_df is None:
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    return get_sector_analysis(portfolio_df)

@app.get("/api/realtime_prices")
def realtime_prices():
    global portfolio_df
    if portfolio_df is None:
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    df = fetch_realtime_prices(portfolio_df)
    return df.to_dict(orient="records")

@app.get("/api/ai_recommendations")
def ai_recommendations():
    global portfolio_df
    if portfolio_df is None:
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    return get_ai_recommendations(portfolio_df)

@app.get("/api/news")
def news():
    global portfolio_df
    if portfolio_df is None:
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    return get_news(portfolio_df)

@app.get("/api/historical")
def historical_performance(days: int = 30):
    global portfolio_df
    if portfolio_df is None:
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    data = get_historical_performance(portfolio_df, days=days)
    return data

@app.get("/api/risk")
def risk_metrics(days: int = 30):
    global portfolio_df
    if portfolio_df is None:
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    hist_data = get_historical_performance(portfolio_df, days=days)
    risk = create_risk_profile(portfolio_df, hist_data)
    return risk

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
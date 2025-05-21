# File: /StockMarketAnalyser/StockMarketAnalyser/code/main.py

import os
import certifi
import numpy as np
import logging

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

logging.basicConfig(level=logging.DEBUG)

app = FastAPI(
    title="Paiso.ai API",
    description="Backend API for Paiso.ai: Modern Indian stock market portfolio analytics platform.",
    version="1.0.0"
)

# CORS middleware must be set up before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

portfolio_df = None  # Global for demo

@app.post("/api/upload-portfolio")
async def upload_portfolio(file: UploadFile = File(...)):
    logging.debug("Received upload-portfolio request")
    global portfolio_df
    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))
    # Normalize column names: lowercase and strip spaces
    df.columns = [col.strip().lower() for col in df.columns]
    print('Columns after normalization:', df.columns.tolist())
    if 'ticker' not in df.columns and 'symbol' in df.columns:
        df = df.rename(columns={'symbol': 'ticker'})
        print('Columns after renaming symbol to ticker:', df.columns.tolist())
    prices_df = fetch_realtime_prices(df)
    # Merge real-time prices into the original DataFrame on 'ticker' (all lowercase)
    prices_df = prices_df.rename(columns={
        'Ticker': 'ticker',
        'Live_Price': 'live_price',
        'Status': 'status',
        'Source': 'source',
        'Error': 'error'
    })
    df = pd.merge(
        df,
        prices_df[['ticker', 'live_price', 'status', 'source', 'error']],
        on='ticker',
        how='left'
    )
    portfolio_df = df
    logging.debug(f"Portfolio DataFrame after price fetch: {df.head()}")
    preview = df.head().replace([np.inf, -np.inf], np.nan).fillna(0).to_dict(orient="records")
    return {"preview": preview}

@app.get("/api/portfolio")
def get_portfolio():
    logging.debug("Received get-portfolio request")
    global portfolio_df
    if portfolio_df is None:
        logging.error("No portfolio uploaded")
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    df = portfolio_df.replace([np.inf, -np.inf], np.nan).fillna(0)
    logging.debug(f"Returning portfolio DataFrame: {df.head()}")
    return df.to_dict(orient="records")

@app.get("/api/dashboard")
def get_dashboard():
    logging.debug("Received get-dashboard request")
    global portfolio_df
    if portfolio_df is None:
        logging.error("No portfolio uploaded")
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    metrics = calculate_portfolio_metrics(portfolio_df)
    logging.debug(f"Dashboard metrics: {metrics}")
    return metrics

@app.get("/api/sector_analysis")
def sector_analysis():
    logging.debug("Received get-sector_analysis request")
    global portfolio_df
    if portfolio_df is None:
        logging.error("No portfolio uploaded")
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    result = get_sector_analysis(portfolio_df)
    logging.debug(f"Sector analysis result: {result}")
    return result

@app.get("/api/realtime_prices")
def realtime_prices():
    logging.debug("Received get-realtime_prices request")
    global portfolio_df
    if portfolio_df is None:
        logging.error("No portfolio uploaded")
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    df = fetch_realtime_prices(portfolio_df)
    logging.debug(f"Realtime prices DataFrame: {df.head()}")
    return df.to_dict(orient="records")

@app.get("/api/ai_recommendations")
def ai_recommendations():
    logging.debug("Received get-ai_recommendations request")
    global portfolio_df
    if portfolio_df is None:
        logging.error("No portfolio uploaded")
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    result = get_ai_recommendations(portfolio_df)
    logging.debug(f"AI recommendations: {result}")
    return result

@app.get("/api/news")
def news():
    logging.debug("Received get-news request")
    global portfolio_df
    if portfolio_df is None:
        logging.error("No portfolio uploaded")
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    result = get_news(portfolio_df)
    logging.debug(f"News result: {result}")
    return result

@app.get("/api/historical")
def historical_performance(days: int = 30):
    logging.debug(f"Received get-historical request for {days} days")
    global portfolio_df
    if portfolio_df is None:
        logging.error("No portfolio uploaded")
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    data = get_historical_performance(portfolio_df, days=days)
    logging.debug(f"Historical performance data: {data[:5]}")
    return data

@app.get("/api/risk")
def risk_metrics(days: int = 30):
    logging.debug(f"Received get-risk request for {days} days")
    global portfolio_df
    if portfolio_df is None:
        logging.error("No portfolio uploaded")
        raise HTTPException(status_code=404, detail="No portfolio uploaded")
    hist_data = get_historical_performance(portfolio_df, days=days)
    risk = create_risk_profile(portfolio_df, hist_data)
    logging.debug(f"Risk metrics: {risk}")
    return risk

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
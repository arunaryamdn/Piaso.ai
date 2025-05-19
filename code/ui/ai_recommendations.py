import streamlit as st
import pandas as pd
import plotly.express as px
import logging
import yfinance as yf

def ai_recommendations(df):
    st.subheader('🤖 Advanced AI Stock Recommendations')
    st.info('These recommendations use your portfolio, real-time prices, and simulated financial/market data. For real investment decisions, always consult a financial advisor.')
    recs = []
    import random
    for idx, row in df.iterrows():
        symbol = row['Symbol']
        avg_price = row['Average Price']
        qty = row['Quantity Available']
        prev_close = row['Previous Closing Price']
        unrealized_pnl = row['Unrealized P&L']
        sector = row.get('Sector', 'Unknown')
        revenue_growth = random.uniform(-10, 25)  # %
        profit_margin = random.uniform(-5, 30)    # %
        debt_equity = random.uniform(0, 2.5)      # ratio
        cash_flow = random.choice(['Strong', 'Moderate', 'Weak'])
        pe = random.uniform(5, 60)
        pb = random.uniform(0.5, 10)
        sector_pe = 25 if sector.lower() in ['it', 'pharma', 'auto', 'banking'] else 18
        news_sentiment = random.choice(['Positive', 'Neutral', 'Negative'])
        holding_period = random.randint(2, 48)
        concentration = 'High' if qty > df['Quantity Available'].mean() * 2 else 'Normal'
        try:
            ticker = yf.Ticker(symbol + ".NS")
            live_price = ticker.history(period='1d').iloc[-1]['Close']
        except Exception:
            live_price = prev_close
        reasons = []
        if revenue_growth > 10 and profit_margin > 10 and cash_flow == 'Strong' and debt_equity < 1:
            fin_health = 'Excellent'
            reasons.append('Strong revenue growth, high profit margin, low debt, and strong cash flow.')
        elif revenue_growth < 0 or profit_margin < 5 or cash_flow == 'Weak' or debt_equity > 2:
            fin_health = 'Weak'
            reasons.append('Weak financials: low growth, low margin, high debt, or weak cash flow.')
        else:
            fin_health = 'Moderate'
            reasons.append('Average financial health.')
        if pe < sector_pe * 0.7 and pb < 2:
            valuation = 'Undervalued'
            reasons.append('Stock appears undervalued compared to sector.')
        elif pe > sector_pe * 1.5 or pb > 5:
            valuation = 'Overvalued'
            reasons.append('Stock appears overvalued compared to sector.')
        else:
            valuation = 'Fair'
            reasons.append('Valuation is in line with sector.')
        if news_sentiment == 'Positive':
            reasons.append('Recent news sentiment is positive.')
        elif news_sentiment == 'Negative':
            reasons.append('Recent news sentiment is negative.')
        sector_type = 'Cyclical' if sector.lower() in ['auto', 'it', 'banking'] else 'Defensive'
        if sector_type == 'Cyclical' and revenue_growth > 10:
            reasons.append('Cyclical sector with strong growth.')
        elif sector_type == 'Defensive' and profit_margin > 10:
            reasons.append('Defensive sector with healthy margins.')
        if concentration == 'High':
            reasons.append('High concentration in this stock. Consider diversification.')
        if holding_period < 6 and unrealized_pnl < 0:
            reasons.append('Short holding period and current loss. Consider patience before acting.')
        if fin_health == 'Excellent' and valuation == 'Undervalued' and news_sentiment == 'Positive' and unrealized_pnl < 0:
            rec = 'Buy More'
            main_reason = 'Excellent fundamentals, undervalued, positive news, and current dip.'
        elif fin_health == 'Weak' or news_sentiment == 'Negative' or valuation == 'Overvalued':
            rec = 'Sell'
            main_reason = 'Weak fundamentals, negative news, or overvaluation.'
        elif unrealized_pnl > 0 and live_price > avg_price * 1.2:
            rec = 'Sell'
            main_reason = 'Significant profit (>20%). Consider booking gains.'
        elif concentration == 'High' and unrealized_pnl < 0:
            rec = 'Reduce'
            main_reason = 'High concentration and current loss. Reduce exposure.'
        else:
            rec = 'Hold'
            main_reason = 'No strong buy/sell signal. Hold and monitor.'
        explain = f"{main_reason} Details: {'; '.join(reasons)}"
        recs.append({
            'Symbol': symbol,
            'Live Price (₹)': f"{live_price:,.2f}",
            'Unrealized P&L': f"{unrealized_pnl:,.2f}",
            'Financial Health': fin_health,
            'Valuation': valuation,
            'News': news_sentiment,
            'Sector': sector,
            'Sector Type': sector_type,
            'Holding (mo)': holding_period,
            'Concentration': concentration,
            'Recommendation': rec,
            'Reason': explain
        })
    recs_df = pd.DataFrame(recs)
    st.dataframe(recs_df, use_container_width=True, hide_index=True)

def show_ai_recommendations_page(df):
    ai_recommendations(df)
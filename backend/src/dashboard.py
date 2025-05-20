import streamlit as st
import requests
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

BACKEND_URL = "http://localhost:8000/api"

def show_summary_cards(api_data):
    """Display summary cards with key portfolio metrics from backend response."""
    metrics = api_data.get('metrics', {})
    with st.container():
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Investment", f"₹{metrics.get('total_investment', 0):,.2f}")
        with col2:
            st.metric("Current Value", f"₹{metrics.get('total_value', 0):,.2f}", 
                     delta=f"{metrics.get('pl_percent', 0):.2f}%")
        with col3:
            pl_color = "inverse" if metrics.get('total_pl', 0) < 0 else "normal"
            st.metric("Total P/L", f"₹{metrics.get('total_pl', 0):,.2f}", 
                     delta=f"{metrics.get('pl_percent', 0):.2f}%", 
                     delta_color=pl_color)
        with col4:
            st.metric("Stocks", f"{metrics.get('num_stocks', 0)}", 
                     delta=f"🟢 {metrics.get('profit_stocks', 0)} | 🔴 {metrics.get('loss_stocks', 0)}")
    # Portfolio Distribution Chart
    with st.container():
        st.subheader("Portfolio Distribution")
        dist = api_data.get('distribution', {})
        if dist:
            fig = px.pie(pd.DataFrame(dist), values='Current_Value', names='Stock',
                         title='Portfolio Value Distribution',
                         template="plotly_dark" if st.session_state.get('theme', 'Light') == "Dark" else "plotly_white")
            st.plotly_chart(fig, use_container_width=True)
    # Top Performers and Losers
    with st.container():
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Top Performers")
            top_perf = pd.DataFrame(api_data.get('top_performers', []))
            if not top_perf.empty:
                fig = px.bar(top_perf, x='Stock', y='P/L_Percent',
                            title='Top 3 Performing Stocks',
                            labels={'P/L_Percent': 'Profit/Loss %'},
                            template="plotly_dark" if st.session_state.get('theme', 'Light') == "Dark" else "plotly_white")
                st.plotly_chart(fig, use_container_width=True)
        with col2:
            st.subheader("Top Losers")
            top_loss = pd.DataFrame(api_data.get('top_losers', []))
            if not top_loss.empty:
                fig = px.bar(top_loss, x='Stock', y='P/L_Percent',
                            title='Top 3 Losing Stocks',
                            labels={'P/L_Percent': 'Profit/Loss %'},
                            template="plotly_dark" if st.session_state.get('theme', 'Light') == "Dark" else "plotly_white")
                st.plotly_chart(fig, use_container_width=True)

def show_dashboard_page(df, theme):
    # Upload portfolio to backend and get analytics
    with st.spinner("Loading dashboard analytics..."):
        # Convert DataFrame to JSON for backend
        data = df.to_dict(orient='records')
        resp = requests.post(f"{BACKEND_URL}/dashboard", json={"portfolio": data})
        api_data = resp.json() if resp.status_code == 200 else {}
    show_summary_cards(api_data)
    st.subheader("📈 Historical Performance")
    lookback_days = st.slider(
        "Select performance window (days)",
        min_value=7,
        max_value=90,
        value=30,
        help="Choose the time period for historical analysis"
    )
    # Fetch historical performance from backend
    with st.spinner("Loading historical performance..."):
        hist_resp = requests.post(f"{BACKEND_URL}/historical", json={"portfolio": data, "days": lookback_days})
        hist_data = hist_resp.json() if hist_resp.status_code == 200 else {}
    if hist_data and 'Portfolio_Value' in hist_data:
        hist_df = pd.DataFrame(hist_data)
        fig = px.line(
            hist_df,
            x=hist_df.index,
            y='Portfolio_Value',
            title="Portfolio Value Over Time",
            labels={'Portfolio_Value': 'Value (₹)', 'index': 'Date'},
            template="plotly_dark" if theme == "Dark" else "plotly_white"
        )
        fig.update_layout(height=400, margin=dict(l=20, r=20, t=40, b=20), hovermode='x unified')
        fig.update_traces(mode='lines+markers', line=dict(width=2), marker=dict(size=6))
        st.plotly_chart(fig, use_container_width=True)
        with st.expander("Show Raw Historical Data Table"):
            st.dataframe(hist_df[["Portfolio_Value"]], use_container_width=True)
    st.subheader("📉 Risk Metrics")
    # Fetch risk metrics from backend
    with st.spinner("Loading risk metrics..."):
        risk_resp = requests.post(f"{BACKEND_URL}/risk", json={"portfolio": data})
        risk_profile = risk_resp.json() if risk_resp.status_code == 200 else {}
    with st.container():
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric(
                "Volatility",
                f"{risk_profile.get('volatility', 0):.2f}%" if risk_profile.get('volatility') else "N/A",
                help="Annualized volatility of portfolio returns"
            )
        with col2:
            st.metric(
                "Max Drawdown",
                f"{risk_profile.get('max_drawdown', 0):.2f}%" if risk_profile.get('max_drawdown') else "N/A",
                help="Maximum observed loss from peak to trough"
            )
        with col3:
            st.metric(
                "Top Sector",
                f"{risk_profile.get('top_sector', 'N/A')} ({risk_profile.get('top_sector_exposure', 0):.2f}%)",
                help="Sector with highest exposure in portfolio"
            )
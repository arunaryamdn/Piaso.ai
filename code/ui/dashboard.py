import streamlit as st
from io import BytesIO
import pandas as pd
import logging
import plotly.express as px
import plotly.graph_objects as go
from utils.performance import get_historical_performance
from utils.risk import create_risk_profile
import numpy as np

def show_summary_cards(df):
    """Display summary cards with key portfolio metrics."""
    # Calculate basic metrics
    total_investment = df['Investment'].sum()
    total_value = df['Current_Value'].sum()
    total_pl = total_value - total_investment
    pl_percent = (total_pl / total_investment * 100) if total_investment > 0 else 0
    # Responsive summary cards
    with st.container():
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Investment", f"₹{total_investment:,.2f}")
        with col2:
            st.metric("Current Value", f"₹{total_value:,.2f}", 
                     delta=f"{pl_percent:.2f}%")
        with col3:
            pl_color = "normal" if total_pl == 0 else ("inverse" if total_pl < 0 else "normal")
            st.metric("Total P/L", f"₹{total_pl:,.2f}", 
                     delta=f"{pl_percent:.2f}%", 
                     delta_color=pl_color)
        with col4:
            profit_stocks = len(df[df['P/L'] > 0])
            loss_stocks = len(df[df['P/L'] < 0])
            st.metric("Stocks", f"{len(df)}", 
                     delta=f"🟢 {profit_stocks} | 🔴 {loss_stocks}")
    # Get current theme
    theme = st.session_state.get('theme', 'Light')
    # Portfolio Distribution Chart
    with st.container():
        st.subheader("Portfolio Distribution")
        fig = px.pie(df, values='Current_Value', names='Stock',
                     title='Portfolio Value Distribution',
                     template="plotly_dark" if theme == "Dark" else "plotly_white")
        st.plotly_chart(fig, use_container_width=True)
    # Top Performers and Losers
    with st.container():
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Top Performers")
            top_performers = df.nlargest(3, 'P/L_Percent')
            fig = px.bar(top_performers, x='Stock', y='P/L_Percent',
                        title='Top 3 Performing Stocks',
                        labels={'P/L_Percent': 'Profit/Loss %'},
                        template="plotly_dark" if theme == "Dark" else "plotly_white")
            st.plotly_chart(fig, use_container_width=True)
        with col2:
            st.subheader("Top Losers")
            top_losers = df.nsmallest(3, 'P/L_Percent')
            fig = px.bar(top_losers, x='Stock', y='P/L_Percent',
                        title='Top 3 Losing Stocks',
                        labels={'P/L_Percent': 'Profit/Loss %'},
                        template="plotly_dark" if theme == "Dark" else "plotly_white")
            st.plotly_chart(fig, use_container_width=True)
    # Force reset index to ensure uniqueness
    df = df.reset_index(drop=True)
    logging.info(f'Metrics calculated: Value={total_value}, P&L={total_pl}, Pct={pl_percent}')

def show_dashboard_page(df, theme):
    # Summary cards and portfolio overview
    metrics_container = st.container()
    with metrics_container:
        show_summary_cards(df)
    st.subheader("📈 Historical Performance")
    lookback_days = st.slider(
        "Select performance window (days)",
        min_value=7,
        max_value=90,
        value=30,
        help="Choose the time period for historical analysis"
    )
    # Skeleton placeholders
    table_placeholder = st.empty()
    chart_placeholder = st.empty()
    # Show skeletons while loading
    skeleton_df = pd.DataFrame(np.nan, index=pd.date_range(pd.Timestamp.today() - pd.Timedelta(days=lookback_days), periods=lookback_days), columns=["Loading..."])
    table_placeholder.dataframe(skeleton_df, use_container_width=True)
    skeleton_fig = go.Figure()
    skeleton_fig.add_scatter(x=skeleton_df.index, y=[None]*len(skeleton_df), mode="lines+markers", line=dict(color="#ccc", width=2))
    skeleton_fig.update_layout(title="Loading Portfolio Value Over Time...", height=400, margin=dict(l=20, r=20, t=40, b=20))
    chart_placeholder.plotly_chart(skeleton_fig, use_container_width=True)
    # Fetch data
    hist_data = get_historical_performance(df, days=lookback_days)
    risk_profile = create_risk_profile(df, hist_data)
    # Replace skeletons with real data
    if hist_data is not None and hist_data['Portfolio_Value'].sum() > 0:
        # Responsive chart
        chart_container = st.container()
        with chart_container:
            fig = px.line(
                hist_data,
                x=hist_data.index,
                y='Portfolio_Value',
                title="Portfolio Value Over Time",
                labels={'Portfolio_Value': 'Value (₹)', 'index': 'Date'},
                template="plotly_dark" if theme == "Dark" else "plotly_white"
            )
            fig.update_layout(
                height=400,
                margin=dict(l=20, r=20, t=40, b=20),
                hovermode='x unified'
            )
            fig.update_traces(
                mode='lines+markers',
                line=dict(width=2),
                marker=dict(size=6)
            )
            chart_placeholder.plotly_chart(fig, use_container_width=True)
        # Show real table in an expander for advanced users
        with st.expander("Show Raw Historical Data Table"):
            table_placeholder.dataframe(hist_data[["Portfolio_Value"]], use_container_width=True)
        st.subheader("📉 Risk Metrics")
        # Responsive risk metrics
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
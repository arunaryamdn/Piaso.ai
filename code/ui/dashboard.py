import streamlit as st
from io import BytesIO
import pandas as pd
import logging

def show_summary_cards(df):
    total_value = (df['Quantity Available'] * df['Previous Closing Price']).sum()
    total_profit = df['Unrealized P&L'].sum()
    invested_amount = (df['Quantity Available'] * df['Average Price']).sum()
    total_profit_pct = (total_profit / invested_amount) * 100 if invested_amount != 0 else 0
    col1, col2, col3 = st.columns(3)
    col1.metric('Total Portfolio Value', f'₹{total_value:,.2f}')
    col2.metric('Total Unrealized P&L', f'₹{total_profit:,.2f}', f'{total_profit_pct:.2f}%')
    col3.metric('Invested Amount', f'₹{invested_amount:,.2f}')
    logging.info(f'Metrics calculated: Value={total_value}, P&L={total_profit}, Pct={total_profit_pct}')
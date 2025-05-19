import streamlit as st
import pandas as pd
from io import BytesIO
import logging
from utils.excel_helper import to_excel

def show_portfolio_table(df):
    st.subheader('📄 Portfolio Data')
    search = st.text_input('Search by Symbol or Sector')
    if search:
        filtered = df[df['Symbol'].str.contains(search, case=False) | df['Sector'].str.contains(search, case=False)]
    else:
        filtered = df
    def highlight_pnl(val):
        color = 'green' if val > 0 else 'red' if val < 0 else 'black'
        return f'color: {color}'
    st.dataframe(filtered.style.applymap(highlight_pnl, subset=['P/L']))
    st.download_button('Download Portfolio as Excel', to_excel(filtered), file_name='portfolio.xlsx')
    logging.info('Displayed portfolio table.')

def show_portfolio_table_page(df):
    show_portfolio_table(df)
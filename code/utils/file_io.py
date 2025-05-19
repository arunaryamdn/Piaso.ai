import streamlit as st
import pandas as pd
import plotly.express as px
import logging
from io import BytesIO
import xlsxwriter

def read_portfolio(uploaded_file):
    return pd.read_excel(uploaded_file, sheet_name='Equity')

def to_excel(df):
    """Convert DataFrame to an Excel file in memory with formatting."""
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df_export = df.copy()
        df_export.to_excel(writer, index=False, sheet_name='Portfolio')

        workbook = writer.book
        worksheet = writer.sheets['Portfolio']

        # Define formats
        money_fmt = workbook.add_format({'num_format': '₹#,##0.00'})  # type: ignore
        percent_fmt = workbook.add_format({'num_format': '0.00%'})  # type: ignore

        # Auto-format key financial columns
        for i, col in enumerate(df_export.columns):
            if col in ['Current_Price', 'Avg_Price', 'Investment', 'Current_Value', 'P/L']:
                worksheet.set_column(i, i, 14, money_fmt)
            elif col in ['P/L_Percent', 'CAGR']:
                worksheet.set_column(i, i, 12, percent_fmt)
            else:
                worksheet.set_column(i, i, 18)  # default width

    output.seek(0)
    return output.getvalue()

def upload_portfolio():
    """Handle portfolio file upload and validation for holdings-FU4375 format."""
    uploaded_file = st.sidebar.file_uploader("Upload your Excel file with portfolio data", type=["xlsx", "xls"])
    
    if not uploaded_file:
        st.info("📤 Please upload your Excel file through the sidebar to begin analysis.")
        st.subheader("📋 Required Excel Format")
        st.write("""
        Your Excel file should contain the following columns:
        - *Symbol*: Stock symbol (without .NS extension)
        - *Sector*: Sector name
        - *Quantity Available*: Number of shares owned
        - *Quantity Pledged Average Price*: Average purchase price per share
        - *Previous Closing Price*: Latest price per share
        """)
        sample_df = pd.DataFrame({
            'Symbol': ['RELIANCE', 'TCS'],
            'Sector': ['ENERGY', 'IT'],
            'Quantity Available': [10, 5],
            'Quantity Pledged Average Price': [2100, 3500],
            'Previous Closing Price': [2500, 3700]
        })
        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
            sample_df.to_excel(writer, index=False, sheet_name='Portfolio')
        st.download_button("Download Template Excel", data=buffer.getvalue(), 
                         file_name="portfolio_template.xlsx", 
                         mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        return None

    try:
        df = pd.read_excel(uploaded_file)
        # Remove duplicate columns if any
        df = df.loc[:, ~df.columns.duplicated()]
        # Remove duplicate index labels if any
        df = df[~df.index.duplicated(keep='first')]
        df = df.dropna(how='all')
        required_columns = {'Symbol', 'Sector', 'Quantity Available', 'Average Price', 'Previous Closing Price'}
        if not required_columns.issubset(df.columns):
            missing = required_columns - set(df.columns)
            st.error(f"❌ Missing required columns: {', '.join(missing)}")
            return None
        # Rename columns to match app expectations
        df = df.rename(columns={
            'Symbol': 'Ticker',
            'Sector': 'Sector',
            'Quantity Available': 'Quantity',
            'Average Price': 'Avg_Price',
            'Previous Closing Price': 'Current_Price'
        })
        # Calculate investment, current value, P/L, P/L %
        df['Investment'] = df['Quantity'] * df['Avg_Price']
        df['Current_Value'] = df['Quantity'] * df['Current_Price']
        df['P/L'] = df['Current_Value'] - df['Investment']
        df['P/L_Percent'] = (df['P/L'] / df['Investment']) * 100
        # Ensure DataFrame index is unique to avoid duplicate label errors
        df = df.reset_index(drop=True)
        # Add 'Stock' column for dashboard plotting
        df['Stock'] = df['Ticker'] if 'Ticker' in df.columns else df['Symbol']
        # Diagnostic: Show column names and their counts
        # col_counts = pd.Series(df.columns).value_counts()
        # print('DataFrame columns and counts:', col_counts.to_dict())
        # st.write('**[DEBUG] DataFrame columns and counts:**', col_counts.to_dict())
        st.success("✅ Excel file loaded successfully!")
        return df
    except Exception as e:
        st.error(f"❌ Error reading Excel file: {e}")
        return None
import pandas as pd

def preprocess_portfolio(df):
    # Drop existing 'P/L' column if it exists
    if 'P/L' in df.columns:
        df = df.drop(columns=['P/L'])

    # Rename columns for consistency with the app
    df = df.rename(columns={
        'Quantity Available': 'Quantity',
        'Average Price': 'Average_Price',
        'Previous Closing Price': 'Current_Price',
        'Unrealized P&L': 'P/L',
        'Unrealized P&L Pct.': 'P/L_Pct'
    })

    # Calculate Investment and Current_Value if not present
    if 'Investment' not in df.columns:
        df['Investment'] = df['Quantity'] * df['Average_Price']
    if 'Current_Value' not in df.columns:
        df['Current_Value'] = df['Quantity'] * df['Current_Price']

    # Add Ticker column for yfinance (assume NSE stocks)
    if 'Ticker' not in df.columns:
        df['Ticker'] = df['Symbol'].apply(lambda x: f"{x}.NS" if not x.endswith('.NS') else x)

    # Fill missing columns with default values if needed
    for col in ['Sector', 'ISIN']:
        if col not in df.columns:
            df[col] = ''

    return df 
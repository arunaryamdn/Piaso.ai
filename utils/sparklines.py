import pandas as pd
import altair as alt
import base64
import streamlit as st

@st.cache_data(show_spinner=False)
def get_sparkline_base64(prices, color='blue', width=80, height=30):
    """
    Generate a mini sparkline as a base64-encoded PNG image for inline HTML display.
    """
    if not prices or any(p is None for p in prices):
        return ""  # No data
    df = pd.DataFrame({'x': range(len(prices)), 'y': prices})
    chart = alt.Chart(df).mark_line(
        color=color,
        strokeWidth=2
    ).encode(
        x=alt.X('x', axis=None),
        y=alt.Y('y', axis=None),
        tooltip=[alt.Tooltip('y', title='Close')]
    ).properties(width=width, height=height, padding=0)
    img = chart.to_image(format='png')
    b64 = base64.b64encode(img).decode()
    return f'<img src="data:image/png;base64,{b64}" style="display:block;margin:auto;" />'

def get_last_n_closes(symbol, n, historical_data):
    """
    Get the last n closing prices for a given symbol from historical_data dict.
    """
    df = historical_data.get(symbol)
    if df is not None and 'CLOSE' in df.columns:
        return df['CLOSE'].tail(n).tolist()
    return [None] * n  # fallback for missing data

def add_sparklines_to_df(df, historical_data, n=7, sparkline_col='Sparkline'):
    """
    Add a column with sparkline HTML images to the DataFrame.
    """
    sparkline_col_data = []
    for symbol in df['symbol']:
        prices = get_last_n_closes(symbol, n, historical_data)
        if prices and prices[0] is not None and prices[-1] is not None:
            color = 'green' if prices[-1] > prices[0] else 'red'
        else:
            color = 'blue'
        sparkline_html = get_sparkline_base64(prices, color=color)
        sparkline_col_data.append(sparkline_html)
    df = df.copy()
    df[sparkline_col] = sparkline_col_data
    return df

def render_portfolio_table_with_sparklines(df, sparkline_col='Sparkline'):
    """
    Render a DataFrame as an HTML table with inline sparklines for Streamlit.
    """
    headers = df.columns.tolist()
    html = "<table style='width:100%;border-collapse:collapse;'>"
    # Header
    html += "<tr>" + "".join([f"<th style='padding:4px;border-bottom:1px solid #ddd;'>{h}</th>" for h in headers]) + "</tr>"
    # Rows
    for _, row in df.iterrows():
        html += "<tr>"
        for h in headers:
            if h == sparkline_col:
                html += f"<td style='padding:2px;text-align:center;'>{row[h]}</td>"
            else:
                html += f"<td style='padding:4px;text-align:right;'>{row[h]}</td>"
        html += "</tr>"
    html += "</table>"
    st.markdown(html, unsafe_allow_html=True) 
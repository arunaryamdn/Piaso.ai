import streamlit as st
import pandas as pd
import plotly.express as px
import yfinance as yf
import logging
from io import BytesIO

# Setup logging
logging.basicConfig(
    filename='stock_analyzer.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

st.set_page_config(page_title='Stock Market Analyzer', layout='wide')

# Sidebar navigation
st.sidebar.title('Navigation')
page = st.sidebar.radio('Go to', ['Dashboard', 'Portfolio Table', 'Sector Analysis', 'Real-Time Prices', 'AI Recommendations', 'Logs'])

st.title('📊 Indian Stock Market Analyzer')

# Helper for download
@st.cache_data
def to_excel(df):
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Portfolio')
    return output.getvalue()

# Upload and process
@st.cache_data
def read_portfolio(uploaded_file):
    return pd.read_excel(uploaded_file, sheet_name='Equity')

def upload_portfolio():
    uploaded_file = st.sidebar.file_uploader('Upload your stock portfolio (Excel format)', type=['xlsx'])
    if uploaded_file is not None:
        try:
            df = read_portfolio(uploaded_file)
            st.sidebar.success('File uploaded successfully!')
            logging.info('File uploaded and read successfully.')
            return df
        except FileNotFoundError as e:
            st.sidebar.error(f'File not found: {e}')
            logging.error(f'File not found: {e}')
        except Exception as e:
            st.sidebar.error(f'Error reading file: {e}')
            logging.error(f'Error reading file: {e}')
    else:
        st.sidebar.info('Please upload your stock portfolio Excel file to begin analysis.')
    return None

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

def show_portfolio_table(df):
    st.subheader('📄 Portfolio Data')
    search = st.text_input('Search by Symbol or Sector')
    if search:
        filtered = df[df['Symbol'].str.contains(search, case=False) | df['Sector'].str.contains(search, case=False)]
    else:
        filtered = df
    # Highlight gainers/losers
    def highlight_pnl(val):
        color = 'green' if val > 0 else 'red' if val < 0 else 'black'
        return f'color: {color}'
    st.dataframe(filtered.style.applymap(highlight_pnl, subset=['Unrealized P&L']))
    # Download button
    st.download_button('Download Portfolio as Excel', to_excel(filtered), file_name='portfolio.xlsx')
    logging.info('Displayed portfolio table.')

def show_sector_distribution(df):
    st.subheader('📊 Sector Distribution')
    sector_dist = df.groupby('Sector').sum(numeric_only=True).reset_index()
    fig = px.pie(sector_dist, values='Quantity Available', names='Sector', title='Portfolio Sector Distribution')
    st.plotly_chart(fig)
    logging.info('Sector distribution chart displayed.')

def show_realtime_prices(df):
    st.subheader('📈 Real-Time Stock Prices')
    refresh = st.button('Refresh Prices')
    failed = []
    prices_data = []
    for idx, row in df.iterrows():
        symbol = row['Symbol']
        avg_price = row['Average Price']
        try:
            ticker = yf.Ticker(str(symbol) + ".NS")
            live_price = ticker.history(period='1d').iloc[-1]['Close']
            live_price_str = f"{live_price:,.2f}"
        except Exception as e:
            failed.append(symbol)
            live_price = None
            live_price_str = 'N/A'
        # Determine color and status
        if live_price is not None:
            if avg_price < live_price:
                status = 'Live > Avg'
                color = 'lightgreen'
            elif avg_price > live_price:
                status = 'Avg > Live'
                color = 'lightcoral'
            else:
                status = 'Equal'
                color = 'khaki'
        else:
            status = 'N/A'
            color = 'lightgray'
        prices_data.append({
            'Symbol': symbol,
            'Avg Price (₹)': f"{avg_price:,.2f}",
            'Live Price (₹)': live_price_str,
            'Status': status,
            'Color': color
        })
        logging.info(f'Fetched live price for {symbol}: {live_price}')
    prices_df = pd.DataFrame(prices_data)
    # Only apply color styling if 'Color' column exists and is not empty
    if 'Color' in prices_df.columns and not prices_df['Color'].isnull().all():
        def highlight_status(row):
            color = row['Color'] if 'Color' in row else ''
            return [f'background-color: {color}; color: black; font-weight: bold' if col == 'Status' else '' for col in row.index]
        styled_df = prices_df.drop(columns=['Color']).style.apply(highlight_status, axis=1)
        st.dataframe(
            styled_df,
            use_container_width=True,
            hide_index=True
        )
    else:
        st.dataframe(prices_df, use_container_width=True, hide_index=True)
    if failed:
        with st.expander('Show Failed Ticker Fetches'):
            st.write('The following tickers could not be fetched (may be delisted or incorrect):')
            st.write(', '.join(map(str, failed)))

def show_logs():
    st.subheader('Debug Log (last 100 lines)')
    try:
        with open('stock_analyzer.log', 'r') as f:
            lines = f.readlines()[-100:]
            st.code(''.join(lines))
    except Exception as e:
        st.error(f'Could not read log file: {e}')

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
        # --- Simulated/GenAI Data ---
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
        # Try to get live price
        try:
            ticker = yf.Ticker(symbol + ".NS")
            live_price = ticker.history(period='1d').iloc[-1]['Close']
        except Exception:
            live_price = prev_close
        # --- Advanced GenAI Reasoning ---
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

def main():
    df = upload_portfolio()
    if df is not None:
        if page == 'Dashboard':
            show_summary_cards(df)
        elif page == 'Portfolio Table':
            show_portfolio_table(df)
        elif page == 'Sector Analysis':
            show_sector_distribution(df)
        elif page == 'Real-Time Prices':
            show_realtime_prices(df)
        elif page == 'Logs':
            show_logs()
        elif page == 'AI Recommendations':
            ai_recommendations(df)
        else:
            st.info('Select a page from the sidebar.')
    else:
        st.info('Please upload your stock portfolio Excel file to begin analysis.')

if __name__ == '__main__':
    main()
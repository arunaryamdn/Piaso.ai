📊 Indian Stock Market Analyzer
=============================

A comprehensive web application for analyzing Indian stock market portfolios, built with Streamlit.

Features
--------
1. Portfolio Analysis
   - Real-time stock price tracking
   - Profit/Loss calculation
   - Portfolio value distribution
   - Historical performance tracking
   - Risk metrics and analysis

2. Interactive Dashboard
   - Summary cards with key metrics
   - Portfolio distribution charts
   - Top performers and losers analysis
   - Sector-wise analysis
   - Real-time price updates

3. Advanced Analytics
   - Historical performance tracking
   - Risk profile analysis
   - Volatility metrics
   - Maximum drawdown calculation
   - Sector concentration analysis

4. AI-Powered Features
   - Investment recommendations
   - Market news integration
   - Portfolio insights
   - Risk assessment

5. Data Management
   - Excel file upload support
   - Data export functionality
   - Portfolio template download
   - Real-time data updates

5. Comparative Performance Charts
   - Compare multiple stocks or indices on a single interactive chart
   - Supports normalized, raw price, and percent change modes
   - User controls for symbol selection, date range, and chart mode

Setup Instructions
-----------------
1. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r code/requirements.txt
   ```

4. Run the application:
   ```bash
   streamlit run code/main.py
   ```

Required Excel Format
-------------------
Your portfolio Excel file should contain the following columns:
- Stock: Stock symbol (without .NS extension)
- Quantity: Number of shares owned
- Avg_Price: Average purchase price per share

Optional columns:
- Buy_Date: Date of purchase (for CAGR calculations)
- Alert_Price: Price target for alerts

Example:
```
Stock    | Quantity | Avg_Price | Buy_Date   | Alert_Price
---------|----------|-----------|------------|------------
RELIANCE | 10       | 2100      | 2022-01-15 | 2500
TCS      | 5        | 3500      | 2021-05-20 | 4000
```

Dependencies
-----------
- streamlit>=1.24.0
- pandas>=1.5.0
- plotly>=5.13.0
- yfinance>=0.2.18
- xlsxwriter>=3.0.0
- numpy>=1.23.0
- certifi>=2023.7.22
- requests>=2.31.0
- beautifulsoup4>=4.12.0
- nsepython>=1.0.0
- nsetools>=1.0.11
- altair>=5.0.0

Known Issues
-----------
1. SSL Certificate Issues
   - The application uses Yahoo Finance API (yfinance) to fetch stock data
   - Some users may experience SSL certificate errors
   - The app automatically attempts to use certifi package to resolve these issues
   - For problematic stocks, the app will try to use BSE data when NSE data is unavailable
   - If certain stocks don't load, try changing the stock symbol to use '.BO' suffix instead of '.NS'

2. Data Fetching
   - Some stocks might not be available through Yahoo Finance
   - In such cases, the app will attempt to fetch data from alternative sources
   - If data is still unavailable, those stocks will be marked with a warning

Support
-------
For issues and feature requests, please create an issue in the repository.

License
-------
This project is licensed under the MIT License - see the LICENSE file for details. 
# Indian Stock Market Analyzer

A modern, modular web application for analyzing Indian stock market portfolios. Built with a FastAPI backend, React frontend, and optional Streamlit UI for rapid prototyping.

## Features
- **Portfolio Analysis**: Real-time stock price tracking, profit/loss calculation, sector analysis, and risk metrics.
- **Interactive Dashboard**: Summary cards, distribution charts, top performers/losers, and historical performance.
- **AI-Powered Analytics**: Investment recommendations and portfolio insights.
- **News Integration**: Latest news for your portfolio holdings.
- **Excel Upload/Download**: Upload your portfolio in Excel format and export results.

## Architecture
- **Backend**: FastAPI (`backend/`)
  - All business logic and analytics in `backend/utils/`
  - Clean REST endpoints for all analytics features
- **Frontend**: React (`frontend/`)
  - Modern UI with charts (Recharts), tables, and cards
  - Calls backend endpoints for all analytics
- **Streamlit UI**: (`backend/ui/`)
  - Thin UI layer for rapid prototyping, now fully modularized

## Quick Start

### 1. Backend (FastAPI)
```pwsh
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (React)
```pwsh
cd ../frontend
npm install
npm start
```

### 3. (Optional) Streamlit UI
```pwsh
cd ../backend
streamlit run main.py
```

## Portfolio Excel Format
Your Excel file should have at least these columns:
- `Stock` or `Ticker`: Stock symbol (e.g., RELIANCE, TCS)
- `Quantity`: Number of shares
- `Avg_Price`: Average purchase price

Optional columns:
- `Buy_Date`, `Alert_Price`, `Sector`, etc.

## API Endpoints
- `POST /api/upload-portfolio` — Upload Excel file
- `GET /api/portfolio` — Get current portfolio
- `POST /api/dashboard` — Get dashboard metrics
- `POST /api/portfolio_table` — Get portfolio table (with search/filter)
- `POST /api/sector_analysis` — Get sector distribution
- `POST /api/realtime_prices` — Get real-time prices
- `POST /api/ai_recommendations` — Get AI recommendations
- `POST /api/news` — Get news for portfolio
- `POST /api/historical` — Get historical performance
- `POST /api/risk` — Get risk metrics

## Development Notes
- All business logic is in backend utility modules for maintainability.
- The React frontend is fully decoupled and communicates via REST API.
- Streamlit UI is now a thin client, calling backend endpoints only.

## Contributing
Pull requests and issues are welcome!

## License
MIT License

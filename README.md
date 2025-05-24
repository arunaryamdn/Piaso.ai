# Paiso.ai

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

---

# Comprehensive Documentation (for PDF Export)

## Overview

**Paiso.ai** is a modern, modular web application for analyzing Indian stock market portfolios. It features a FastAPI backend, a React frontend, and an optional Streamlit UI for rapid prototyping. The platform provides real-time analytics, beautiful dashboards, and robust error handling.

---

## Features

- **Portfolio Analysis:** Real-time stock price tracking, profit/loss calculation, sector analysis, and risk metrics.
- **Interactive Dashboard:** Summary cards, distribution charts, top performers/losers, and historical performance.
- **AI-Powered Analytics:** Investment recommendations and portfolio insights.
- **News Integration:** Latest news for your portfolio holdings.
- **Excel Upload/Download:** Upload your portfolio in Excel format and export results.
- **Authentication:** JWT-based user authentication.
- **Responsive UI:** Modern, animated, and mobile-friendly dashboard.

---

## Architecture

```
Paiso.ai/
├── backend/         # FastAPI backend (REST API, analytics, DB)
│   ├── main.py
│   ├── utils/
│   ├── src/
│   └── ...
├── frontend/        # React frontend (dashboard, auth, charts)
│   ├── src/
│   └── ...
├── kite-mcp-server/ # Go-based MCP server for broker integration (optional)
├── Designs/         # Design assets and mockups
└── ...
```

---

## Quick Start

### 1. Backend (FastAPI)

```sh
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1  # On Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (React)

```sh
cd ../frontend
npm install
npm start
```

### 3. (Optional) Streamlit UI

```sh
cd ../backend
streamlit run main.py
```

---

## Portfolio Excel Format

Your Excel file should have at least these columns:

| Column         | Example Value   | Description                        |
|----------------|----------------|------------------------------------|
| Stock / Ticker | RELIANCE       | Stock symbol (NSE)                 |
| Quantity       | 10             | Number of shares                   |
| Avg_Price      | 2500           | Average purchase price             |
| Buy_Date       | 2023-01-01     | (Optional) Date of purchase        |
| Sector         | ENERGY         | (Optional) Sector name             |

**Sample:**

| Stock   | Quantity | Avg_Price | Buy_Date   | Sector  |
|---------|----------|-----------|------------|---------|
| TCS     | 5        | 3500      | 2022-10-01 | IT      |
| RELIANCE| 10       | 2500      | 2021-05-15 | ENERGY  |

---

## API Endpoints

### Authentication

- Paiso.ai expects a JWT token in the `Authorization` header for all protected endpoints.

### Portfolio Management

- `POST /api/upload-portfolio`  
  Upload an Excel file.  
  **Request:** `multipart/form-data` with `file`  
  **Response:**  
  ```json
  {
    "preview": [{ "Stock": "TCS", "Quantity": 5, ... }],
    "message": "Upload successful! Ready to analyze."
  }
  ```

- `GET /api/portfolio`  
  Get the current user's portfolio.  
  **Response:**  
  ```json
  [
    { "ticker": "TCS", "quantity": 5, "average price": 3500, ... }
  ]
  ```

- `DELETE /api/portfolio`  
  Delete the current user's portfolio.

- `GET /api/portfolio/status`  
  Get processing status: `{"status": "ready"}`

### Dashboard & Analytics

- `POST /api/sector_analysis`  
  Get sector allocation.  
  **Request:**  
  ```json
  { "portfolio": [ ... ] } // Optional; if omitted, uses stored portfolio
  ```
  **Response:**  
  ```json
  [
    { "Sector": "IT", "Current_Value": 50000 },
    { "Sector": "ENERGY", "Current_Value": 25000 }
  ]
  ```

- `POST /api/historical`  
  Get historical performance.  
  **Request:**  
  ```json
  { "portfolio": [ ... ], "days": 90 }
  ```
  **Response:**  
  ```json
  [
    { "Date": "2024-04-01", "Portfolio_Value": 100000 },
    { "Date": "2024-04-02", "Portfolio_Value": 100500 }
  ]
  ```

- `POST /api/portfolio_table`  
  Get stock-wise table for dashboard mini-cards.  
  **Response:**  
  ```json
  {
    "holdings": [
      {
        "symbol": "TCS",
        "name": "TCS",
        "quantity": 5,
        "avg_price": 3500,
        "ltp": 3700,
        "change": 5.7,
        "value": 18500
      }
    ]
  }
  ```

- `GET /api/portfolio/metrics-history`  
  Get summary metrics for all timeframes.  
  **Response:**  
  ```json
  {
    "total_value": { "last_year": 100000, ... },
    "profit_loss": { "last_year": 15000, ... },
    "change_percent": { "last_year": 15, ... },
    "top_performer": { "last_year": { "name": "TCS", "percent": 22.5 }, ... },
    "top_loser": { "last_year": { "name": "XYZ", "percent": -10.2 }, ... },
    "cagr": { "last_year": 12.3, ... },
    "invested_amount": 85000
  }
  ```

- `POST /api/news`  
  Get latest news for portfolio holdings.

- `POST /api/ai_recommendations`  
  Get AI-powered buy/hold/sell suggestions.

---

## Frontend Integration

- **All analytics sections** POST the current portfolio (or empty body) to the backend.
- **Error Handling:** If the backend returns an error (e.g., no portfolio uploaded), the frontend displays a user-friendly message and a consistent skeleton loader.
- **Dashboard Layout:**  
  - 3x2 grid for summary cards (Total Value, Profit/Loss, Change, Top Performer, Top Loser, CAGR).
  - Full-width Invested Amount card above.
  - 3-column grid below for Sector Allocation (pie), Historical Performance (line), and Stock-wise Mini Cards (sparklines).

---

## Example: Fetching Sector Allocation

**Request:**
```http
POST /api/sector_analysis
Authorization: Bearer <JWT>
Content-Type: application/json

{}
```

**Response:**
```json
[
  { "Sector": "IT", "Current_Value": 50000 },
  { "Sector": "ENERGY", "Current_Value": 25000 }
]
```

---

## Example: Handling Errors

If the user has not uploaded a portfolio:

**Response:**
```json
{
  "detail": "No portfolio uploaded"
}
```
**Frontend:**  
Shows a red error message and a prompt to upload a portfolio.

---

## Example: Uploading a Portfolio

**Request:**  
`POST /api/upload-portfolio` (multipart/form-data, with Excel file)

**Response:**
```json
{
  "preview": [
    { "Stock": "TCS", "Quantity": 5, "Avg_Price": 3500, ... }
  ],
  "message": "Upload successful! Ready to analyze."
}
```

---

## Example: Dashboard Card Data

**Request:**  
`GET /api/portfolio/metrics-history`

**Response:**
```json
{
  "total_value": { "last_year": 100000, "last_month": 98000, ... },
  "profit_loss": { "last_year": 15000, ... },
  "change_percent": { "last_year": 15, ... },
  "top_performer": { "last_year": { "name": "TCS", "percent": 22.5 }, ... },
  "top_loser": { "last_year": { "name": "XYZ", "percent": -10.2 }, ... },
  "cagr": { "last_year": 12.3, ... },
  "invested_amount": 85000
}
```

---

## Error Handling

- All endpoints return clear error messages if the portfolio is missing or invalid.
- The frontend displays these errors with user-friendly messages and consistent loaders.

---

## Contributing

- All business logic is in backend utility modules for maintainability.
- The React frontend is fully decoupled and communicates via REST API.
- Pull requests and issues are welcome!

---

## License

MIT License

---

## Further Expansion

- **Multi-portfolio support**
- **Advanced AI analytics**
- **Broker integration (Zerodha, etc.)**
- **Mobile app**

---

**For any questions or contributions, please open an issue or pull request on GitHub!**

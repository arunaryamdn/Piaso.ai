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

## API Endpoints (Updated)

| Endpoint                      | Method | Description                                 |
|-------------------------------|--------|---------------------------------------------|
| /api/upload-portfolio         | POST   | Upload portfolio Excel file                 |
| /api/portfolio                | GET    | Get current portfolio                       |
| /api/portfolio                | DELETE | Delete current portfolio                    |
| /api/portfolio/status         | GET    | Get portfolio status                        |
| /api/dashboard/analytics      | GET    | Get dashboard analytics                     |
| /api/portfolio_table          | POST   | Get portfolio table with analytics          |
| /api/historical               | GET    | Get historical performance                  |
| /api/profile                  | GET    | Get user profile info                       |
| /api/zerodha/exchange-token   | POST   | Exchange token for Zerodha integration      |
| /api/mcp-chat                 | POST   | MCP chat (manual/testing only)              |
| /api/news                     | GET    | (stub, always returns 404, to be removed)   |
| /api/risk                     | GET    | (stub, always returns 404, to be removed)   |

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
  Get the status of the user's portfolio (ready, processing, failed, not_found).

### Analytics & Dashboard
- `GET /api/dashboard/analytics`  
  Get all dashboard analytics (metrics, sector, historical, holdings, news).
- `POST /api/portfolio_table`  
  Get a table of portfolio holdings with live prices and analytics.
- `GET /api/historical?days=30`  
  Get historical performance for the portfolio.

### User Profile
- `GET /api/profile`  
  Get user profile info + portfolio file info.

### Broker Integration
- `POST /api/zerodha/exchange-token`  
  Exchange a request token for a Zerodha session (for integration).

### (Optional/Advanced)
- `POST /api/mcp-chat`  
  MCP chat integration (for manual/testing, not used by frontend).

### Endpoints to Remove Soon
- `GET /api/news` — (stub, always returns 404)
- `GET /api/risk` — (stub, always returns 404)

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

## Testing Your Endpoints
- Use FastAPI's `/docs` (Swagger UI) at `http://localhost:8000/docs` to interactively test all endpoints.
- Use Postman or curl for manual testing.
- Make sure to include the `Authorization: Bearer <token>` header for protected endpoints.

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

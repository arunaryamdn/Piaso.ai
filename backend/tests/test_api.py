import os
import io
import pytest
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Build a minimal test app that mirrors frontend/api/index.py
def _make_test_app() -> FastAPI:
    os.environ.setdefault("DB_PATH", "/tmp/portfolios_test.db")
    import sqlite3
    conn = sqlite3.connect(os.environ["DB_PATH"])
    conn.execute(
        """CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            data TEXT NOT NULL,
            filename TEXT,
            filesize INTEGER,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'ready'
        )"""
    )
    conn.commit()
    conn.close()

    _app = FastAPI()
    _app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    from backend.api.routes_portfolio import router as portfolio_router
    _app.include_router(portfolio_router)
    return _app

import backend.api.routes_portfolio
app = _make_test_app()
app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 1

DUMMY_JWT = "Bearer test.jwt.token"
REQUIRED_COLUMNS = ["symbol", "quantity available", "average price", "previous closing price"]


@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    return TestClient(app)


def make_excel_file(columns, rows=1):
    df = pd.DataFrame([{col: f"val{i}" for col in columns} for i in range(rows)])
    buf = io.BytesIO()
    df.to_excel(buf, index=False)
    buf.seek(0)
    return buf


def test_upload_valid_portfolio(client):
    file = make_excel_file(REQUIRED_COLUMNS)
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT},
    )
    assert response.status_code == 200
    assert "preview" in response.json()
    assert "message" in response.json()


def test_upload_invalid_file_type(client):
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.txt", b"not an excel file", "text/plain")},
        headers={"Authorization": DUMMY_JWT},
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.text


def test_upload_missing_columns(client):
    file = make_excel_file(["symbol", "quantity available"])
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT},
    )
    assert response.status_code == 400


def test_get_portfolio_status(client):
    response = client.get("/api/portfolio/status", headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (200, 404)


def test_zerodha_exchange_token(client):
    response = client.post("/api/zerodha/exchange-token", json={"request_token": "dummy"}, headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (200, 400)


def test_delete_portfolio_valid(client):
    app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 2
    file = make_excel_file(REQUIRED_COLUMNS)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT},
    )
    response = client.delete("/api/portfolio", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert "Portfolio deleted" in response.text


def test_delete_portfolio_no_portfolio(client):
    app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 8888
    response = client.delete("/api/portfolio", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert "Portfolio deleted" in response.text


def test_delete_portfolio_invalid_token():
    from fastapi.testclient import TestClient
    _app = _make_test_app()
    client = TestClient(_app)
    response = client.delete("/api/portfolio", headers={"Authorization": "Bearer invalid.token"})
    assert response.status_code in (401, 422, 500)


def test_missing_jwt():
    from fastapi.testclient import TestClient
    _app = _make_test_app()
    client = TestClient(_app)
    response = client.get("/api/dashboard")
    assert response.status_code in (401, 404, 422)


def test_historical_valid(client):
    app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 3
    file = make_excel_file(REQUIRED_COLUMNS)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT},
    )
    response = client.get("/api/historical?days=30", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_historical_invalid_days(client):
    app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 3
    for days in [0, -5, 4000, "abc"]:
        response = client.get(f"/api/historical?days={days}", headers={"Authorization": DUMMY_JWT})
        assert response.status_code == 400
        assert "Invalid 'days' parameter" in response.text


def test_historical_missing_jwt():
    from fastapi.testclient import TestClient
    _app = _make_test_app()
    client = TestClient(_app)
    response = client.get("/api/historical?days=30")
    assert response.status_code in (401, 422)


def test_risk_valid(client):
    response = client.get("/api/risk?days=30", headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (200, 404)


def test_risk_invalid_days(client):
    for days in [0, -1, 4000, "bad"]:
        response = client.get(f"/api/risk?days={days}", headers={"Authorization": DUMMY_JWT})
        assert response.status_code == 400
        assert "Invalid 'days' parameter" in response.text

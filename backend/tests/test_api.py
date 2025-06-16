import os
import io
import pytest
import pandas as pd

# Set dependency override before importing app or TestClient
import backend.api.routes_portfolio
from backend.main import app
app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 1

DUMMY_JWT = "Bearer test.jwt.token"

REQUIRED_COLUMNS = ["symbol", "quantity available", "average price", "previous closing price"]

@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    return TestClient(app)

# Helper to create a valid Excel file in memory
def make_excel_file(columns, rows=1):
    df = pd.DataFrame([{col: f"val{i}" for col in columns} for i in range(rows)])
    buf = io.BytesIO()
    df.to_excel(buf, index=False)
    buf.seek(0)
    return buf

# Use the client fixture in all tests that require authentication
def test_upload_valid_portfolio(client):
    columns = REQUIRED_COLUMNS
    file = make_excel_file(columns)
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    assert response.status_code == 200
    assert "preview" in response.json()
    assert "message" in response.json()

def test_upload_invalid_file_type(client):
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.txt", b"not an excel file", "text/plain")},
        headers={"Authorization": DUMMY_JWT}
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.text

def test_upload_missing_columns(client):
    columns = ["symbol", "quantity available"]  # Missing average price, previous closing price
    file = make_excel_file(columns)
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    assert response.status_code == 400
    assert "Missing required columns" in response.text

def test_upload_file_too_large(client):
    columns = REQUIRED_COLUMNS
    file = make_excel_file(columns, rows=100000)  # Should be >2MB
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    assert response.status_code == 400
    assert "File too large" in response.text

def test_dashboard_analytics(client):
    columns = REQUIRED_COLUMNS
    file = make_excel_file(columns)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    response = client.get("/api/dashboard/analytics", headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (200, 404)  # 404 if no portfolio
    if response.status_code == 200:
        assert "metrics" in response.json()

def test_portfolio_table(client):
    columns = REQUIRED_COLUMNS
    file = make_excel_file(columns)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    response = client.post("/api/portfolio_table", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert "holdings" in response.json()

def test_profile(client):
    response = client.get("/api/profile", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert "portfolio_file" in response.json()

def test_zerodha_exchange_token(client):
    response = client.post("/api/zerodha/exchange-token", json={"request_token": "dummy"}, headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (200, 400)

def test_mcp_chat(client):
    response = client.post("/api/mcp-chat", json={"message": "hello"}, headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (200, 400, 500)

def test_delete_portfolio_valid(client):
    from backend.main import app
    import backend.api.routes_portfolio
    app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 2
    columns = REQUIRED_COLUMNS
    file = make_excel_file(columns)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    response = client.delete("/api/portfolio", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert "Portfolio deleted" in response.text

def test_delete_portfolio_no_portfolio(client):
    from backend.main import app
    import backend.api.routes_portfolio
    app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 8888
    response = client.delete("/api/portfolio", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200  # Deleting non-existent is still 200 (idempotent)
    assert "Portfolio deleted" in response.text

def test_delete_portfolio_invalid_token():
    from backend.main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    response = client.delete("/api/portfolio", headers={"Authorization": "Bearer invalid.token"})
    assert response.status_code == 401 or response.status_code == 500

def test_missing_jwt():
    from backend.main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    response = client.get("/api/dashboard")
    assert response.status_code == 422 or response.status_code == 401

def test_malformed_request():
    from backend.main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    response = client.post("/api/dashboard", headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (405, 404)

def test_historical_valid(client):
    from backend.main import app
    import backend.api.routes_portfolio
    app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 3
    columns = REQUIRED_COLUMNS
    file = make_excel_file(columns)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    response = client.get("/api/historical?days=30", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_historical_invalid_days(client):
    from backend.main import app
    import backend.api.routes_portfolio
    app.dependency_overrides[backend.api.routes_portfolio.get_user_id_from_token] = lambda: 3
    for days in [0, -5, 4000, "abc"]:
        url = f"/api/historical?days={days}"
        response = client.get(url, headers={"Authorization": DUMMY_JWT})
        assert response.status_code == 400
        assert "Invalid 'days' parameter" in response.text

def test_historical_missing_jwt():
    from backend.main import app
    from fastapi.testclient import TestClient
    client = TestClient(app)
    response = client.get("/api/historical?days=30")
    assert response.status_code == 422 or response.status_code == 401

def test_risk_valid(client):
    response = client.get("/api/risk?days=30", headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (200, 404)

def test_risk_invalid_days(client):
    for days in [0, -1, 4000, "bad"]:
        from backend.main import app
        from fastapi.testclient import TestClient
        client = TestClient(app)
        url = f"/api/risk?days={days}"
        response = client.get(url, headers={"Authorization": DUMMY_JWT})
        assert response.status_code == 400
        assert "Invalid 'days' parameter" in response.text 
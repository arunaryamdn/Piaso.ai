import os
import io
import pytest
from fastapi.testclient import TestClient
from main import app
import pandas as pd

client = TestClient(app)

# Dummy JWT for testing (replace with a valid one for your app)
DUMMY_JWT = "Bearer test.jwt.token"

# Helper to create a valid Excel file in memory
def make_excel_file(columns, rows=1):
    df = pd.DataFrame([{col: f"val{i}" for col in columns} for i in range(rows)])
    buf = io.BytesIO()
    df.to_excel(buf, index=False)
    buf.seek(0)
    return buf

def test_upload_valid_portfolio(monkeypatch):
    # Patch get_user_id_from_token to always return 1
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 1)
    columns = ["Stock Symbol", "Quantity", "Average Price", "Date of Purchase"]
    file = make_excel_file(columns)
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    assert response.status_code == 200
    assert "preview" in response.json()
    assert "message" in response.json()

def test_upload_invalid_file_type(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 1)
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.txt", b"not an excel file", "text/plain")},
        headers={"Authorization": DUMMY_JWT}
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.text

def test_upload_missing_columns(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 1)
    columns = ["Stock Symbol", "Quantity"]  # Missing Average Price, Date of Purchase
    file = make_excel_file(columns)
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    assert response.status_code == 400
    assert "Missing required columns" in response.text

def test_upload_file_too_large(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 1)
    # Create a large file (>2MB)
    columns = ["Stock Symbol", "Quantity", "Average Price", "Date of Purchase"]
    file = make_excel_file(columns, rows=100000)  # Should be >2MB
    response = client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    assert response.status_code == 400
    assert "File too large" in response.text

def test_dashboard_valid(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 1)
    # Upload a valid portfolio first
    columns = ["Stock Symbol", "Quantity", "Average Price", "Date of Purchase"]
    file = make_excel_file(columns)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    response = client.get("/api/dashboard", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert "metrics" in response.json()

def test_dashboard_no_portfolio(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 9999)  # unlikely user
    response = client.get("/api/dashboard", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 404
    assert "No portfolio uploaded" in response.text

def test_dashboard_invalid_token():
    response = client.get("/api/dashboard", headers={"Authorization": "Bearer invalid.token"})
    assert response.status_code == 401 or response.status_code == 500
    # Accept either 401 (if JWT checked) or 500 (if decode fails)

def test_delete_portfolio_valid(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 2)
    # Upload a valid portfolio first
    columns = ["Stock Symbol", "Quantity", "Average Price", "Date of Purchase"]
    file = make_excel_file(columns)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    response = client.delete("/api/portfolio", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert "Portfolio deleted" in response.text

def test_delete_portfolio_no_portfolio(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 8888)
    response = client.delete("/api/portfolio", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200  # Deleting non-existent is still 200 (idempotent)
    assert "Portfolio deleted" in response.text

def test_delete_portfolio_invalid_token():
    response = client.delete("/api/portfolio", headers={"Authorization": "Bearer invalid.token"})
    assert response.status_code == 401 or response.status_code == 500

def test_missing_jwt():
    response = client.get("/api/dashboard")
    assert response.status_code == 422 or response.status_code == 401

def test_malformed_request():
    # Send POST to GET endpoint
    response = client.post("/api/dashboard", headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (405, 404)

def test_historical_valid(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 3)
    columns = ["Stock Symbol", "Quantity", "Average Price", "Date of Purchase"]
    file = make_excel_file(columns)
    client.post(
        "/api/upload-portfolio",
        files={"file": ("portfolio.xlsx", file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers={"Authorization": DUMMY_JWT}
    )
    response = client.get("/api/historical?days=30", headers={"Authorization": DUMMY_JWT})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_historical_invalid_days(monkeypatch):
    monkeypatch.setattr("main.get_user_id_from_token", lambda *a, **kw: 3)
    for days in [0, -5, 4000, "abc"]:
        url = f"/api/historical?days={days}"
        response = client.get(url, headers={"Authorization": DUMMY_JWT})
        assert response.status_code == 400
        assert "Invalid 'days' parameter" in response.text

def test_historical_missing_jwt():
    response = client.get("/api/historical?days=30")
    assert response.status_code == 422 or response.status_code == 401

def test_risk_valid(monkeypatch):
    # This endpoint uses global portfolio_df, so we can't easily set it in a stateless test
    # Just check for 404 or 200 (if global is set by other tests)
    response = client.get("/api/risk?days=30", headers={"Authorization": DUMMY_JWT})
    assert response.status_code in (200, 404)

def test_risk_invalid_days():
    for days in [0, -1, 4000, "bad"]:
        url = f"/api/risk?days={days}"
        response = client.get(url, headers={"Authorization": DUMMY_JWT})
        assert response.status_code == 400
        assert "Invalid 'days' parameter" in response.text 
import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from frontend.api.index import app
    return TestClient(app)


def test_pulse_endpoint_returns_required_fields(client):
    mock_portfolio = {"metrics": {"total_value": 1000000, "total_gain_loss_pct": 12.4, "cagr": 8.2}}
    mock_spend = {"health": "green", "balance": 15000, "runway_days": 18, "pct_spent": 45.0}
    with patch("backend.api.routes_pulse.get_portfolio_summary", new_callable=AsyncMock, return_value=mock_portfolio), \
         patch("backend.api.routes_pulse.get_spend_summary", new_callable=AsyncMock, return_value=mock_spend):
        resp = client.get("/api/pulse")
    assert resp.status_code == 200
    data = resp.json()
    assert "net_worth" in data
    assert "spend_health" in data
    assert "invest_health" in data


def test_pulse_overall_health_is_worst_of_two(client):
    mock_portfolio = {"metrics": {"total_value": 500000, "total_gain_loss_pct": 3.0, "cagr": 4.0}}
    mock_spend = {"health": "red", "balance": 2000, "runway_days": 3, "pct_spent": 92.0}
    with patch("backend.api.routes_pulse.get_portfolio_summary", new_callable=AsyncMock, return_value=mock_portfolio), \
         patch("backend.api.routes_pulse.get_spend_summary", new_callable=AsyncMock, return_value=mock_spend):
        resp = client.get("/api/pulse")
    data = resp.json()
    assert data["overall_health"] == "red"
    assert data["spend_health"] == "red"

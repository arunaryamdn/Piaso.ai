import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from frontend.api.index import app
    return TestClient(app)


def test_nse_equity_returns_price(client):
    mock_data = {"symbol": "RELIANCE", "lastPrice": 2890.5, "change": 42.3, "pChange": 1.48}
    with patch("backend.api.routes_nse.get_equity_quote", return_value=mock_data):
        resp = client.get("/api/nse/equity/RELIANCE")
    assert resp.status_code == 200
    assert resp.json()["lastPrice"] == 2890.5


def test_nse_equity_invalid_symbol_returns_404(client):
    with patch("backend.api.routes_nse.get_equity_quote", return_value=None):
        resp = client.get("/api/nse/equity/INVALIDSYM")
    assert resp.status_code == 404

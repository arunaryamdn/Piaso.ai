import pytest

@pytest.fixture(autouse=True)
def patch_get_user_id_from_token(monkeypatch):
    import backend.api.routes_portfolio
    monkeypatch.setattr("backend.api.routes_portfolio.get_user_id_from_token", lambda *a, **kw: 1) 
import pytest


@pytest.fixture(autouse=True)
def patch_get_user_id_from_token():
    from frontend.api.index import app
    from backend.api.routes_portfolio import get_user_id_from_token

    app.dependency_overrides[get_user_id_from_token] = lambda: 1
    yield
    app.dependency_overrides.pop(get_user_id_from_token, None)

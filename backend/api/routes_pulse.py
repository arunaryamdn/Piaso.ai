from fastapi import APIRouter, Depends
from backend.api.routes_portfolio import get_user_id_from_token, get_dashboard_analytics
from backend.api.routes_spend import get_spend_summary_data

router = APIRouter(prefix="/api", tags=["pulse"])

_HEALTH_RANK = {"green": 0, "grey": 1, "amber": 2, "red": 3}


async def get_portfolio_summary(user_id: str) -> dict:
    try:
        return get_dashboard_analytics(user_id)
    except Exception:
        return {}


async def get_spend_summary(user_id: str) -> dict:
    try:
        return await get_spend_summary_data(user_id)
    except Exception:
        return {}


@router.get("/pulse")
async def pulse(user_id: str = Depends(get_user_id_from_token)):
    portfolio, spend = await get_portfolio_summary(user_id), await get_spend_summary(user_id)
    metrics = portfolio.get("metrics", {})
    net_worth = metrics.get("total_value", 0)
    invest_gain_pct = metrics.get("total_gain_loss_pct", 0)
    invest_health = "green" if invest_gain_pct >= 5 else "amber" if invest_gain_pct >= 0 else "red"
    spend_health = spend.get("health", "grey")
    overall = max(invest_health, spend_health, key=lambda h: _HEALTH_RANK.get(h, 0))
    return {
        "net_worth": net_worth,
        "invest_gain_pct": round(float(invest_gain_pct), 1),
        "invest_health": invest_health,
        "spend_health": spend_health,
        "spend_balance": spend.get("balance", 0),
        "runway_days": spend.get("runway_days", 0),
        "overall_health": overall,
    }

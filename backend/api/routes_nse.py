from fastapi import APIRouter, HTTPException, Depends
from backend.utils.nse_client import get_equity_quote, get_equity_historical
from backend.api.routes_portfolio import get_user_id_from_token

router = APIRouter(prefix="/api/nse", tags=["nse"])


@router.get("/equity/{symbol}")
async def equity_quote(symbol: str, user_id: int = Depends(get_user_id_from_token)):
    data = get_equity_quote(symbol.upper())
    if data is None:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    return data


@router.get("/equity/{symbol}/historical")
async def equity_historical(
    symbol: str,
    period: str = "1y",
    user_id: int = Depends(get_user_id_from_token),
):
    allowed = {"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"}
    if period not in allowed:
        raise HTTPException(status_code=400, detail=f"period must be one of {allowed}")
    data = get_equity_historical(symbol.upper(), period)
    return {"symbol": symbol, "period": period, "data": data}

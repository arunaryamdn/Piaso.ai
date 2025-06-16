from pydantic import BaseModel
from typing import List, Optional

class PortfolioUpload(BaseModel):
    portfolio: List[dict]
    days: Optional[int] = 30

class PortfolioHolding(BaseModel):
    symbol: str
    name: str
    quantity: float
    avg_price: float
    current_price: float
    current_value: float
    gain_loss: float
    gain_loss_percent: float
    sector: str

class PortfolioMetrics(BaseModel):
    total_value: float
    total_invested: float
    total_gain_loss: float
    total_gain_loss_percent: float
    # Add more fields as needed 
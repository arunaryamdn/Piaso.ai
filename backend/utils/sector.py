import pandas as pd
from typing import List, Dict, Any, Sequence
from .normalization import normalize_columns, get_first_column

def get_sector_analysis(df: pd.DataFrame) -> Sequence[Dict[str, Any]]:
    """Group by sector and sum current value for sector analysis."""
    df = normalize_columns(df)
    print("DEBUG: Columns after normalization:", df.columns.tolist())
    print("DEBUG: First few rows:", df.head().to_dict())
    quantity_col = get_first_column(df, ['quantity', 'quantity available'])
    price_col = get_first_column(df, ['current price', 'live price', 'previous closing price', 'previous closing price', 'average price', 'avg price'])
    # If current value is missing, compute it
    if 'current value' not in df and quantity_col and price_col:
        df['current value'] = df[quantity_col] * df[price_col]
    # Only proceed if sector and current value exist
    if 'sector' in df and 'current value' in df:
        sector_dist = df.groupby('sector')['current value'].sum().reset_index()
        sector_dist = sector_dist.rename(columns={'current value': 'Current_Value', 'sector': 'Sector'})
        print("DEBUG: Sector data being returned:", sector_dist.to_dict(orient='records'))
        return sector_dist.to_dict(orient='records')
    print("DEBUG: Sector or current value column missing, cannot compute sector allocation.")
    return [] 
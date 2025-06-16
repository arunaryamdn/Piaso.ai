import pandas as pd
from typing import List, Optional

def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize DataFrame column names: lowercase, strip spaces, replace underscores with spaces."""
    df.columns = [col.strip().lower().replace('_', ' ') for col in df.columns]
    return df

def get_first_column(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    """Return the first column from candidates that exists in df, or None if not found."""
    for col in candidates:
        if col in df.columns:
            return col
    return None 
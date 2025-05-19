import numpy as np
import pandas as pd
import streamlit as st

def create_risk_profile(df, hist_data):
    risk_profile = {}
    try:
        if len(hist_data) > 5 and 'Daily_Return' in hist_data.columns and not hist_data['Daily_Return'].isna().all():
            risk_profile['volatility'] = hist_data['Daily_Return'].std() * np.sqrt(252) * 100
            risk_profile['max_drawdown'] = (hist_data['Portfolio_Value'] / hist_data['Portfolio_Value'].cummax() - 1).min() * 100
        else:
            risk_profile['volatility'] = None
            risk_profile['max_drawdown'] = None
    except Exception as e:
        st.warning(f"Error calculating risk metrics: {e}")
        risk_profile['volatility'] = None
        risk_profile['max_drawdown'] = None

    try:
        filtered_df = df[df['Current_Value'] > 0].copy()
        if not filtered_df.empty:
            filtered_df['Sector'] = filtered_df['Sector'].fillna('Unknown')
            sector_exposure = filtered_df.groupby('Sector')['Current_Value'].sum() / filtered_df['Current_Value'].sum()
            if not sector_exposure.empty:
                risk_profile['top_sector'] = sector_exposure.idxmax()
                risk_profile['top_sector_exposure'] = sector_exposure.max() * 100
                risk_profile['sector_concentration'] = ((sector_exposure ** 2).sum() * 100)
                risk_profile['num_sectors'] = len(sector_exposure)
            else:
                raise ValueError("Could not calculate sector exposure")
        else:
            raise ValueError("No valid current values in portfolio")
    except Exception as e:
        st.warning(f"Error calculating diversification metrics: {e}")
        risk_profile['top_sector'] = 'Unknown'
        risk_profile['top_sector_exposure'] = 0.0
        risk_profile['sector_concentration'] = 0.0
        risk_profile['num_sectors'] = 0

    return risk_profile 
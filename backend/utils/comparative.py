# This is not an edit, but a move operation. Please move the file 'utils/comparative.py' to 'code/utils/comparative.py'. 

import pandas as pd

def prepare_comparative_data(dfs, mode='normalized', date_col='DATE', value_col='CLOSE'):
    """
    Prepare a DataFrame for comparative charting.
    dfs: dict of {label: DataFrame}
    mode: 'raw', 'normalized', or 'pct_change'
    Returns: DataFrame with columns [date_col, 'VALUE', 'LABEL']
    """
    all_data = []
    for label, df in dfs.items():
        if date_col not in df.columns or value_col not in df.columns:
            continue
        temp = df[[date_col, value_col]].copy()
        temp = temp.dropna()
        temp['LABEL'] = label
        if mode == 'normalized':
            first = temp[value_col].iloc[0]
            temp['VALUE'] = temp[value_col] / first * 100 if first != 0 else temp[value_col]
        elif mode == 'pct_change':
            temp['VALUE'] = temp[value_col].pct_change().fillna(0) * 100
        else:  # raw
            temp['VALUE'] = temp[value_col]
        all_data.append(temp[[date_col, 'VALUE', 'LABEL']])
    if not all_data:
        return pd.DataFrame(columns=[date_col, 'VALUE', 'LABEL'])
    return pd.concat(all_data, ignore_index=True)

# Removed all Streamlit chart rendering and controls. This file now only contains data preparation logic. 
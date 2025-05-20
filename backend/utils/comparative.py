# This is not an edit, but a move operation. Please move the file 'utils/comparative.py' to 'code/utils/comparative.py'. 

import pandas as pd
import altair as alt
import streamlit as st

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

def render_comparative_chart(df, x_col='DATE', y_col='VALUE', group_col='LABEL', mode='normalized', theme='auto', width=700, height=400):
    """
    Render an interactive comparative Altair line chart in Streamlit.
    """
    if df.empty:
        st.info('No data to display.')
        return
    chart_title = {
        'normalized': 'Normalized Price (Start=100)',
        'pct_change': 'Daily % Change',
        'raw': 'Raw Price'
    }.get(mode, 'Comparative Chart')
    chart = alt.Chart(df).mark_line().encode(
        x=alt.X(f'{x_col}:T', title='Date'),
        y=alt.Y(y_col, title=chart_title),
        color=alt.Color(group_col, title='Symbol'),
        tooltip=[group_col, f'{x_col}:T', alt.Tooltip(y_col, format='.2f')]
    ).properties(width=width, height=height, title=chart_title)
    st.altair_chart(chart, use_container_width=True)

def comparative_chart_controls(all_data):
    """
    Renders Streamlit controls for comparative chart selection.
    Returns:
        dfs: dict of filtered DataFrames for selected symbols and date range
        mode: selected comparison mode
        date_range: (start_date, end_date)
        selected_symbols: list of selected symbols
    """
    all_symbols = list(all_data.keys())
    # 1. User selects which stocks/indices to compare
    selected_symbols = st.multiselect(
        "Select stocks/indices to compare",
        options=all_symbols,
        default=all_symbols[:2] if len(all_symbols) >= 2 else all_symbols
    )
    # 2. User selects comparison mode
    mode = st.selectbox(
        "Comparison Mode",
        options=['normalized', 'raw', 'pct_change'],
        format_func=lambda x: {
            'normalized': 'Normalized (Start=100)',
            'raw': 'Raw Price',
            'pct_change': '% Change'
        }[x]
    )
    # 3. User selects date range
    all_dates = pd.concat([
        df['DATE'] for df in all_data.values() if 'DATE' in df
    ])
    min_date, max_date = all_dates.min(), all_dates.max()
    date_range = st.date_input(
        "Date range",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date
    )
    # 4. Prepare data for selected symbols and date range
    dfs = {}
    for symbol in selected_symbols:
        df = all_data[symbol]
        mask = (df['DATE'] >= pd.to_datetime(date_range[0])) & (df['DATE'] <= pd.to_datetime(date_range[1]))
        dfs[symbol] = df.loc[mask]
    return dfs, mode, date_range, selected_symbols 
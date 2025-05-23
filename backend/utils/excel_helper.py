import streamlit as st
import pandas as pd
import plotly.express as px
import logging
from io import BytesIO

def to_excel(df):
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Portfolio')
    return output.getvalue()
import streamlit as st

def show_logs():
    st.subheader('Debug Log (last 100 lines)')
    try:
        with open('stock_analyzer.log', 'r') as f:
            lines = f.readlines()[-100:]
            st.code(''.join(lines))
    except Exception as e:
        st.error(f'Could not read log file: {e}')
def read_portfolio(uploaded_file):
    return pd.read_excel(uploaded_file, sheet_name='Equity')

def upload_portfolio():
    uploaded_file = st.sidebar.file_uploader('Upload your stock portfolio (Excel format)', type=['xlsx'])
    if uploaded_file is not None:
        try:
            df = read_portfolio(uploaded_file)
            st.sidebar.success('File uploaded successfully!')
            logging.info('File uploaded and read successfully.')
            return df
        except FileNotFoundError as e:
            st.sidebar.error(f'File not found: {e}')
            logging.error(f'File not found: {e}')
        except Exception as e:
            st.sidebar.error(f'Error reading file: {e}')
            logging.error(f'Error reading file: {e}')
    else:
        st.sidebar.info('Please upload your stock portfolio Excel file to begin analysis.')
    return None
import logging

def calculate_cagr(start_value, end_value, years):
    """Calculate compounded annual growth rate."""
    if start_value <= 0 or years <= 0:
        return 0
    try:
        cagr_val = (end_value / start_value) ** (1 / years) - 1
        return round(cagr_val, 2)
    except Exception as e:
        logging.error(f"CAGR calculation error: {e}")
        return 0 
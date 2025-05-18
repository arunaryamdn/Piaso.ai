import logging

def setup_logging():
    logging.basicConfig(
        filename='stock_analyzer.log',
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(message)s'
    )
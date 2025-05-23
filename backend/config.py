"""
config.py
Backend configuration and user-facing strings for Paiso.ai.
"""

# User-facing messages
MSG_NO_PORTFOLIO = "No portfolio uploaded"
MSG_UPLOAD_SUCCESS = "Upload successful! Ready to analyze."
MSG_UPLOAD_FAIL = "Upload failed. Please try again."
MSG_PORTFOLIO_DELETED = "Portfolio deleted"
MSG_INVALID_TOKEN = "Invalid token"
MSG_INVALID_HEADER = "Invalid token header"
MSG_MISSING_TOKEN = "No token provided."
MSG_AUTH_REQUIRED = "Authentication required."
MSG_INTERNAL_ERROR = "Internal server error."
MSG_MCP_NO_MESSAGE = "No message provided"
MSG_MCP_NO_STDIN = "MCP process stdin is not available"
MSG_MCP_NO_RESPONSE = "No response from MCP server"
MSG_MCP_INVALID_JSON = "Invalid JSON from MCP server"
MSG_MCP_EXCHANGE_TOKEN_FAIL = "Failed to exchange token"
MSG_MCP_MISSING_REQUEST_TOKEN = "Missing request_token"
MSG_OPERATION_SUCCESS = "Operation successful!"
MSG_OPERATION_FAIL = "Operation failed. Please try again."

# AI Recommendation messages
AI_RECO_BUY_MORE = "Buy More"
AI_RECO_SELL = "Sell"
AI_RECO_HOLD = "Hold"
AI_RECO_REASON_DOWN = "Stock is down significantly."
AI_RECO_REASON_UP = "Stock is up significantly."
AI_RECO_REASON_TEMP_LOSS = "Temporary loss, but no strong sell signal."
AI_RECO_REASON_NO_SIGNAL = "No strong buy/sell signal."

# API constants
DB_PATH = './portfolios.db'
JWT_SECRET = 'changeme'  # Should match your auth server
NODE_API_URL = 'http://localhost:3000/api/equity/'
NODE_API_HISTORICAL_URL = 'http://localhost:3000/api/equity/historical/'

# Logging
LOG_PREFIX = '[Paiso.ai Backend]' 
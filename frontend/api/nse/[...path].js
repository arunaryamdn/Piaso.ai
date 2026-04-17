/**
 * frontend/api/nse/[...path].js
 * Vercel serverless wrapper for the stock-nse-india npm package.
 * Exposes /api/nse/equity/:symbol and /api/nse/equity/historical/:symbol
 * so the Python backend can call NSE market data without a separate server.
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));

let _nse = null;
function getNse() {
    if (!_nse) {
        const { NseIndia } = require('stock-nse-india');
        _nse = new NseIndia();
    }
    return _nse;
}

// Historical must come before the generic equity route
app.get('/api/nse/equity/historical/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const { dateStart, dateEnd } = req.query;
    try {
        const nse = getNse();
        const start = new Date(dateStart || Date.now() - 30 * 86400000);
        const end = new Date(dateEnd || Date.now());
        const data = await nse.getEquityHistoricalData(symbol, { start, end });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Live price / equity details
app.get('/api/nse/equity/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const nse = getNse();
        const data = await nse.getEquityDetails(symbol);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Market status
app.get('/api/nse/marketStatus', async (req, res) => {
    try {
        const nse = getNse();
        const data = await nse.getMarketStatus();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;

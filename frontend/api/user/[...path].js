/**
 * api/user/[...path].js
 * Catch-all Vercel serverless function for all /api/user/* routes.
 */

const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token provided.' });
    const token = auth.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token.' });
    }
}

// Get profile
app.get('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, name, mobile, "createdAt" FROM users WHERE id = $1',
            [Number(req.user.id)]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Update profile
app.patch('/api/user/profile', authMiddleware, async (req, res) => {
    const { name, mobile } = req.body;
    if (typeof name !== 'string' && typeof mobile !== 'string') {
        return res.status(400).json({ error: 'Nothing to update.' });
    }
    try {
        await pool.query(
            'UPDATE users SET name = COALESCE($1, name), mobile = COALESCE($2, mobile) WHERE id = $3',
            [name, mobile, req.user.id]
        );
        const result = await pool.query(
            'SELECT id, email, name, mobile, "createdAt" FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

module.exports = app;

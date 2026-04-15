/**
 * api/auth/[...path].js
 * Catch-all Vercel serverless function for all /api/auth/* routes.
 * Using catch-all routing ensures Express receives the full original path
 * (e.g. /api/auth/signup) rather than the rewritten destination.
 */

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
});

async function initDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT DEFAULT '',
                mobile TEXT DEFAULT '',
                "createdAt" TIMESTAMPTZ DEFAULT NOW()
            )
        `);
    } catch (err) {
        console.error('DB init error:', err.message);
    }
}
initDb();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

function parseDuration(str) {
    if (typeof str === 'string') {
        if (str.endsWith('h')) return parseInt(str) * 60 * 60;
        if (str.endsWith('d')) return parseInt(str) * 24 * 60 * 60;
    }
    return 60 * 60;
}

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name = '', mobile = '', sessionDuration = '1h' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    try {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered.' });

        const hash = bcrypt.hashSync(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password, name, mobile) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, hash, name, mobile]
        );
        const userId = result.rows[0].id;
        const expiresIn = parseDuration(sessionDuration);
        const accessToken = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn });
        const refreshToken = jwt.sign({ id: userId, email }, JWT_REFRESH_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: true, sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ token: accessToken });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password, sessionDuration = '1h' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const expiresIn = parseDuration(sessionDuration);
        const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn });
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: true, sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ token: accessToken });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Refresh token
app.post('/api/auth/refresh-token', (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const accessToken = jwt.sign({ id: payload.id, email: payload.email }, JWT_SECRET, { expiresIn: 3600 });
        res.json({ accessToken });
    } catch {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
});

module.exports = app;

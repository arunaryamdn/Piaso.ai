/**
 * api/auth.js
 * Vercel serverless auth service using Neon Postgres for persistent storage.
 * Requires POSTGRES_URL env var — add "Neon Postgres" storage in the Vercel dashboard
 * and it will be set automatically.
 */

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

// Neon Postgres connection — POSTGRES_URL is set automatically by Vercel
// when you add Neon Postgres storage to your project.
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false,
});

// Ensure users table exists (runs on each cold start, idempotent)
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
        res.status(500).json({ error: 'Database error.' });
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
        res.status(500).json({ error: 'Database error.' });
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

// Auth middleware
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
        res.status(500).json({ error: 'Database error.' });
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
        res.status(500).json({ error: 'Database error.' });
    }
});

module.exports = app;

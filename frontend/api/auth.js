/**
 * api/auth.js
 * Vercel serverless entry point for the Paiso.ai auth service.
 * Handles all /api/auth/* and /api/user/* routes via Express.
 * SQLite database is stored in /tmp (Vercel writable scratch space).
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const DB_PATH = process.env.AUTH_DB_PATH || '/tmp/users.db';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Open (or create) the SQLite database and ensure the users table exists
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('SQLite open error:', err.message);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT DEFAULT '',
        mobile TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Helper: parse duration string to seconds
function parseDuration(str) {
    if (typeof str === 'string') {
        if (str.endsWith('h')) return parseInt(str) * 60 * 60;
        if (str.endsWith('d')) return parseInt(str) * 24 * 60 * 60;
    }
    return 60 * 60; // default 1 hour
}

// Signup
app.post('/api/auth/signup', (req, res) => {
    const { email, password, name = '', mobile = '', sessionDuration = '1h' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (user) return res.status(409).json({ error: 'Email already registered.' });
        const hash = bcrypt.hashSync(password, 10);
        db.run(
            'INSERT INTO users (email, password, name, mobile) VALUES (?, ?, ?, ?)',
            [email, hash, name, mobile],
            function (err) {
                if (err) return res.status(500).json({ error: 'Database error.' });
                const expiresIn = parseDuration(sessionDuration);
                const accessToken = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn });
                const refreshToken = jwt.sign({ id: this.lastID, email }, JWT_REFRESH_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.json({ token: accessToken });
            }
        );
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password, sessionDuration = '1h' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const expiresIn = parseDuration(sessionDuration);
        const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn });
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ token: accessToken });
    });
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

// Get user profile
app.get('/api/user/profile', authMiddleware, (req, res) => {
    db.get(
        'SELECT id, email, name, mobile, createdAt FROM users WHERE id = ?',
        [Number(req.user.id)],
        (err, user) => {
            if (err) return res.status(500).json({ error: 'Database error.' });
            if (!user) return res.status(404).json({ error: 'User not found.' });
            res.json(user);
        }
    );
});

// Update user profile
app.patch('/api/user/profile', authMiddleware, (req, res) => {
    const { name, mobile } = req.body;
    if (typeof name !== 'string' && typeof mobile !== 'string') {
        return res.status(400).json({ error: 'Nothing to update.' });
    }
    db.run(
        'UPDATE users SET name = COALESCE(?, name), mobile = COALESCE(?, mobile) WHERE id = ?',
        [name, mobile, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error.' });
            db.get(
                'SELECT id, email, name, mobile, createdAt FROM users WHERE id = ?',
                [req.user.id],
                (err, user) => {
                    if (!user) return res.status(404).json({ error: 'User not found.' });
                    res.json(user);
                }
            );
        }
    );
});

module.exports = app;

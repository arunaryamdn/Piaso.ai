require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// SQLite setup
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) throw err;
    console.log('Connected to SQLite database.');
});
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  mobile TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Robust migration: add columns only if missing
db.get("PRAGMA table_info(users);", (err, columns) => {
    if (err) console.error('PRAGMA error:', err);
    const colNames = Array.isArray(columns) ? columns.map(c => c.name) : [];
    if (!colNames.includes('name')) {
        db.run('ALTER TABLE users ADD COLUMN name TEXT', (err) => {
            if (err) console.error('Migration error (name):', err);
        });
    }
    if (!colNames.includes('mobile')) {
        db.run('ALTER TABLE users ADD COLUMN mobile TEXT', (err) => {
            if (err) console.error('Migration error (mobile):', err);
        });
    }
});

// Helper: parse duration string to seconds
function parseDuration(str) {
    if (str.endsWith('h')) return parseInt(str) * 60 * 60;
    if (str.endsWith('d')) return parseInt(str) * 24 * 60 * 60;
    return 60 * 60; // default 1 hour
}

// Signup endpoint
app.post('/api/auth/signup', (req, res) => {
    const { email, password, name = '', mobile = '', sessionDuration = '1h' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (user) return res.status(409).json({ error: 'Email already registered.' });
        const hash = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO users (email, password, name, mobile) VALUES (?, ?, ?, ?)', [email, hash, name, mobile], function (err) {
            if (err) {
                console.error('DB error:', err);
                return res.status(500).json({ error: 'Database error.' });
            }
            const accessToken = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: sessionDuration });
            const refreshToken = jwt.sign({ id: this.lastID, email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false, // set to true in production
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.json({ token: accessToken });
        });
    });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password, sessionDuration = '1h' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials.' });
        const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: sessionDuration });
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // set to true in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ token: accessToken });
    });
});

// Refresh token endpoint
app.post('/api/auth/refresh-token', (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const accessToken = jwt.sign({ id: payload.id, email: payload.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ accessToken });
    } catch (err) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
});

// Auth middleware example
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token provided.' });
    const token = auth.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        console.log('Looking up user with id:', req.user.id);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token.' });
    }
}

// Example protected route
app.get('/api/user/profile', authMiddleware, (req, res) => {
    db.get('SELECT id, email, name, mobile, createdAt FROM users WHERE id = ?', [Number(req.user.id)], (err, user) => {
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    });
});

// PATCH profile endpoint
app.patch('/api/user/profile', authMiddleware, (req, res) => {
    const { name, mobile } = req.body;
    if (typeof name !== 'string' && typeof mobile !== 'string') {
        return res.status(400).json({ error: 'Nothing to update.' });
    }
    db.run('UPDATE users SET name = COALESCE(?, name), mobile = COALESCE(?, mobile) WHERE id = ?', [name, mobile, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error.' });
        db.get('SELECT id, email, name, mobile, createdAt FROM users WHERE id = ?', [req.user.id], (err, user) => {
            if (!user) return res.status(404).json({ error: 'User not found.' });
            res.json(user);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Auth server running on port ${PORT}`);
}); 
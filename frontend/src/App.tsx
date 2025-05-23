import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PortfolioTable from './components/PortfolioTable';
import PortfolioUpload from './components/PortfolioUpload';
import RealTimePrices from './components/RealTimePrices';
import AIRecommendations from './components/AIRecommendations';
import News from './components/News';
import McpChat from './components/McpChat';
import NotFound from './pages/NotFound';
import ZerodhaAuthCallback from './pages/ZerodhaAuthCallback';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NewsPage from './pages/NewsPage';
import PortfolioPage from './pages/PortfolioPage';
import './App.css';

function getToken() {
  // Prefer localStorage, fallback to sessionStorage
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

function PrivateRoute() {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function App() {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to get token and expiry
  function getTokenAndExpiry() {
    const token = getToken();
    if (!token) return { token: null, exp: null };
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { token, exp: payload.exp };
    } catch {
      return { token: null, exp: null };
    }
  }

  // Session expiry warning logic
  useEffect(() => {
    function setupTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      const { token, exp } = getTokenAndExpiry();
      if (!token || !exp) return;
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = exp - now;
      if (secondsLeft <= 0) {
        setShowSessionModal(false);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      if (secondsLeft <= 60) {
        setCountdown(secondsLeft);
        setShowSessionModal(true);
        timerRef.current = setTimeout(() => {
          setCountdown((c) => c - 1);
        }, 1000);
      } else {
        setShowSessionModal(false);
        timerRef.current = setTimeout(setupTimer, (secondsLeft - 60) * 1000);
      }
    }
    setupTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!showSessionModal) return;
    if (countdown <= 0) {
      setShowSessionModal(false);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    } else if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [showSessionModal, countdown]);

  // Refresh token handler
  async function handleRefreshToken() {
    setRefreshing(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include', // send cookie
      });
      const data = await res.json();
      if (data.accessToken) {
        // Update token in storage (prefer localStorage if present)
        if (localStorage.getItem('token')) {
          localStorage.setItem('token', data.accessToken);
        } else {
          sessionStorage.setItem('token', data.accessToken);
        }
        setShowSessionModal(false);
        setCountdown(60);
      } else {
        throw new Error('No access token');
      }
    } catch {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Router>
      {/* Session Expiry Modal */}
      {showSessionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#232837', color: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px 0 rgba(40,255,80,0.10)' }}>
            <h2 style={{ color: '#53d22c', fontWeight: 800, fontSize: '1.3rem', marginBottom: 12 }}>Session Expiring Soon</h2>
            <p style={{ marginBottom: 16 }}>Your session will expire in <b>{countdown}</b> seconds.<br />Would you like to stay signed in?</p>
            <button onClick={handleRefreshToken} disabled={refreshing} style={{ background: '#53d22c', color: '#181c24', fontWeight: 800, fontSize: '1.1rem', border: 'none', borderRadius: 12, padding: '0.7rem 2rem', marginRight: 12, cursor: 'pointer' }}>{refreshing ? 'Refreshing...' : 'Stay Signed In'}</button>
            <button onClick={() => { setShowSessionModal(false); localStorage.removeItem('token'); sessionStorage.removeItem('token'); window.location.href = '/login'; }} style={{ background: '#232837', color: '#b5cbb0', fontWeight: 600, fontSize: '1.1rem', border: '1px solid #7ecbff', borderRadius: 12, padding: '0.7rem 2rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      )}
      <Routes>
        {/* Public routes: no Layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/zerodha/callback" element={<ZerodhaAuthCallback />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="*" element={<NotFound />} />

        {/* Protected routes: with Layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/realtime" element={<RealTimePrices />} />
            <Route path="/ai" element={<AIRecommendations />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PortfolioTable from './components/PortfolioTable';
import PortfolioUpload from './components/PortfolioUpload';
import RealTimePrices from './components/RealTimePrices';
import AIRecommendations from './components/AIRecommendations';
import News from './components/News';
import logo from './assets/logo.png';
import './App.css';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="app-root dark-theme">
        <header className="main-header">
          <div className="main-header-left">
            <img src={logo} alt="Paiso.ai Logo" className="main-header-logo" style={{ height: 36, width: 36 }} />
            <span className="main-header-title">Paiso.ai</span>
          </div>
          <nav className="main-header-nav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/upload">Upload Portfolio</Link>
            <Link to="/realtime">Real-Time Prices</Link>
            <Link to="/ai">AI Recommendations</Link>
            <Link to="/news">News Feed</Link>
          </nav>
          <button
            className="main-header-mobile-toggle"
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className="hamburger-icon">☰</span>
          </button>
        </header>
        {mobileMenuOpen && (
          <nav className="mobile-menu">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/portfolio" onClick={() => setMobileMenuOpen(false)}>Portfolio</Link>
            <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>Upload Portfolio</Link>
            <Link to="/realtime" onClick={() => setMobileMenuOpen(false)}>Real-Time Prices</Link>
            <Link to="/ai" onClick={() => setMobileMenuOpen(false)}>AI Recommendations</Link>
            <Link to="/news" onClick={() => setMobileMenuOpen(false)}>News Feed</Link>
          </nav>
        )}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<PortfolioTable />} />
            <Route path="/upload" element={<PortfolioUpload />} />
            <Route path="/realtime" element={<RealTimePrices />} />
            <Route path="/ai" element={<AIRecommendations />} />
            <Route path="/news" element={<News />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

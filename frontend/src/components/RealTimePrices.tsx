import React from 'react';
import { Link } from 'react-router-dom';

const RealTimePrices: React.FC = () => {
  // Example data for static display
  const sectors = [
    { name: 'Technology', value: 40, color: '#53d22c', gain: '+10%' },
    { name: 'Finance', value: 25, color: '#f87171', gain: '-5%' },
    { name: 'Healthcare', value: 20, color: '#60a5fa', gain: '+3%' },
    { name: 'Energy', value: 15, color: '#fbbf24', gain: '+2%' },
  ];

  return (
    <div className="realtime-root">
      <header className="realtime-header">
        <div className="realtime-logo-row">
          <svg fill="none" viewBox="0 0 48 48" height="28" width="28" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="#53d22c" />
          </svg>
          <h2>Investly</h2>
        </div>
        <nav className="realtime-nav">
          <Link to="/portfolio">My Portfolio</Link>
          <Link to="/dashboard">Watchlist</Link>
          <Link to="/ai">Explore</Link>
        </nav>
        <div className="realtime-header-actions">
          <label className="realtime-search-label">
            <span className="material-icons">search</span>
            <input className="realtime-search-input" placeholder="Search Stocks..." />
          </label>
          <button className="realtime-notify-btn">
            <span className="material-icons">notifications</span>
          </button>
          <div className="realtime-avatar" />
        </div>
      </header>
      <main className="realtime-main">
        <div className="realtime-title-row">
          <h1>Portfolio Breakdown by Sector</h1>
          <div className="realtime-last-updated">
            <span className="material-icons">show_chart</span>
            <span>Last updated: Just now</span>
          </div>
        </div>
        <div className="realtime-content-grid">
          <div className="realtime-sector-card">
            <h2>Sector Allocation</h2>
            {/* Placeholder donut chart */}
            <div className="realtime-donut-chart">
              <svg width="180" height="180" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#222" strokeWidth="3.8" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#53d22c" strokeWidth="3.8" strokeDasharray="40, 100" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f87171" strokeWidth="3.8" strokeDasharray="25, 100" strokeDashoffset="-40" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#60a5fa" strokeWidth="3.8" strokeDasharray="20, 100" strokeDashoffset="-65" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#fbbf24" strokeWidth="3.8" strokeDasharray="15, 100" strokeDashoffset="-85" strokeLinecap="round" />
              </svg>
              <div className="realtime-legend">
                {sectors.map((s) => (
                  <div key={s.name} className="realtime-legend-item">
                    <span className="realtime-legend-color" style={{ background: s.color }} />
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="realtime-side-card">
            <div>
              <p>Total Portfolio Value</p>
              <p className="realtime-side-value">₹1,25,430.00</p>
              <div className="realtime-side-gain">
                <span>Overall Gain:</span>
                <span className="positive"><span className="material-icons">arrow_upward</span>+7.25%</span>
              </div>
            </div>
            <div className="realtime-side-sector">
              <p>Highest Performing Sector</p>
              <p>Technology <span className="positive">(+10%)</span></p>
            </div>
            <div className="realtime-side-sector">
              <p>Lowest Performing Sector</p>
              <p>Finance <span className="negative">(-5%)</span></p>
            </div>
            <button className="realtime-side-btn">
              <span className="material-icons">refresh</span>
              Refresh Data
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RealTimePrices;
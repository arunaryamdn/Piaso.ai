import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PortfolioTable.css';
import logo from '../assets/logo.png'; // Adjust path as needed
import { usePortfolioTable } from './usePortfolioTable';

const PortfolioTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data, loading, error } = usePortfolioTable(search);
  const safeData = data ?? [];

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', width: '100%' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Portfolio</h1>
        {/* Add any action buttons here, styled with dashboard-add-btn if needed */}
      </div>
      <div className="portfolio-root">
        <header className="portfolio-header">
          <div className="portfolio-logo-row">
            <img src={logo} alt="Paiso.ai Logo" className="portfolio-logo" style={{ height: 32, width: 32 }} />
            <h2>Paiso.ai</h2>
          </div>
          <nav className="portfolio-nav">
            <Link to="/portfolio" className="active">My Portfolio</Link>
            <Link to="/dashboard">Watchlist</Link>
            <Link to="/news">News</Link>
            <Link to="/ai">Analysis</Link>
          </nav>
          <div className="portfolio-header-actions">
            <label className="portfolio-search-label">
              <span className="portfolio-search-icon">
                <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11 0 1 0-11.31,11.31l50.06,50.07a8,8 0 0 0 11.32-11.32ZM40,112a72,72 0 1 1,72,72A72.08,72.08 0 0 1,40,112Z" />
                </svg>
              </span>
              <input
                className="portfolio-search-input"
                placeholder="Search stocks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>
            <div className="portfolio-avatar" />
          </div>
        </header>
        <main className="portfolio-main">
          <div className="portfolio-breadcrumbs">
            <a href="#">My Portfolio</a>
            <span>/</span>
            <span>Infosys</span>
          </div>
          <div className="portfolio-title-row">
            <div>
              <h1>Infosys</h1>
              <p>NSE: INFY</p>
            </div>
            <div className="portfolio-actions">
              <button className="portfolio-btn primary">
                <svg fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                Add to Watchlist
              </button>
              <button className="portfolio-btn secondary">Trade</button>
            </div>
          </div>
          <div className="portfolio-summary-cards">
            <div className="portfolio-summary-card">
              <div>Last Traded Price</div>
              <div className="portfolio-summary-value">₹1,450.25</div>
            </div>
            <div className="portfolio-summary-card">
              <div>Change</div>
              <div className="portfolio-summary-value positive">+₹15.75 (1.1%)</div>
            </div>
            <div className="portfolio-summary-card">
              <div>Open</div>
              <div className="portfolio-summary-value">₹1,435.00</div>
            </div>
            <div className="portfolio-summary-card">
              <div>Volume</div>
              <div className="portfolio-summary-value">2,500,000</div>
            </div>
          </div>
          <div className="portfolio-history-section">
            <div>
              <div>Infosys Stock Price History</div>
              <div className="portfolio-history-value">₹1,450.25</div>
              <div className="portfolio-history-change">1Y <span className="positive">+15%</span></div>
            </div>
            <div className="portfolio-history-range-btns">
              <button>1D</button>
              <button>1W</button>
              <button>1M</button>
              <button>1Y</button>
            </div>
          </div>
          <div className="portfolio-table-wrap">
            {loading ? (
              <div>Loading portfolio...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>Error: {error}</div>
            ) : (
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Ticker</th>
                    <th>Quantity</th>
                    <th>Avg. Price</th>
                    <th>Sector</th>
                  </tr>
                </thead>
                <tbody>
                  {safeData.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#b5cbb0' }}>No portfolio data found.</td></tr>
                  ) : (
                    safeData.map((row, i) => (
                      <tr key={i}>
                        <td className="font-bold">{row.Stock}</td>
                        <td>{row.Ticker}</td>
                        <td>{row.Quantity}</td>
                        <td>₹{row.Avg_Price?.toLocaleString()}</td>
                        <td>{row.Sector}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PortfolioTable;
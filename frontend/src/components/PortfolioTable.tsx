import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PortfolioTable.css';
import logo from '../assets/logo.png'; // Adjust path as needed

const PortfolioTable: React.FC = () => {
  const [search, setSearch] = useState('');
  // Example data, replace with real data as needed
  const data = [
    {
      symbol: 'INFY',
      name: 'Infosys Ltd.',
      quantity: 120,
      avgPrice: 1200,
      ltp: 1450.25,
      change: '+1.1%',
      open: 1435,
      volume: '2,500,000',
      value: 174030,
    },
    // ...more rows
  ];

  return (
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
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Avg. Price</th>
                <th>LTP</th>
                <th>Change (%)</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td className="font-bold">{row.symbol}</td>
                  <td>{row.name}</td>
                  <td>{row.quantity}</td>
                  <td>₹{row.avgPrice.toLocaleString()}</td>
                  <td>₹{row.ltp.toLocaleString()}</td>
                  <td className={row.change.startsWith('+') ? 'positive' : 'negative'}>{row.change}</td>
                  <td>₹{row.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PortfolioTable;
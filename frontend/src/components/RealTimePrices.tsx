import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFromBackend } from '../services/api';

const RealTimePrices: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Placeholder: fetch or set demo data
    setTimeout(() => {
      setData([
        { Symbol: 'TCS', Live_Price: 3500 },
        { Symbol: 'INFY', Live_Price: 1500 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchFromBackend('api/marketstatus')
      .then((res) => setMarketStatus(res?.status || 'closed'))
      .catch((err) => setStatusError(err.message))
      .finally(() => setStatusLoading(false));
  }, []);

  const safeData = data || [];

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', width: '100%' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Real-Time Prices</h1>
        {/* Add any action buttons here, styled with dashboard-add-btn if needed */}
      </div>
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
          <div className="realtime-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ color: '#53d22c', fontWeight: 700 }}>Market Status: {statusLoading ? 'Loading...' : statusError ? 'Error' : marketStatus === 'open' ? 'Open' : 'Closed'}</h2>
            <span style={{ color: marketStatus === 'open' ? '#53d22c' : '#ffb347', fontWeight: 600 }}>
              {marketStatus === 'open' ? 'Live prices updating...' : 'Market closed, showing last updated prices'}
            </span>
          </div>
          <div className="realtime-table-wrap">
            {loading || statusLoading ? (
              <div>Loading real-time prices...</div>
            ) : (
              <table className="realtime-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Live Price</th>
                    <th>Avg. Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {safeData.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#b5cbb0' }}>No real-time price data found.</td></tr>
                  ) : (
                    safeData.map((row: any, i: number) => (
                      <tr key={i}>
                        <td className="font-bold">{row.Symbol}</td>
                        <td>₹{row.Live_Price?.toLocaleString()}</td>
                        <td>₹{row.Avg_Price?.toLocaleString()}</td>
                        <td>{row.Status || (marketStatus === 'open' ? 'Live' : 'Last Updated')}</td>
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

export default RealTimePrices;
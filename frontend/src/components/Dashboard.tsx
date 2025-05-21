import React from 'react';
import { useDashboardData } from './useDashboardData';
import './Dashboard.css';
import logo from '../assets/logo.png'; // Adjust path as needed

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const metrics = (data as any)?.metrics || {};
  const topPerformers = (data as any)?.top_performers || [];
  const topLosers = (data as any)?.top_losers || [];
  const distribution = (data as any)?.distribution || [];
  // Placeholder for asset allocation and chart data
  const assetAllocation = (data as any)?.asset_allocation || [
    { label: 'Stocks', value: 60, color: '#53D22C' },
    { label: 'Mutual Funds', value: 25, color: '#A2C398' },
    { label: 'Bonds', value: 15, color: '#76a369' },
  ];

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div className="dashboard-logo-row">
          <img src={logo} alt="Paiso.ai Logo" className="dashboard-logo" style={{ height: 40, width: 40 }} />
          <h1 className="dashboard-logo-title">Paiso.ai</h1>
        </div>
        <nav className="dashboard-nav">
          <a className="active" href="/dashboard">Dashboard</a>
          <a href="/portfolio">Portfolio</a>
          <a href="/realtime">Real-Time Prices</a>
          <a href="/ai">AI Recommendations</a>
          <a href="/news">News Feed</a>
        </nav>
        <div className="dashboard-header-actions">
          <div className="dashboard-search-wrap">
            <span className="material-icons">search</span>
            <input className="dashboard-search-input" placeholder="Search stocks..." />
          </div>
          <button aria-label="Notifications" className="dashboard-notify-btn">
            <span className="material-icons">notifications</span>
          </button>
          <div className="dashboard-avatar" />
        </div>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-title-row">
          <div>
            <h2>My Portfolio</h2>
            <p>Track your investments and performance with ease.</p>
          </div>
          <button className="dashboard-add-btn">
            <span className="material-icons">add</span>
            Add Transaction
          </button>
        </div>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-title">Total Value</div>
            <div className="card-value">₹{metrics.total_value?.toLocaleString() ?? '0'}</div>
            <div className="card-change positive">
              <span className="material-icons">arrow_upward</span>
              <span>+{metrics.pl_percent ? metrics.pl_percent.toFixed(2) : '0.00'}%</span>
              <span className="card-change-label">vs last month</span>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-title">Profit/Loss</div>
            <div className="card-value">₹{metrics.total_pl?.toLocaleString() ?? '0'}</div>
            <div className="card-change positive">
              <span className="material-icons">arrow_upward</span>
              <span>+{metrics.pl_percent ? metrics.pl_percent.toFixed(2) : '0.00'}%</span>
              <span className="card-change-label">all time</span>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-title">Today's Change</div>
            <div className="card-value text-[#53D22C]">+₹5,000</div>
            <div className="card-change positive">
              <span className="material-icons">trending_up</span>
              <span>+0.4%</span>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-title">Invested Amount</div>
            <div className="card-value">₹{metrics.total_investment?.toLocaleString() ?? '0'}</div>
            <div className="card-change-label" style={{ color: '#b5cbb0', fontSize: '0.95rem', marginTop: 4 }}>Across all assets</div>
          </div>
        </div>
        <div className="dashboard-charts">
          <div className="dashboard-chart-card">
            <div className="dashboard-chart-header">
              <span className="card-title">Portfolio Value Over Time</span>
              <select className="dashboard-chart-select">
                <option>Last 1 Year</option>
                <option>Last 6 Months</option>
                <option>Last 3 Months</option>
                <option>Last 1 Month</option>
              </select>
            </div>
            <div className="card-value text-[#53D22C]" style={{ margin: '1rem 0' }}>+12.5%</div>
            {/* Chart placeholder */}
            <div style={{ minHeight: 200, background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg fill="none" height="120" viewBox="0 0 478 120" width="100%" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#53D22C" strokeLinecap="round" strokeWidth="3" />
              </svg>
            </div>
            <div className="dashboard-chart-months">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m: string) => (
                <span key={m} className="dashboard-chart-month">{m}</span>
              ))}
            </div>
          </div>
          <div className="dashboard-chart-card">
            <div className="card-title">Asset Allocation</div>
            <div className="dashboard-asset-allocation">
              <div className="dashboard-donut-chart">
                {/* Donut chart placeholder */}
                <svg className="block" viewBox="0 0 36 36" width="140" height="140">
                  <circle className="text-[#2E4328]" cx="18" cy="18" r="15.9155" fill="none" stroke="#2E4328" strokeWidth="3.8" />
                  <circle className="text-[#53D22C]" cx="18" cy="18" r="15.9155" fill="none" stroke="#53D22C" strokeWidth="3.8" strokeDasharray="60, 100" strokeLinecap="round" />
                  <circle className="text-[#A2C398]" cx="18" cy="18" r="15.9155" fill="none" stroke="#A2C398" strokeWidth="3.8" strokeDasharray="25, 100" strokeDashoffset="-60" strokeLinecap="round" />
                  <circle className="text-[#76a369]" cx="18" cy="18" r="15.9155" fill="none" stroke="#76a369" strokeWidth="3.8" strokeDasharray="15, 100" strokeDashoffset="-85" strokeLinecap="round" />
                </svg>
              </div>
              <div className="dashboard-asset-legend">
                {assetAllocation.map((a: any, i: number) => (
                  <div key={a.label} className="dashboard-asset-legend-item">
                    <span className="dashboard-asset-legend-color" style={{ background: a.color }} />
                    <span>{a.label}</span>
                    <span className="dashboard-asset-legend-value">{a.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-table-wrap">
          <h3 className="dashboard-table-title">Holdings</h3>
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
              {/* Example row, replace with dynamic data if available */}
              <tr>
                <td className="font-bold">RELIANCE</td>
                <td>Reliance Industries Ltd.</td>
                <td>100</td>
                <td>₹2,200.00</td>
                <td>₹2,350.50</td>
                <td className="positive">+2.50%</td>
                <td>₹235,050</td>
              </tr>
              {/* Add more rows dynamically as needed */}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
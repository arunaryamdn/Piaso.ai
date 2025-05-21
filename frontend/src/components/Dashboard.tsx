import React, { useEffect, useState } from 'react';
import { useDashboardData, DashboardMetrics } from './useDashboardData';
import './Dashboard.css';
import logo from '../assets/logo.png'; // Adjust path as needed
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchFromBackend } from '../services/api';

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const metrics: DashboardMetrics = (data?.metrics || {}) as DashboardMetrics;
  const [historical, setHistorical] = useState<any[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(true);
  const [historicalError, setHistoricalError] = useState<string | null>(null);

  useEffect(() => {
    fetchFromBackend('api/historical')
      .then((res) => setHistorical(res || []))
      .catch((err) => setHistoricalError(err.message))
      .finally(() => setHistoricalLoading(false));
  }, []);

  // Asset allocation: expects { Stocks: 60, MutualFunds: 25, Bonds: 15, ... }
  const assetAllocation = metrics.asset_allocation
    ? Object.entries(metrics.asset_allocation).map(([label, value], i) => ({
      label,
      value,
      color: ['#53D22C', '#A2C398', '#76a369', '#7ecbff', '#ffb347'][i % 5],
    }))
    : [];

  // Holdings: expects array of { symbol, name, quantity, avg_price, ltp, change, value }
  const holdings = metrics.holdings || [];

  // Calculate today's change and percent
  const todayChange = (metrics as any)?.today_change || 0;
  const todayChangePercent = (metrics as any)?.today_change_percent || 0;
  const todayChangePositive = todayChange >= 0;

  // Calculate profit/loss percent
  const plPercent = metrics.pl_percent ?? 0;
  const plPositive = plPercent >= 0;

  // Calculate vs last month percent (if available)
  const vsLastMonthPercent = (metrics as any)?.vs_last_month_percent ?? plPercent;
  const vsLastMonthPositive = vsLastMonthPercent >= 0;

  return (
    <div className="dashboard-root">
      <main className="main-content">
        <div className="dashboard-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', width: '100%' }}>
          <div>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '0.3em', color: '#fff' }}>My Portfolio</h1>
            <p style={{ fontSize: '1.2rem', color: '#b5cbb0', margin: 0 }}>Track your investments and performance with ease.</p>
          </div>
        </div>
        {loading ? (
          <div>Loading dashboard...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>Error: {error}</div>
        ) : (
          <>
            <div className="dashboard-cards-grid">
              <div className="dashboard-card">
                <div className="card-title">Total Value</div>
                <div className="card-value">₹{metrics.total_value?.toLocaleString() ?? '0'}</div>
                <div className={`card-change ${vsLastMonthPositive ? 'positive' : 'negative'}`}>
                  <span className="material-icons">{vsLastMonthPositive ? 'arrow_upward' : 'arrow_downward'}</span>
                  <span>{vsLastMonthPositive ? '+' : ''}{vsLastMonthPercent?.toFixed(2) ?? '0.00'}%</span>
                  <span className="card-change-label">vs last month</span>
                </div>
              </div>
              <div className="dashboard-card">
                <div className="card-title">Profit/Loss</div>
                <div className="card-value">₹{metrics.total_pl?.toLocaleString() ?? '0'}</div>
                <div className={`card-change ${plPositive ? 'positive' : 'negative'}`}>
                  <span className="material-icons">{plPositive ? 'arrow_upward' : 'arrow_downward'}</span>
                  <span>{plPositive ? '+' : ''}{plPercent?.toFixed(2) ?? '0.00'}%</span>
                  <span className="card-change-label">all time</span>
                </div>
              </div>
              <div className="dashboard-card">
                <div className="card-title">Today's Change</div>
                <div className={`card-value ${todayChangePositive ? 'positive' : 'negative'}`}>{todayChangePositive ? '+' : ''}₹{todayChange?.toLocaleString() ?? '0'}</div>
                <div className={`card-change ${todayChangePositive ? 'positive' : 'negative'}`}>
                  <span className="material-icons">{todayChangePositive ? 'trending_up' : 'trending_down'}</span>
                  <span>{todayChangePositive ? '+' : ''}{todayChangePercent?.toFixed(2) ?? '0.00'}%</span>
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
                </div>
                {historicalLoading ? (
                  <div>Loading chart...</div>
                ) : historicalError ? (
                  <div style={{ color: 'red' }}>Error: {historicalError}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={historical} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="portfolio_value" stroke="#53D22C" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="dashboard-chart-card">
                <div className="card-title">Asset Allocation</div>
                <div className="dashboard-asset-allocation">
                  <div className="dashboard-donut-chart">
                    {/* Donut chart placeholder, can be replaced with a real chart */}
                    <svg className="block" viewBox="0 0 36 36" width="140" height="140">
                      <circle className="text-[#2E4328]" cx="18" cy="18" r="15.9155" fill="none" stroke="#2E4328" strokeWidth="3.8" />
                      {assetAllocation.reduce((acc, a, i) => {
                        const prev = acc.offset;
                        const dash = a.value;
                        acc.offset += dash;
                        acc.circles.push(
                          <circle
                            key={a.label}
                            cx="18" cy="18" r="15.9155" fill="none"
                            stroke={a.color}
                            strokeWidth="3.8"
                            strokeDasharray={`${dash}, 100`}
                            strokeDashoffset={`-${prev}`}
                            strokeLinecap="round"
                          />
                        );
                        return acc;
                      }, { offset: 0, circles: [] as any[] }).circles}
                    </svg>
                  </div>
                  <div className="dashboard-asset-legend">
                    {assetAllocation.map((a: any) => (
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
                  {holdings.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#b5cbb0' }}>No holdings found.</td></tr>
                  ) : (
                    holdings.map((row: any, i: number) => (
                      <tr key={i}>
                        <td className="font-bold">{row.symbol}</td>
                        <td>{row.name}</td>
                        <td>{row.quantity}</td>
                        <td>₹{row.avg_price?.toLocaleString()}</td>
                        <td>₹{row.ltp?.toLocaleString()}</td>
                        <td className={row.change >= 0 ? 'positive' : 'negative'}>{row.change >= 0 ? '+' : ''}{row.change}%</td>
                        <td>₹{row.value?.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
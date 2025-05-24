import React, { useEffect, useState } from 'react';
import { useDashboardData, DashboardMetrics } from './useDashboardData';
import './Dashboard.css';
import logo from '../assets/logo.png'; // Adjust path as needed
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchFromBackend } from '../services/api';
import { motion } from 'framer-motion';
import PortfolioUpload from './PortfolioUpload';
import { mapPortfolioData } from '../utils/portfolioMapping';

const Dashboard: React.FC = () => {
  const [reloadCount, setReloadCount] = useState(0);
  const { data, loading, error } = useDashboardData(reloadCount);
  const metrics: DashboardMetrics = (data?.metrics || {}) as DashboardMetrics;
  const [historical, setHistorical] = useState<any[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(true);
  const [historicalError, setHistoricalError] = useState<string | null>(null);
  const [portfolioStatus, setPortfolioStatus] = useState<'unknown' | 'processing' | 'ready' | 'failed' | 'not_found'>('unknown');

  useEffect(() => {
    fetchFromBackend('api/historical')
      .then((res) => setHistorical(res || []))
      .catch((err) => setHistoricalError(err.message))
      .finally(() => setHistoricalLoading(false));
  }, []);

  useEffect(() => {
    // Fetch portfolio status on mount
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/portfolio/status', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setPortfolioStatus(data.status);
      } catch {
        setPortfolioStatus('failed');
      }
    };
    fetchStatus();
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
  const holdings = mapPortfolioData(metrics.holdings || []);

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

  // Determine if empty state (no investments, no value, no holdings)
  const isEmpty =
    (!metrics.total_investment || metrics.total_investment === 0) &&
    (!metrics.total_value || metrics.total_value === 0) &&
    (!holdings || holdings.length === 0);

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
          <div className="text-red-500">Error: {error}</div>
        ) : portfolioStatus === 'failed' ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] mt-4 mb-6">
            <div className="text-2xl font-bold text-red-500 mb-4">Portfolio processing failed.</div>
            <div className="text-lg text-gray-300 mb-6">Please upload a new portfolio file to continue.</div>
            <PortfolioUpload onUploadSuccess={() => setReloadCount(c => c + 1)} />
          </div>
        ) : isEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center min-h-[40vh] mt-4 mb-6 bg-gradient-to-br from-[#232837] to-[#1a2233] rounded-2xl shadow-2xl p-7 w-full max-w-xl mx-auto border-2 border-[#53D22C]/30 relative overflow-hidden"
            style={{ boxShadow: '0 0 32px 0 #53D22C22, 0 4px 32px 0 rgba(40,255,80,0.10)' }}
          >
            {/* Finance-themed SVG illustration */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
              className="mb-3"
            >
              <svg width="110" height="90" viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="30" width="90" height="50" rx="10" fill="#232837" stroke="#53D22C" strokeWidth="2.5" />
                <rect x="20" y="40" width="70" height="30" rx="6" fill="#7ecbff" fillOpacity="0.13" />
                <rect x="30" y="55" width="10" height="15" rx="2" fill="#53D22C" />
                <rect x="45" y="50" width="10" height="20" rx="2" fill="#A2C398" />
                <rect x="60" y="60" width="10" height="10" rx="2" fill="#7ecbff" />
                <rect x="75" y="48" width="10" height="22" rx="2" fill="#ffb347" />
                <circle cx="55" cy="35" r="7" fill="#53D22C" fillOpacity="0.18" />
                <path d="M55 35v-10" stroke="#53D22C" strokeWidth="2" strokeLinecap="round" />
                <circle cx="55" cy="25" r="2" fill="#53D22C" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-extrabold text-[#53D22C] mb-2 text-center">Welcome to your Paiso.ai Dashboard!</h2>
            <p className="text-[#b5cbb0] text-base mb-4 max-w-lg text-center">
              Get started by uploading your portfolio or adding your first investment. Paiso.ai will help you track, analyze, and grow your wealth with smart insights.
            </p>
            <div className="mb-4 w-full flex justify-center">
              <PortfolioUpload onUploadSuccess={() => setReloadCount(c => c + 1)} />
            </div>
            {/* Use cases/info section */}
            <div className="mt-7 w-full flex flex-col items-center">
              <h3 className="text-lg font-bold text-white mb-2">What can you do with Paiso.ai?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                <motion.div
                  className="bg-[#232837] rounded-lg p-4 flex items-center gap-3 shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="material-icons text-2xl text-[#7ecbff] animate-bounce">insights</span>
                  <div>
                    <div className="font-semibold text-white">AI-powered Analytics</div>
                    <div className="text-[#b5cbb0] text-xs">Get actionable insights and recommendations for your portfolio.</div>
                  </div>
                </motion.div>
                <motion.div
                  className="bg-[#232837] rounded-lg p-4 flex items-center gap-3 shadow-md"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="material-icons text-2xl text-[#53D22C] animate-pulse">pie_chart</span>
                  <div>
                    <div className="font-semibold text-white">Sector & Asset Allocation</div>
                    <div className="text-[#b5cbb0] text-xs">Visualize your investments by sector and asset class.</div>
                  </div>
                </motion.div>
                <motion.div
                  className="bg-[#232837] rounded-lg p-4 flex items-center gap-3 shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="material-icons text-2xl text-[#ffb347] animate-bounce">trending_up</span>
                  <div>
                    <div className="font-semibold text-white">Track Performance</div>
                    <div className="text-[#b5cbb0] text-xs">Monitor your returns, profit/loss, and daily changes.</div>
                  </div>
                </motion.div>
                <motion.div
                  className="bg-[#232837] rounded-lg p-4 flex items-center gap-3 shadow-md"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="material-icons text-2xl text-[#A2C398] animate-pulse">bolt</span>
                  <div>
                    <div className="font-semibold text-white">Real-time Prices</div>
                    <div className="text-[#b5cbb0] text-xs">Stay updated with live market prices and news.</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="dashboard-cards-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.13,
                },
              },
            }}
          >
            <motion.div
              className="dashboard-card"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <div className="card-title">Total Value</div>
              <div className="card-value">₹{metrics.total_value?.toLocaleString() ?? '0'}</div>
              <div className={`card-change ${vsLastMonthPositive ? 'positive' : 'negative'}`}>
                <span className="material-icons">{vsLastMonthPositive ? 'arrow_upward' : 'arrow_downward'}</span>
                <span>{vsLastMonthPositive ? '+' : ''}{vsLastMonthPercent?.toFixed(2) ?? '0.00'}%</span>
                <span className="card-change-label">vs last month</span>
              </div>
            </motion.div>
            <motion.div
              className="dashboard-card"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <div className="card-title">Profit/Loss</div>
              <div className="card-value">₹{metrics.total_pl?.toLocaleString() ?? '0'}</div>
              <div className={`card-change ${plPositive ? 'positive' : 'negative'}`}>
                <span className="material-icons">{plPositive ? 'arrow_upward' : 'arrow_downward'}</span>
                <span>{plPositive ? '+' : ''}{plPercent?.toFixed(2) ?? '0.00'}%</span>
                <span className="card-change-label">all time</span>
              </div>
            </motion.div>
            <motion.div
              className="dashboard-card"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <div className="card-title">Today's Change</div>
              <div className={`card-value ${todayChangePositive ? 'positive' : 'negative'}`}>{todayChangePositive ? '+' : ''}₹{todayChange?.toLocaleString() ?? '0'}</div>
              <div className={`card-change ${todayChangePositive ? 'positive' : 'negative'}`}>
                <span className="material-icons">{todayChangePositive ? 'trending_up' : 'trending_down'}</span>
                <span>{todayChangePositive ? '+' : ''}{todayChangePercent?.toFixed(2) ?? '0.00'}%</span>
              </div>
            </motion.div>
            <motion.div
              className="dashboard-card"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <div className="card-title">Invested Amount</div>
              <div className="card-value">₹{metrics.total_investment?.toLocaleString() ?? '0'}</div>
              <div className="card-change-label" style={{ color: '#b5cbb0', fontSize: '0.95rem', marginTop: 4 }}>Across all assets</div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
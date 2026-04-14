// DashboardPage.tsx
// Dashboard page for Paiso.ai. Shows portfolio analytics and summary cards.

import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSkeleton from './LoadingSkeleton';
import { UI_STRINGS, API } from '../config';
import { DashboardCard } from '../components/DashboardCard';
import { MdShowChart, MdTrendingUp, MdToday, MdAccountBalanceWallet, MdStar, MdTrendingDown, MdTimeline } from 'react-icons/md';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import PortfolioUpload from '../components/PortfolioUpload';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import ReactTooltip from 'react-tooltip';

const TIMEFRAME_OPTIONS = [
    { value: 'last_year', label: 'Last year' },
    { value: 'last_month', label: 'Last month' },
    { value: 'last_week', label: 'Last week' },
    { value: 'last_day', label: 'Last day' },
    { value: 'today', label: 'Today' },
];
const TIMEFRAME_LABELS: Record<string, string> = {
    last_year: 'last year',
    last_month: 'last month',
    last_week: 'last week',
    last_day: 'last day',
    today: 'today',
};

const TOOLTIP_TEXT = {
    totalValue: 'Total portfolio value at the selected point in time. Includes all holdings at their market price.',
    profitLoss: 'Total profit or loss for your portfolio, calculated as the difference between market value and invested amount for the selected timeframe.',
    todaysChange: 'Profit or loss for the selected period. Use the dropdown to see change for today, this week, month, or year.',
    investedAmount: 'The total amount you have invested in your portfolio (sum of all buy prices × quantity).',
    topPerformer: 'The stock in your portfolio with the highest return (P/L %) for the selected timeframe.',
    topLoser: 'The stock in your portfolio with the highest loss (P/L %) for the selected timeframe.',
    cagr: 'Compound Annual Growth Rate',
};

// Helper to format currency
const formatINR = (val: number | undefined) =>
    typeof val === 'number' ? val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '--';
// Helper to format percent
const formatPercent = (val: number | undefined) =>
    typeof val === 'number' ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '--';

// Skeleton shimmer for cards
const CardSkeleton = () => (
    <div className="min-h-[180px] min-w-[0] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px] lg:min-w-[320px] flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a2615]/60 to-[#1a2615]/80 shadow animate-pulse p-6 w-full">
        <div className="flex items-center gap-1 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#232837]/40" />
            <div className="h-4 w-24 rounded bg-[#232837]/40" />
            <div className="h-4 w-4 rounded bg-[#232837]/40" />
        </div>
        <div className="h-8 w-32 rounded bg-[#232837]/40 mb-1" />
        <div className="h-4 w-20 rounded bg-[#232837]/30" />
    </div>
);

const MiniCardSkeletons = () => (
    <div className="min-h-[120px] w-full flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a2615]/60 to-[#1a2615]/80 shadow animate-pulse p-8">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#232837]/40" />
            <div className="h-4 w-32 rounded bg-[#232837]/40" />
        </div>
        <div className="h-8 w-40 rounded bg-[#232837]/40 mb-2" />
        <div className="h-4 w-60 rounded bg-[#232837]/30" />
    </div>
);

const MiniStockCard = ({ symbol, name, sparkline }: any) => (
    <div className="flex flex-col items-center w-full">
        <h4 className="text-base font-semibold text-white mb-2">{name}</h4>
        <div className="w-full max-w-3xl h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="price" stroke="#7ecbff" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const COLORS = ['#53d22c', '#7ecbff', '#ffb300', '#ffd700', '#ff5a5a', '#b2e3a7', '#3d2c1a', '#2c1a3d'];

// Dedicated skeleton for Total Value card
const TotalValueCardSkeleton = () => (
    <div className="min-h-[180px] min-w-[0] sm:min-h-[200px] md:min-h-[220px] md:text-xl lg:min-h-[240px] lg:min-w-[320px] p-7 flex flex-col items-start shadow-xl rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a2615]/60 to-[#1a2615]/80 w-full">
        <div className="flex items-center w-full justify-between mb-2">
            <div className="flex items-center gap-1 min-w-0">
                <div className="text-2xl h-8 w-8 rounded-full bg-[#232837]/40" />
                <div className="font-bold text-lg h-4 w-24 rounded bg-[#232837]/40" />
                <div className="h-4 w-4 rounded bg-[#232837]/40" />
            </div>
            <div className="flex-shrink-0">
                <div className="h-8 w-24 rounded bg-[#232837]/40" />
            </div>
        </div>
        <div className="text-2xl font-extrabold mb-1 h-8 w-32 rounded bg-[#232837]/40" />
        <div className="text-sm font-semibold h-4 w-20 rounded bg-[#232837]/30" />
    </div>
);

const DashboardPage: React.FC = () => {
    const [portfolioStatus, setPortfolioStatus] = useState<'unknown' | 'processing' | 'ready' | 'failed' | 'not_found'>('unknown');
    const { metrics, sector, loading: analyticsLoading, error: analyticsError } = useDashboardAnalytics();

    // Fetch portfolio status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await fetch(`${API.BASE_URL}/api/portfolio/status`, {
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

    if (analyticsLoading) {
        return (
            <div className="dashboard-loading">
                <LoadingSkeleton type="card" width="100%" height={120} count={6} />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="dashboard-container">
                {portfolioStatus === 'not_found' && (
                    <div className="upload-prompt">
                        <PortfolioUpload onUploadSuccess={() => setPortfolioStatus('ready')} />
                    </div>
                )}

                {analyticsError && (
                    <div className="error-message">
                        {analyticsError}
                    </div>
                )}

                {/* Dashboard content */}
                {portfolioStatus === 'ready' && !analyticsLoading && !analyticsError && (
                    <div className="dashboard-content">
                        {/* Existing dashboard content */}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default DashboardPage; 
// DashboardPage.tsx
// Dashboard page for Paiso.ai. Shows portfolio analytics and summary cards.

import React, { useState, useEffect } from 'react';
import { UI_STRINGS } from '../config';
import { DashboardCard } from '../components/DashboardCard';
import { MdShowChart, MdTrendingUp, MdToday, MdAccountBalanceWallet, MdStar, MdTrendingDown, MdTimeline } from 'react-icons/md';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import PortfolioUpload from '../components/PortfolioUpload';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';

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
    <div className="min-h-[180px] flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a2615]/60 to-[#1a2615]/80 shadow animate-pulse p-7 w-full">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#232837]/40" />
            <div className="h-4 w-24 rounded bg-[#232837]/40" />
        </div>
        <div className="h-8 w-32 rounded bg-[#232837]/40 mb-2" />
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

const DashboardPage: React.FC = () => {
    // Per-card state
    const [totalValue, setTotalValue] = useState<{ value?: number; percent?: number } | null>(null);
    const [totalValueLoading, setTotalValueLoading] = useState(false);
    const [totalValueTF, setTotalValueTF] = useState('last_month');

    const [profitLoss, setProfitLoss] = useState<{ value?: number; percent?: number } | null>(null);
    const [profitLossLoading, setProfitLossLoading] = useState(false);
    const [profitLossTF, setProfitLossTF] = useState('last_month');

    const [todaysChange, setTodaysChange] = useState<{ value?: number; percent?: number } | null>(null);
    const [todaysChangeLoading, setTodaysChangeLoading] = useState(false);
    const [todaysChangeTF, setTodaysChangeTF] = useState('last_month');

    const [topPerformer, setTopPerformer] = useState<{ name: string | null; percent: number } | null>(null);
    const [topPerformerLoading, setTopPerformerLoading] = useState(false);
    const [topPerformerTF, setTopPerformerTF] = useState('last_month');

    // Add state for new cards/charts
    const [topLoser, setTopLoser] = useState<{ name: string | null; percent: number } | null>(null);
    const [topLoserLoading, setTopLoserLoading] = useState(false);
    const [topLoserTF, setTopLoserTF] = useState('last_month');
    const [cagr, setCagr] = useState<number | null>(null);
    const [cagrLoading, setCagrLoading] = useState(false);
    const [cagrTF, setCagrTF] = useState('last_month');
    const [showNifty, setShowNifty] = useState(false);
    const [portfolioStatus, setPortfolioStatus] = useState<'unknown' | 'processing' | 'ready' | 'failed' | 'not_found'>('unknown');

    // Replace all analytics state and fetches with the hook
    const { metrics, sector, historical, holdings, loading: analyticsLoading, error: analyticsError } = useDashboardAnalytics(totalValueTF);

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

    // Always call this useEffect, but only load dashboard data if portfolio is present
    useEffect(() => {
        if (portfolioStatus !== 'not_found' && portfolioStatus !== 'failed') {
            // Fetch all cards for 'last_month' on mount
            setTotalValueLoading(true);
            setProfitLossLoading(true);
            setTodaysChangeLoading(true);
            setTopPerformerLoading(true);
            setTopLoserLoading(true);
            setCagrLoading(true);
        }
    }, [portfolioStatus]);

    // Handler for successful upload
    const handleUploadSuccess = () => {
        setPortfolioStatus('ready');
        // Optionally, reload all dashboard data here
        window.location.reload(); // simplest way to refresh all state
    };

    // Conditional rendering for upload prompt
    let content = null;
    if (portfolioStatus === 'not_found' || portfolioStatus === 'failed') {
        content = (
            <div className="flex flex-col items-center justify-center min-h-[60vh] mt-4 mb-6">
                <div className="text-2xl font-bold text-[#53D22C] mb-4">Welcome to your Paiso.ai Dashboard!</div>
                <div className="text-lg text-gray-300 mb-6 text-center max-w-xl">Get started by uploading your portfolio. Paiso.ai will help you track, analyze, and grow your wealth with smart insights.</div>
                <PortfolioUpload onUploadSuccess={handleUploadSuccess} />
            </div>
        );
    } else {
        content = (
            <div className="w-full min-h-[80vh] flex flex-col items-center justify-start py-10 px-2 md:px-0">
                {/* Header Bar */}
                <div className="w-full max-w-6xl flex items-center justify-between mb-8 px-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-[#232837]/40">
                            <FaBell size={22} className="text-[#7ecbff]" />
                            {/* Notification dot */}
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff5a5a] rounded-full" />
                        </button>
                        <FaUserCircle size={32} className="text-[#b2e3a7]" />
                    </div>
                </div>
                {/* Invested Amount Card on top */}
                <div className="w-full flex flex-col items-center mb-8">
                    {analyticsLoading ? (
                        <CardSkeleton />
                    ) : (
                        <DashboardCard
                            icon={<span className="bg-[#1a3d1a]/60 rounded-full p-2 shadow"><MdAccountBalanceWallet size={28} /></span>}
                            label="Invested Amount"
                            value={<span className="text-2xl font-extrabold">{formatINR(metrics?.invested_amount)}</span>}
                            percent={<span className="text-base text-[#b2e3a7]">{TOOLTIP_TEXT.investedAmount}</span>}
                            percentColor="#b2e3a7"
                            tooltip={TOOLTIP_TEXT.investedAmount}
                            accentColor="#b2e3a7"
                            className="w-full px-6 py-6 bg-gradient-to-br from-[#1a3d1a]/60 to-[#1a2615]/80 border border-[#b2e3a7]/20 shadow-[0_2px_16px_0_#b2e3a733] min-h-[120px] max-w-6xl"
                        />
                    )}
                </div>
                {/* Summary Cards Grid */}
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 mx-auto">
                    {/* Total Value Card */}
                    <DashboardCard
                        icon={<span className="bg-[#1a3d1a]/60 rounded-full p-3 shadow-lg"><MdShowChart size={32} /></span>}
                        label="Total Value"
                        value={analyticsLoading ? <CardSkeleton /> : formatINR(metrics?.total_value?.[totalValueTF])}
                        percent={analyticsLoading ? <div className="h-4 w-20 rounded bg-[#232837]/30 animate-pulse" /> : `${formatPercent(metrics?.change_percent?.[totalValueTF])} vs ${TIMEFRAME_LABELS[totalValueTF]}`}
                        percentColor="#7ecbff"
                        dropdownOptions={TIMEFRAME_OPTIONS}
                        dropdownValue={totalValueTF}
                        onDropdownChange={async (val) => { setTotalValueTF(val); setTotalValueLoading(true); }}
                        tooltip={TOOLTIP_TEXT.totalValue}
                        accentColor="#53d22c"
                        className="min-h-[180px]"
                    />
                    {/* Profit/Loss Card */}
                    <DashboardCard
                        icon={<span className="bg-[#1a2c3d]/60 rounded-full p-3 shadow-lg"><MdTrendingUp size={32} /></span>}
                        label="Profit/Loss"
                        value={analyticsLoading ? <CardSkeleton /> : formatINR(metrics?.profit_loss?.[profitLossTF])}
                        percent={analyticsLoading ? <div className="h-4 w-20 rounded bg-[#232837]/30 animate-pulse" /> : `${formatPercent(metrics?.change_percent?.[profitLossTF])} vs ${TIMEFRAME_LABELS[profitLossTF]}`}
                        percentColor={metrics?.change_percent?.[profitLossTF] && metrics?.change_percent?.[profitLossTF] >= 0 ? '#53d22c' : '#ff5a5a'}
                        dropdownOptions={TIMEFRAME_OPTIONS}
                        dropdownValue={profitLossTF}
                        onDropdownChange={async (val) => { setProfitLossTF(val); setProfitLossLoading(true); }}
                        tooltip={TOOLTIP_TEXT.profitLoss}
                        accentColor="#7ecbff"
                        className="min-h-[180px]"
                    />
                    {/* Change Card */}
                    <DashboardCard
                        icon={<span className="bg-[#3d2c1a]/60 rounded-full p-3 shadow-lg"><MdToday size={32} /></span>}
                        label="Change"
                        value={analyticsLoading ? <CardSkeleton /> : formatINR(metrics?.profit_loss?.[todaysChangeTF])}
                        percent={analyticsLoading ? <div className="h-4 w-20 rounded bg-[#232837]/30 animate-pulse" /> : `${formatPercent(metrics?.change_percent?.[todaysChangeTF])} vs ${TIMEFRAME_LABELS[todaysChangeTF]}`}
                        percentColor={metrics?.change_percent?.[todaysChangeTF] && metrics?.change_percent?.[todaysChangeTF] >= 0 ? '#53d22c' : '#ff5a5a'}
                        dropdownOptions={TIMEFRAME_OPTIONS}
                        dropdownValue={todaysChangeTF}
                        onDropdownChange={async (val) => { setTodaysChangeTF(val); setTodaysChangeLoading(true); }}
                        tooltip={TOOLTIP_TEXT.todaysChange}
                        accentColor="#ffb300"
                        className="min-h-[180px]"
                    />
                    {/* Top Performer Card */}
                    <DashboardCard
                        icon={<span className="bg-[#2c1a3d]/60 rounded-full p-3 shadow-lg"><MdStar size={32} /></span>}
                        label="Top Performer"
                        value={analyticsLoading ? <CardSkeleton /> : (
                            <span className="text-[#ffd700] font-bold">{metrics?.top_performer?.[topPerformerTF]?.name ?? '--'} <span className="text-xs text-[#b5cbb0]">({formatPercent(metrics?.top_performer?.[topPerformerTF]?.percent)})</span></span>
                        )}
                        percent={null}
                        dropdownOptions={TIMEFRAME_OPTIONS}
                        dropdownValue={topPerformerTF}
                        onDropdownChange={async (val) => { setTopPerformerTF(val); setTopPerformerLoading(true); }}
                        tooltip={TOOLTIP_TEXT.topPerformer}
                        accentColor="#ffd700"
                        className="min-h-[180px]"
                    />
                    {/* Top Loser Card */}
                    <DashboardCard
                        icon={<span className="bg-[#3d2c1a]/60 rounded-full p-3 shadow-lg"><MdTrendingDown size={32} /></span>}
                        label="Top Loser"
                        value={analyticsLoading ? <CardSkeleton /> : (
                            <span className="text-[#ff5a5a] font-bold">{metrics?.top_loser?.[topLoserTF]?.name ?? '--'} <span className="text-xs text-[#b5cbb0]">({formatPercent(metrics?.top_loser?.[topLoserTF]?.percent)})</span></span>
                        )}
                        percent={null}
                        dropdownOptions={TIMEFRAME_OPTIONS}
                        dropdownValue={topLoserTF}
                        onDropdownChange={async (val) => { setTopLoserTF(val); setTopLoserLoading(true); }}
                        tooltip={TOOLTIP_TEXT.topLoser}
                        accentColor="#ff5a5a"
                        className="min-h-[180px]"
                    />
                    {/* CAGR Card */}
                    <DashboardCard
                        icon={<span className="bg-[#1a3d1a]/60 rounded-full p-3 shadow-lg"><MdTimeline size={32} /></span>}
                        label="CAGR"
                        value={analyticsLoading ? <CardSkeleton /> : `${metrics?.cagr?.[cagrTF]?.toFixed(2) ?? '--'}%`}
                        percent={<span className="text-xs text-[#7ecbff]">Compound Annual Growth Rate</span>}
                        percentColor="#7ecbff"
                        dropdownOptions={TIMEFRAME_OPTIONS}
                        dropdownValue={cagrTF}
                        onDropdownChange={async (val) => { setCagrTF(val); setCagrLoading(true); }}
                        tooltip={TOOLTIP_TEXT.cagr}
                        accentColor="#53d22c"
                        className="min-h-[180px]"
                    />
                </div>
                {/* Analytics Section: Stacked cards below summary cards */}
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-6xl mx-auto mb-8">
                        <DashboardCard
                            icon={<span className="bg-[#1a3d1a]/60 rounded-full p-2 shadow"><MdAccountBalanceWallet size={28} /></span>}
                            label="Sector Allocation"
                            value={analyticsLoading ? <CardSkeleton /> : analyticsError ? <div className="text-red-500">{analyticsError}</div> : !sector.length ? <div className="text-gray-400">No sector data available.</div> : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={sector} dataKey="Current_Value" nameKey="Sector" cx="50%" cy="50%" outerRadius={90} label>
                                            {sector.map((entry: any, idx: number) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                            percent={null}
                            accentColor="#53d22c"
                            tooltip="Breakdown of your portfolio by sector."
                            className="min-h-[380px]"
                        />
                    </div>
                    <div className="w-full max-w-6xl mx-auto mb-8">
                        <DashboardCard
                            icon={<span className="bg-[#1a3d1a]/60 rounded-full p-2 shadow"><MdTimeline size={28} /></span>}
                            label="Historical Performance"
                            value={analyticsLoading ? <CardSkeleton /> : analyticsError ? <div className="text-red-500">{analyticsError}</div> : !historical.length ? <div className="text-gray-400">No historical data available.</div> : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={historical}>
                                        <XAxis dataKey="Date" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="Portfolio_Value" stroke="#7ecbff" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                            percent={null}
                            accentColor="#7ecbff"
                            tooltip="Your portfolio value over time."
                            className="min-h-[380px]"
                        />
                    </div>
                    <div className="w-full max-w-6xl mx-auto mb-8">
                        <DashboardCard
                            icon={<span className="bg-[#1a3d1a]/60 rounded-full p-2 shadow"><MdTrendingUp size={28} /></span>}
                            label="Stock-wise Performance"
                            value={analyticsLoading ? <CardSkeleton /> : analyticsError ? <div className="text-red-500">{analyticsError}</div> : !holdings.length ? <div className="text-gray-400">No stock-wise data available.</div> : (
                                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto w-full">
                                    {holdings.map((stock: any) => (
                                        <div key={stock.symbol} className="rounded-xl bg-[#232837]/80 p-4 flex items-center gap-4 shadow border border-white/10">
                                            <div className="flex-1">
                                                <div className="font-bold text-white text-lg">{stock.symbol}</div>
                                                <div className="text-[#b5cbb0] text-xs">Qty: {stock.quantity} | Avg: ₹{stock.avg_price}</div>
                                            </div>
                                            {/* Sparkline */}
                                            <div className="w-32 h-8">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={stock.sparkline}>
                                                        <Line type="monotone" dataKey="price" stroke="#7ecbff" strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            percent={null}
                            accentColor="#ffb300"
                            tooltip="Performance of each stock in your portfolio."
                            className="min-h-[380px]"
                        />
                    </div>
                </div>
            </div>
        );
    }
    return content;
};

export default DashboardPage; 
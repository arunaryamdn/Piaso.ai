import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSkeleton from './LoadingSkeleton';
import { UI_STRINGS, API } from '../config';
import { DashboardCard } from '../components/DashboardCard';
import { MdShowChart, MdTrendingUp, MdToday, MdAccountBalanceWallet } from 'react-icons/md';
import SectorAnalysis from './SectorAnalysis';
import HistoricalPerformance from './HistoricalPerformance';
import StockWisePerformance from './StockWisePerformance';
import PortfolioUpload from '../components/PortfolioUpload';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';

const TIMEFRAME_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'last_week', label: 'Last week' },
    { value: 'last_month', label: 'Last month' },
    { value: 'last_year', label: 'Last year' },
];

const formatINR = (val: number | undefined) =>
    typeof val === 'number'
        ? val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
        : '--';

const formatPercent = (val: number | undefined) =>
    typeof val === 'number' ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '--';

const DashboardPage: React.FC = () => {
    const [timeframe, setTimeframe] = useState('today');
    const [portfolioStatus, setPortfolioStatus] = useState<'unknown' | 'processing' | 'ready' | 'failed' | 'not_found'>('unknown');
    const [reloadKey, setReloadKey] = useState(0);
    const { metrics, loading: analyticsLoading, error: analyticsError } = useDashboardAnalytics(reloadKey);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        fetch(`${API.BASE_URL}/api/portfolio/status`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(r => r.json())
            .then(d => setPortfolioStatus(d.status))
            .catch(() => setPortfolioStatus('failed'));
    }, [reloadKey]);

    if (portfolioStatus === 'not_found') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <p className="text-xl text-[#7ecbff] font-semibold mb-6">{UI_STRINGS.DASHBOARD.EMPTY_STATE}</p>
                <PortfolioUpload onUploadSuccess={() => { setPortfolioStatus('ready'); setReloadKey(k => k + 1); }} />
            </div>
        );
    }

    if (portfolioStatus === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="text-2xl font-bold text-[#53d22c] flex items-center gap-2">
                    <span className="animate-spin inline-block">⏳</span> Processing your portfolio…
                </div>
                <p className="text-gray-400">This may take a few moments. Feel free to explore the app.</p>
            </div>
        );
    }

    if (analyticsLoading || portfolioStatus === 'unknown') {
        return (
            <div className="p-6 flex flex-col gap-6">
                <LoadingSkeleton type="card" width="100%" height={130} count={4} />
                <LoadingSkeleton type="card" width="100%" height={300} count={2} />
            </div>
        );
    }

    const totalValue = metrics?.total_value?.[timeframe];
    const profitLoss = metrics?.profit_loss?.[timeframe];
    const changePercent = metrics?.change_percent?.[timeframe];
    const investedAmount = metrics?.invested_amount;
    const plColor = typeof profitLoss === 'number' && profitLoss >= 0 ? '#53D22C' : '#ff5a5a';

    return (
        <ErrorBoundary>
            <div className="p-4 md:p-6 flex flex-col gap-6 w-full max-w-screen-xl mx-auto">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">{UI_STRINGS.DASHBOARD.TITLE}</h1>
                    <p className="text-[#A2C398] mt-1">{UI_STRINGS.DASHBOARD.SUBTITLE}</p>
                </div>

                {analyticsError && (
                    <div className="rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
                        {analyticsError}
                    </div>
                )}

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <DashboardCard
                        icon={<MdAccountBalanceWallet />}
                        label={UI_STRINGS.DASHBOARD.TOTAL_VALUE}
                        value={formatINR(totalValue)}
                        percent={formatPercent(changePercent)}
                        percentColor={plColor}
                        accentColor="#53D22C"
                        dropdownOptions={TIMEFRAME_OPTIONS}
                        dropdownValue={timeframe}
                        onDropdownChange={setTimeframe}
                        tooltip="Total portfolio market value at the selected timeframe."
                    />
                    <DashboardCard
                        icon={<MdAccountBalanceWallet />}
                        label={UI_STRINGS.DASHBOARD.INVESTED_AMOUNT}
                        value={formatINR(investedAmount)}
                        accentColor="#7ecbff"
                        tooltip="Total capital invested across all holdings."
                    />
                    <DashboardCard
                        icon={<MdTrendingUp />}
                        label={UI_STRINGS.DASHBOARD.PROFIT_LOSS}
                        value={formatINR(profitLoss)}
                        percent={formatPercent(changePercent)}
                        percentColor={plColor}
                        accentColor={plColor}
                        dropdownOptions={TIMEFRAME_OPTIONS}
                        dropdownValue={timeframe}
                        onDropdownChange={setTimeframe}
                        tooltip="Total unrealised profit or loss for the selected period."
                    />
                    <DashboardCard
                        icon={<MdToday />}
                        label={UI_STRINGS.DASHBOARD.TODAY_CHANGE}
                        value={formatINR(metrics?.profit_loss?.today)}
                        percent={formatPercent(metrics?.change_percent?.today)}
                        percentColor={typeof metrics?.profit_loss?.today === 'number' && metrics.profit_loss.today >= 0 ? '#53D22C' : '#ff5a5a'}
                        accentColor="#ffb300"
                        tooltip="Change in portfolio value since market open today."
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HistoricalPerformance />
                    <SectorAnalysis />
                </div>

                {/* Holdings */}
                <StockWisePerformance />
            </div>
        </ErrorBoundary>
    );
};

export default DashboardPage;

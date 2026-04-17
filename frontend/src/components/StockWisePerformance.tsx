import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import LoadingSkeleton from './LoadingSkeleton';
import { UI_STRINGS, API } from '../config';

const StockWisePerformance: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        fetch(`${API.BASE_URL}/api/portfolio_table`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({}),
        })
            .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
            .then(res => setData(res.holdings || []))
            .catch(e => setError(e.detail || e.message || UI_STRINGS.GENERAL.ERROR))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSkeleton type="card" width="100%" height={80} count={5} />;

    return (
        <ErrorBoundary>
            <div className="rounded-2xl bg-[#1A2615]/80 p-6 shadow-xl w-full">
                <h2 className="text-lg font-bold mb-4 text-[#53d22c]">Stock-wise Performance</h2>
                {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
                {!data.length ? (
                    <div className="text-gray-400 text-sm">{UI_STRINGS.GENERAL.NO_DATA}</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {data.map((stock) => {
                            const isGain = stock.gain_loss >= 0;
                            const symbol = stock.symbol?.replace('.NS', '') || stock.symbol;
                            return (
                                <Link
                                    key={stock.symbol}
                                    to={`/stock/${symbol}`}
                                    className="flex items-center justify-between rounded-xl bg-[#162013]/60 hover:bg-[#1e3018]/80 border border-white/5 px-4 py-3 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-[#53D22C]/10 border border-[#53D22C]/30 flex items-center justify-center text-[#53D22C] font-bold text-xs flex-shrink-0">
                                            {symbol?.slice(0, 2)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-white font-semibold text-sm truncate">{symbol}</div>
                                            {stock.sector && (
                                                <div className="text-gray-500 text-xs truncate">{stock.sector}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 flex-shrink-0 text-right">
                                        <div className="hidden sm:block">
                                            <div className="text-gray-400 text-xs">Qty</div>
                                            <div className="text-white text-sm font-medium">{stock.quantity}</div>
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="text-gray-400 text-xs">Avg Price</div>
                                            <div className="text-white text-sm font-medium">
                                                ₹{Number(stock.avg_price).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 text-xs">Current</div>
                                            <div className="text-white text-sm font-medium">
                                                ₹{Number(stock.current_price).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div className="min-w-[80px]">
                                            <div className="text-gray-400 text-xs">P&amp;L</div>
                                            <div className={`text-sm font-bold ${isGain ? 'text-[#53D22C]' : 'text-red-400'}`}>
                                                {isGain ? '+' : ''}₹{Math.abs(stock.gain_loss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </div>
                                            <div className={`text-xs ${isGain ? 'text-[#53D22C]' : 'text-red-400'}`}>
                                                {isGain ? '+' : ''}{Number(stock.gain_loss_percent).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default StockWisePerformance;

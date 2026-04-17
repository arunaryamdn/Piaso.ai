import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { API } from '../config';

interface Holding {
    quantity: number;
    avg_price: number;
    current_price: number;
    current_value: number;
    gain_loss: number;
    gain_loss_percent: number;
    sector: string;
}

interface Article {
    title: string;
    link: string;
    publisher: string;
    published: number | null;
    symbol: string;
}

const formatINR = (val: number) =>
    val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const formatDate = (ts: number | null) => {
    if (!ts) return '';
    return new Date(ts * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const StockDetailPage: React.FC = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const [detail, setDetail] = useState<any>(null);
    const [historical, setHistorical] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!symbol) return;
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        setLoading(true);
        Promise.all([
            fetch(`${API.BASE_URL}/api/stock/${symbol}`, { headers }).then(r => r.json()),
            fetch(`${API.BASE_URL}/api/historical?days=30`, { headers }).then(r => r.ok ? r.json() : null),
        ])
            .then(([stockData, histData]) => {
                setDetail(stockData);
                if (histData?.historical) setHistorical(histData.historical);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [symbol]);

    const holding: Holding | null = detail?.holding || null;
    const news: Article[] = detail?.news || [];
    const isGain = holding ? holding.gain_loss >= 0 : true;

    return (
        <motion.div
            className="p-4 md:p-6 w-full max-w-screen-xl mx-auto flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="text-[#A2C398] hover:text-[#53D22C] text-sm transition-colors">
                    ← Dashboard
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-white font-bold">{symbol}</span>
            </div>

            {loading && (
                <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-[#1A2615]/80 border border-white/5 h-40 animate-pulse" />
                    ))}
                </div>
            )}

            {error && (
                <div className="rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3">{error}</div>
            )}

            {!loading && !error && (
                <>
                    {/* Header */}
                    <div className="rounded-2xl bg-[#1A2615]/80 border border-white/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-[#53D22C]/10 border border-[#53D22C]/30 flex items-center justify-center text-[#53D22C] font-extrabold text-lg">
                                {symbol?.slice(0, 2)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-white">{symbol}</h1>
                                {holding?.sector && (
                                    <span className="text-xs bg-[#7ecbff]/10 text-[#7ecbff] border border-[#7ecbff]/20 rounded px-2 py-0.5 mt-1 inline-block">
                                        {holding.sector}
                                    </span>
                                )}
                            </div>
                        </div>
                        {holding && (
                            <div className="flex gap-6 flex-wrap">
                                <div>
                                    <div className="text-gray-400 text-xs">Current Price</div>
                                    <div className="text-white font-bold text-lg">{formatINR(holding.current_price)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs">P&amp;L</div>
                                    <div className={`font-bold text-lg ${isGain ? 'text-[#53D22C]' : 'text-red-400'}`}>
                                        {isGain ? '+' : ''}{formatINR(holding.gain_loss)}
                                    </div>
                                    <div className={`text-xs ${isGain ? 'text-[#53D22C]' : 'text-red-400'}`}>
                                        {isGain ? '+' : ''}{holding.gain_loss_percent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Holding Details */}
                    {holding && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Quantity', value: holding.quantity },
                                { label: 'Avg Buy Price', value: formatINR(holding.avg_price) },
                                { label: 'Current Value', value: formatINR(holding.current_value) },
                                { label: 'Invested', value: formatINR(holding.avg_price * holding.quantity) },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-xl bg-[#162013]/60 border border-white/5 px-4 py-3">
                                    <div className="text-gray-400 text-xs mb-1">{label}</div>
                                    <div className="text-white font-semibold">{value}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Historical Chart */}
                    {historical.length > 0 && (
                        <div className="rounded-2xl bg-[#1A2615]/80 border border-white/10 p-6">
                            <h2 className="text-lg font-bold text-[#53d22c] mb-4">Portfolio Performance (30d)</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={historical}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2E4328" />
                                    <XAxis dataKey="date" tick={{ fill: '#A2C398', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#A2C398', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ background: '#1A2615', border: '1px solid #2E4328', borderRadius: 8, color: '#fff' }}
                                        formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Value']}
                                    />
                                    <Line type="monotone" dataKey="portfolio_value" stroke="#7ecbff" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* News */}
                    <div className="rounded-2xl bg-[#1A2615]/80 border border-white/10 p-6">
                        <h2 className="text-lg font-bold text-[#53d22c] mb-4">Latest News</h2>
                        {news.length === 0 ? (
                            <p className="text-gray-400 text-sm">No recent news available for {symbol}.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {news.map((article, idx) => (
                                    <a
                                        key={idx}
                                        href={article.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col rounded-xl bg-[#162013]/60 hover:bg-[#1e3018]/80 border border-white/5 hover:border-[#53D22C]/20 px-4 py-3 transition-all group"
                                    >
                                        <p className="text-white text-sm font-semibold group-hover:text-[#53D22C] transition-colors line-clamp-2">
                                            {article.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            {article.publisher && <span className="text-gray-500 text-xs">{article.publisher}</span>}
                                            {article.published && <span className="text-gray-600 text-xs">{formatDate(article.published)}</span>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default StockDetailPage;

import React, { useEffect, useState } from 'react';
import CardSkeleton from './CardSkeleton';

const StockWisePerformance: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch('http://localhost:5000/api/portfolio_table', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        })
            .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
            .then(res => setData(res.holdings || []))
            .catch(e => {
                console.error('StockWisePerformance error:', e);
                setError(e.detail || e.message || 'Failed to load stock-wise performance');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <CardSkeleton />;
    if (error) return <div className="rounded-2xl bg-[#1A2615]/80 p-6 shadow-xl w-full text-red-500">{error}</div>;
    if (!data.length) return <div className="rounded-2xl bg-[#1A2615]/80 p-6 shadow-xl w-full text-gray-400">No stock-wise data available.</div>;

    return (
        <div className="rounded-2xl bg-[#1A2615]/80 p-6 shadow-xl w-full">
            <h2 className="text-lg font-bold mb-4 text-[#53d22c]">Stock-wise Performance</h2>
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto w-full">
                {data.map((stock: any) => (
                    <div key={stock.symbol} className="rounded-xl bg-[#232837]/80 p-4 flex items-center gap-4 shadow border border-white/10">
                        <div className="flex-1">
                            <div className="font-bold text-white text-lg">{stock.symbol}</div>
                            <div className="text-[#b5cbb0] text-xs">Qty: {stock.quantity} | Avg: ₹{stock.avg_price}</div>
                        </div>
                        {/* Placeholder for sparkline/mini-graph */}
                        <div className="w-32 h-8 bg-[#1A2615]/60 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockWisePerformance; 
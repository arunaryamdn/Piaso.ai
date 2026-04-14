import React, { useEffect, useState } from 'react';
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
        fetch(`${API.BASE_URL}/api/portfolio_table`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        })
            .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
            .then(res => setData(res.holdings || []))
            .catch(e => {
                console.error('StockWisePerformance error:', e);
                setError(e.detail || e.message || UI_STRINGS.GENERAL.ERROR);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="stock-performance-loading">
                <LoadingSkeleton type="card" width="100%" height={80} count={5} />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="stock-performance-container">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {!data.length ? (
                    <div className="no-data">
                        {UI_STRINGS.GENERAL.NO_DATA}
                    </div>
                ) : (
                    <div className="stock-list">
                        {data.map((stock) => (
                            <div key={stock.symbol} className="stock-item">
                                {/* Stock performance content */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default StockWisePerformance; 
import { useState, useEffect } from 'react';

export function useDashboardMetrics(timeframe: string) {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        fetch('http://localhost:5000/api/portfolio/metrics-history', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch metrics');
                return res.json();
            })
            .then(data => {
                if (isMounted) setMetrics(data);
            })
            .catch(err => {
                if (isMounted) setError(err.message);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, [timeframe]);

    return { metrics, loading, error };
} 
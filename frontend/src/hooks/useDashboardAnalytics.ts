import useSWR from 'swr';

const fetcher = (url: string) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
        return res.json();
    });
};

export function useDashboardAnalytics(reloadKey: any = null) {
    const { data, error, isLoading } = useSWR(
        ['dashboard-analytics', reloadKey],
        () => fetcher('http://localhost:5000/api/dashboard/analytics'),
        { revalidateOnFocus: false }
    );

    return {
        metrics: data?.metrics,
        sector: data?.sector,
        historical: data?.historical,
        holdings: data?.holdings,
        loading: isLoading,
        error: error ? error.message : null,
    };
} 
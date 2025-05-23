// DashboardPage.tsx
// Dashboard page for Paiso.ai. Shows portfolio analytics and summary cards.

import React, { useEffect, useState } from 'react';
import { UI_STRINGS } from '../config';

/**
 * Dashboard page component. Shows portfolio analytics and summary cards.
 */
const DashboardPage: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('http://localhost:5000/api/dashboard', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
                });
                if (!res.ok) throw new Error('Failed to fetch dashboard');
                const data = await res.json();
                setSummary(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
            console.debug('[DashboardPage] Dashboard fetch complete');
        };
        fetchSummary();
    }, []);

    console.debug('[DashboardPage] Rendered');

    return (
        <div className="main-content" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 0' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{UI_STRINGS.DASHBOARD.TITLE}</h1>
            <h2 style={{ fontSize: '1.1rem', color: '#7ecbff', fontWeight: 600, marginBottom: 24 }}>{UI_STRINGS.DASHBOARD.SUBTITLE}</h2>
            {loading && <div>{UI_STRINGS.GENERAL.LOADING}</div>}
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
            {!loading && !summary && (
                <div style={{ color: '#b2e3a7', marginTop: 24 }}>{UI_STRINGS.DASHBOARD.EMPTY_STATE}</div>
            )}
            {!loading && summary && (
                <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                    <div style={{ background: '#1A2615', borderRadius: 12, padding: 24, flex: 1, color: '#fff', boxShadow: '0 2px 16px #0002' }}>
                        <div style={{ color: '#53d22c', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{UI_STRINGS.DASHBOARD.TOTAL_VALUE}</div>
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{summary.total_value?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div style={{ background: '#1A2615', borderRadius: 12, padding: 24, flex: 1, color: '#fff', boxShadow: '0 2px 16px #0002' }}>
                        <div style={{ color: '#53d22c', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{UI_STRINGS.DASHBOARD.PROFIT_LOSS}</div>
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{summary.profit_loss?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div style={{ background: '#1A2615', borderRadius: 12, padding: 24, flex: 1, color: '#fff', boxShadow: '0 2px 16px #0002' }}>
                        <div style={{ color: '#53d22c', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{UI_STRINGS.DASHBOARD.TODAY_CHANGE}</div>
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{summary.today_change?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div style={{ background: '#1A2615', borderRadius: 12, padding: 24, flex: 1, color: '#fff', boxShadow: '0 2px 16px #0002' }}>
                        <div style={{ color: '#53d22c', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{UI_STRINGS.DASHBOARD.INVESTED_AMOUNT}</div>
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{summary.invested_amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage; 
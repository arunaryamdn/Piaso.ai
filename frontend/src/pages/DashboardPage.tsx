// DashboardPage.tsx
// Dashboard page for Paiso.ai. Shows portfolio analytics and summary cards.

import React, { useEffect, useState, useRef } from 'react';
import { UI_STRINGS } from '../config';

/**
 * Dashboard page component. Shows portfolio analytics and summary cards.
 */
const DashboardPage: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'unknown' | 'processing' | 'ready' | 'failed' | 'not_found'>('unknown');
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Poll portfolio status
    const pollStatus = () => {
        pollingRef.current = setInterval(async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/portfolio/status', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                setStatus(data.status);
                if (data.status === 'ready' || data.status === 'failed' || data.status === 'not_found') {
                    clearInterval(pollingRef.current!);
                }
            } catch {
                setStatus('failed');
                clearInterval(pollingRef.current!);
            }
        }, 3000);
    };

    useEffect(() => {
        // On mount, check status
        const checkStatus = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/portfolio/status', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                setStatus(data.status);
                if (data.status === 'processing') {
                    pollStatus();
                }
            } catch {
                setStatus('failed');
            }
        };
        checkStatus();
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    useEffect(() => {
        if (status === 'ready') {
            setLoading(true);
            setError('');
            fetch('http://localhost:5000/api/dashboard', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch dashboard');
                    return res.json();
                })
                .then(data => setSummary(data))
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [status]);

    console.debug('[DashboardPage] Rendered');

    if (status === 'processing') {
        return (
            <div className="w-full max-w-4xl mx-auto py-8 px-2 md:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-2xl font-bold text-[#53d22c] mb-4 flex items-center"><span className="animate-spin mr-2">⏳</span>Processing your portfolio...</div>
                <div className="text-lg text-gray-300">This may take a few moments. You can navigate the app while we analyze your data.</div>
            </div>
        );
    }
    if (status === 'failed') {
        return (
            <div className="w-full max-w-4xl mx-auto py-8 px-2 md:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-2xl font-bold text-red-500 mb-4">Portfolio processing failed.</div>
                <div className="text-lg text-gray-300">Please try uploading your portfolio again.</div>
            </div>
        );
    }
    if (status === 'not_found') {
        return (
            <div className="w-full max-w-4xl mx-auto py-8 px-2 md:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-2xl font-bold text-[#7ecbff] mb-4">No portfolio uploaded yet.</div>
                <div className="text-lg text-gray-300">Upload your portfolio to get started.</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-2 md:px-8">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{UI_STRINGS.DASHBOARD.TITLE}</h1>
            <h2 className="text-lg font-semibold text-[#7ecbff] mb-8">{UI_STRINGS.DASHBOARD.SUBTITLE}</h2>
            {loading && <div className="text-lg text-gray-300">{UI_STRINGS.GENERAL.LOADING}</div>}
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {!loading && !summary && (
                <div className="text-[#b2e3a7] mt-8 text-lg">{UI_STRINGS.DASHBOARD.EMPTY_STATE}</div>
            )}
            {!loading && summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-[#1A2615] rounded-xl p-8 flex flex-col items-start shadow-lg">
                        <div className="text-[#53d22c] font-bold text-lg mb-2">{UI_STRINGS.DASHBOARD.TOTAL_VALUE}</div>
                        <div className="text-2xl font-extrabold">{summary.total_value?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div className="bg-[#1A2615] rounded-xl p-8 flex flex-col items-start shadow-lg">
                        <div className="text-[#53d22c] font-bold text-lg mb-2">{UI_STRINGS.DASHBOARD.PROFIT_LOSS}</div>
                        <div className="text-2xl font-extrabold">{summary.profit_loss?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div className="bg-[#1A2615] rounded-xl p-8 flex flex-col items-start shadow-lg">
                        <div className="text-[#53d22c] font-bold text-lg mb-2">{UI_STRINGS.DASHBOARD.TODAY_CHANGE}</div>
                        <div className="text-2xl font-extrabold">{summary.today_change?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div className="bg-[#1A2615] rounded-xl p-8 flex flex-col items-start shadow-lg">
                        <div className="text-[#53d22c] font-bold text-lg mb-2">{UI_STRINGS.DASHBOARD.INVESTED_AMOUNT}</div>
                        <div className="text-2xl font-extrabold">{summary.invested_amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage; 
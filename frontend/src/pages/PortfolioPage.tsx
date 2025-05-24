// ProfilePage.tsx
// User profile page for Paiso.ai. Shows uploaded portfolio and upload/delete actions.

import React, { useEffect, useState, useRef } from 'react';
import PortfolioTable from '../components/PortfolioTable';
import PortfolioUpload from '../components/PortfolioUpload';
import { UI_STRINGS } from '../config';
import { mapPortfolioData } from '../utils/portfolioMapping';

/**
 * Profile page component. Shows user's uploaded portfolio and allows upload/delete.
 */
const ProfilePage: React.FC = () => {
    const [portfolio, setPortfolio] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUpload, setShowUpload] = useState(false);
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
            fetch('http://localhost:5000/api/portfolio', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch portfolio');
                    return res.json();
                })
                .then(data => {
                    setPortfolio(mapPortfolioData(data));
                    setShowUpload(false);
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [status]);

    const handleDelete = async () => {
        if (!window.confirm(UI_STRINGS.PROFILE.DELETE_CONFIRM)) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/portfolio', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
            });
            if (!res.ok) throw new Error('Failed to delete portfolio');
            setPortfolio(null);
            setShowUpload(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        console.debug('[ProfilePage] Portfolio deleted');
    };

    const handleUploadSuccess = () => {
        console.debug('[ProfilePage] Portfolio uploaded, refetching');
    };

    console.debug('[ProfilePage] Rendered');

    if (status === 'processing') {
        return (
            <div className="w-full max-w-3xl mx-auto py-8 px-2 md:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-2xl font-bold text-[#53d22c] mb-4 flex items-center"><span className="animate-spin mr-2">⏳</span>Processing your portfolio...</div>
                <div className="text-lg text-gray-300">This may take a few moments. You can navigate the app while we analyze your data.</div>
            </div>
        );
    }
    if (status === 'failed') {
        return (
            <div className="w-full max-w-3xl mx-auto py-8 px-2 md:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-2xl font-bold text-red-500 mb-4">Portfolio processing failed.</div>
                <div className="text-lg text-gray-300 mb-6">Please upload a new portfolio file to continue.</div>
                <PortfolioUpload onUploadSuccess={handleUploadSuccess} />
            </div>
        );
    }
    if (status === 'not_found') {
        return (
            <div className="w-full max-w-3xl mx-auto py-8 px-2 md:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-2xl font-bold text-[#7ecbff] mb-4">No portfolio uploaded yet.</div>
                <div className="text-lg text-gray-300">Upload your portfolio to get started.</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto py-8 px-2 md:px-8">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{UI_STRINGS.PROFILE.TITLE}</h1>
            <h2 className="text-lg font-semibold text-[#7ecbff] mb-8">Track your investments and performance with ease.</h2>
            {loading && <div className="text-lg text-gray-300">{UI_STRINGS.GENERAL.LOADING}</div>}
            {error && !showUpload && <div className="text-red-500 mb-4">{error}</div>}
            {!loading && !showUpload && portfolio && (
                <>
                    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-xl text-[#53d22c] font-bold">{UI_STRINGS.PROFILE.UPLOADED_PORTFOLIO}</h2>
                        <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-5 py-2 font-bold shadow transition-all">{UI_STRINGS.PROFILE.DELETE_BTN}</button>
                    </div>
                    <PortfolioTable data={portfolio} />
                </>
            )}
            {!loading && showUpload && (
                <div className="bg-[#232837] rounded-2xl p-8 shadow-lg border border-[#53D22C]/10 mt-8 flex flex-col items-center">
                    <h2 className="text-lg text-[#7ecbff] font-semibold mb-4">Welcome! Upload your portfolio to get started.</h2>
                    <p className="text-gray-300 mb-6 text-center">Your Excel file should contain the following columns: <span className="text-[#53D22C] font-semibold">Stock Symbol, Quantity, Average Price, Date of Purchase</span>. The first row must be the header row with these exact column names.</p>
                    <PortfolioUpload onUploadSuccess={handleUploadSuccess} />
                </div>
            )}
        </div>
    );
};

export default ProfilePage; 
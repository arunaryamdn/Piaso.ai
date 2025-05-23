// ProfilePage.tsx
// User profile page for Paiso.ai. Shows uploaded portfolio and upload/delete actions.

import React, { useEffect, useState } from 'react';
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

    const fetchPortfolio = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/portfolio', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
            });
            if (res.status === 404) {
                setPortfolio(null);
                setShowUpload(true);
            } else if (!res.ok) {
                throw new Error('Failed to fetch portfolio');
            } else {
                const data = await res.json();
                setPortfolio(mapPortfolioData(data));
                setShowUpload(false);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        console.debug('[ProfilePage] Portfolio fetch complete');
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

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
        fetchPortfolio();
        console.debug('[ProfilePage] Portfolio uploaded, refetching');
    };

    console.debug('[ProfilePage] Rendered');

    return (
        <div className="main-content" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 0' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: 24 }}>{UI_STRINGS.PROFILE.TITLE}</h1>
            {loading && <div>{UI_STRINGS.GENERAL.LOADING}</div>}
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
            {!loading && !showUpload && portfolio && (
                <>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.3rem', color: '#53d22c', fontWeight: 700 }}>{UI_STRINGS.PROFILE.UPLOADED_PORTFOLIO}</h2>
                        <button onClick={handleDelete} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}>{UI_STRINGS.PROFILE.DELETE_BTN}</button>
                    </div>
                    <PortfolioTable data={portfolio} />
                </>
            )}
            {!loading && showUpload && (
                <div>
                    <h2 style={{ fontSize: '1.1rem', color: '#7ecbff', fontWeight: 600, marginBottom: 12 }}>{UI_STRINGS.PROFILE.UPLOAD_PROMPT}</h2>
                    <PortfolioUpload onUploadSuccess={handleUploadSuccess} />
                </div>
            )}
        </div>
    );
};

export default ProfilePage; 
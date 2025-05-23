// ProfilePage.tsx
// User profile page for Paiso.ai. Shows uploaded portfolio and upload/delete actions.

import React, { useEffect, useState } from 'react';
import PortfolioUpload from '../components/PortfolioUpload';
import { UI_STRINGS } from '../config';

const API_BASE = 'http://localhost:5000';
const AUTH_API_BASE = 'http://localhost:4000';

/**
 * Profile page component. Shows user's uploaded portfolio and allows upload/delete.
 */
const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editMobile, setEditMobile] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            setProfile(data);
            setEditName(data.name || '');
            setEditMobile(data.mobile || '');
            setShowUpload(!data.portfolio_file);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line
    }, []);

    const handleEdit = () => {
        setEditName(profile?.name || '');
        setEditMobile(profile?.mobile || '');
        setEditMode(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`${AUTH_API_BASE}/api/user/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: editName, mobile: editMobile }),
            });
            if (!res.ok) throw new Error('Failed to update profile');
            setEditMode(false);
            fetchProfile();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePortfolio = async () => {
        if (!window.confirm('Are you sure you want to delete your uploaded portfolio?')) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/portfolio`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to delete portfolio');
            fetchProfile();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        setUploading(false);
        fetchProfile();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#101c13] to-[#1a232d] py-8 px-2">
            <div className="w-full max-w-2xl mx-auto bg-[#18251a] rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col gap-8 border border-[#53D22C]/20">
                <h1 className="text-3xl md:text-4xl font-bold text-center text-[#53D22C] mb-2 tracking-tight">My Profile</h1>
                {loading ? (
                    <div className="text-center text-lg text-gray-300">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : profile ? (
                    <>
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-20 h-20 rounded-full bg-[#232837] flex items-center justify-center text-4xl font-bold text-[#53D22C] shadow-lg">
                                    {(profile?.name && profile.name.length > 0)
                                        ? profile.name[0].toUpperCase()
                                        : (profile?.email && profile.email.length > 0)
                                            ? profile.email[0].toUpperCase()
                                            : '?'}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Account Created<br />{profile.createdAt?.slice(0, 19).replace('T', ' ')}</div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <span className="font-semibold text-[#53D22C]">Email:</span>
                                    <span className="text-white/90">{profile.email}</span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <span className="font-semibold text-[#53D22C]">Name:</span>
                                    {editMode ? (
                                        <input
                                            className="bg-[#232837] border border-[#53D22C]/40 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-[#53D22C]"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            disabled={saving}
                                        />
                                    ) : (
                                        <span className="text-white/90">{profile.name || <span className="italic text-gray-400">Not set</span>}</span>
                                    )}
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <span className="font-semibold text-[#53D22C]">Mobile:</span>
                                    {editMode ? (
                                        <input
                                            className="bg-[#232837] border border-[#53D22C]/40 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-[#53D22C]"
                                            value={editMobile}
                                            onChange={e => setEditMobile(e.target.value)}
                                            disabled={saving}
                                        />
                                    ) : (
                                        <span className="text-white/90">{profile.mobile || <span className="italic text-gray-400">Not set</span>}</span>
                                    )}
                                </div>
                                <div className="mt-3 flex gap-3">
                                    {editMode ? (
                                        <>
                                            <button
                                                className="bg-[#53D22C] hover:bg-[#3fa31e] text-white font-semibold px-4 py-1.5 rounded-lg shadow transition-all duration-150"
                                                onClick={handleSave}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-1.5 rounded-lg shadow transition-all duration-150"
                                                onClick={() => setEditMode(false)}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="border border-[#53D22C] text-[#53D22C] hover:bg-[#53D22C] hover:text-white font-semibold px-4 py-1.5 rounded-lg shadow transition-all duration-150"
                                            onClick={handleEdit}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Portfolio File Info */}
                        <div className="mt-6 bg-[#232837] rounded-2xl p-6 shadow-lg border border-[#53D22C]/10">
                            <h2 className="text-xl font-bold text-[#53D22C] mb-3">Portfolio File</h2>
                            {profile.portfolio_file ? (
                                <>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-2">
                                        <span className="font-semibold text-white/80">File Name:</span>
                                        <span className="text-[#7ecbff]">{profile.portfolio_file.filename}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-2">
                                        <span className="font-semibold text-white/80">Size:</span>
                                        <span className="text-[#7ecbff]">{(profile.portfolio_file.filesize / 1024).toFixed(1)} KB</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-4">
                                        <span className="font-semibold text-white/80">Uploaded:</span>
                                        <span className="text-[#7ecbff]">{profile.portfolio_file.uploaded_at?.slice(0, 19).replace('T', ' ')}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-1.5 rounded-lg shadow transition-all duration-150"
                                            onClick={handleDeletePortfolio}
                                            disabled={loading}
                                        >
                                            Delete Portfolio
                                        </button>
                                        <button
                                            className="bg-[#53D22C] hover:bg-[#3fa31e] text-white font-semibold px-4 py-1.5 rounded-lg shadow transition-all duration-150"
                                            onClick={() => setShowUpload(true)}
                                            disabled={uploading}
                                        >
                                            Upload New Portfolio
                                        </button>
                                    </div>
                                    {showUpload && (
                                        <div className="mt-4"><PortfolioUpload onUploadSuccess={handleUploadSuccess} /></div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-gray-400 italic mb-2">No portfolio file uploaded yet.</div>
                                    <PortfolioUpload onUploadSuccess={handleUploadSuccess} />
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default ProfilePage; 
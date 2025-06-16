import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSkeleton from './LoadingSkeleton';
import { UI_STRINGS } from '../config';

interface ProfileData {
    name: string;
    email: string;
    portfolioCount: number;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'portfolio' | 'account'>('portfolio');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // Simulate API call
                setTimeout(() => {
                    setProfile({
                        name: 'John Doe',
                        email: 'john@example.com',
                        portfolioCount: 3
                    });
                    setLoading(false);
                }, 1000);
            } catch (err) {
                setError('Failed to load profile data');
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="profile-loading">
                <LoadingSkeleton type="card" width="100%" height={120} count={3} />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="profile-container">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="profile-header">
                    <h2>{UI_STRINGS.PROFILE.TITLE}</h2>
                    <div className="profile-tabs">
                        <button
                            className={`tab-button ${activeSection === 'portfolio' ? 'active' : ''}`}
                            onClick={() => setActiveSection('portfolio')}
                        >
                            {UI_STRINGS.PROFILE.UPLOADED_PORTFOLIO}
                        </button>
                        <button
                            className={`tab-button ${activeSection === 'account' ? 'active' : ''}`}
                            onClick={() => setActiveSection('account')}
                        >
                            Account Settings
                        </button>
                    </div>
                </div>

                {activeSection === 'portfolio' && (
                    <div className="profile-portfolio">
                        {/* Portfolio content */}
                    </div>
                )}

                {activeSection === 'account' && (
                    <div className="profile-account">
                        {/* Account settings content */}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default Profile; 
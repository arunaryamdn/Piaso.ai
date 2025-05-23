// LoginPage.tsx
// Login page for Paiso.ai. Allows user to sign in.

import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { UI_STRINGS } from '../config';

/**
 * Login page component. Allows user to sign in.
 */
const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [sessionDuration, setSessionDuration] = useState('1h');
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.debug('[LoginPage] Attempting login for', email);
        try {
            const res = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, sessionDuration })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            if (rememberMe) {
                localStorage.setItem('token', data.token);
                sessionStorage.removeItem('token');
            } else {
                sessionStorage.setItem('token', data.token);
                localStorage.removeItem('token');
            }
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    console.debug('[LoginPage] Rendered');

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#162013] px-4">
            <div className="w-full max-w-md bg-[#1F2C1A] rounded-xl shadow-lg p-8 flex flex-col items-center">
                <img src={logo} alt="Paiso.ai Logo" className="h-14 w-14 rounded-full bg-white p-2 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-6">{UI_STRINGS.AUTH.LOGIN}</h2>
                <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="rounded-lg px-4 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] focus:ring-[#53D22C] outline-none"
                        placeholder={UI_STRINGS.AUTH.EMAIL_PLACEHOLDER}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="rounded-lg px-4 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] focus:ring-[#53D22C] outline-none"
                        placeholder={UI_STRINGS.AUTH.PASSWORD_PLACEHOLDER}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <label className="flex items-center gap-2 text-[#b5cbb0] text-sm select-none">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            className="accent-[#53D22C]"
                        />
                        {UI_STRINGS.AUTH.REMEMBER_ME}
                    </label>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <button
                        type="submit"
                        className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold py-3 rounded-lg transition-colors mt-2"
                        disabled={loading}
                    >
                        {loading ? UI_STRINGS.GENERAL.LOADING : UI_STRINGS.AUTH.SIGNIN_BTN}
                    </button>
                </form>
                <div className="mt-6 text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[#53D22C] hover:underline">{UI_STRINGS.AUTH.SIGNUP}</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 
import React, { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { API } from '../config';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API.AUTH_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken: token, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Reset failed');
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#162013] px-4 relative overflow-hidden">
            <motion.div
                className="fixed inset-0 -z-10 bg-gradient-to-tr from-[#162013] via-[#1F2C1A] to-[#53D22C]/30 opacity-90"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-10 flex flex-col items-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <img src={logo} alt="paiso.ai logo" className="h-14 w-14 rounded-full bg-white p-2 mb-3 border-2 border-[#53D22C] shadow" />
                <span className="font-extrabold text-2xl text-white lowercase tracking-tight mb-1">paiso.ai</span>

                {success ? (
                    <div className="flex flex-col items-center mt-6 gap-3">
                        <div className="text-[#53D22C] text-4xl">✓</div>
                        <h2 className="text-xl font-bold text-white">Password Updated!</h2>
                        <p className="text-[#A2C398] text-sm text-center">Redirecting you to sign in…</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-white mt-4 mb-2">Set New Password</h2>
                        <p className="text-[#A2C398] text-sm text-center mb-6">Paste your reset token and choose a new password.</p>
                        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                            <textarea
                                className="rounded-lg px-4 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] outline-none w-full text-xs font-mono resize-none h-20"
                                placeholder="Paste reset token here"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                required
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="rounded-lg px-4 pr-10 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] outline-none w-full"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A2C398]"
                                    onClick={() => setShowPassword(v => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                            <motion.button
                                type="submit"
                                className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold py-3 rounded-lg transition-all mt-1"
                                disabled={loading}
                                whileTap={{ scale: 0.97 }}
                            >
                                {loading ? 'Updating…' : 'Update Password'}
                            </motion.button>
                        </form>
                    </>
                )}

                <div className="mt-6 text-gray-400 text-sm">
                    <Link to="/login" className="text-[#53D22C] hover:underline">Back to Sign In</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;

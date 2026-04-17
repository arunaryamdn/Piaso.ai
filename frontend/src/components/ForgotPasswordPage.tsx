import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { API } from '../config';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API.AUTH_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            setResetToken(data.resetToken);
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

                {!resetToken ? (
                    <>
                        <h2 className="text-xl font-bold text-white mt-4 mb-2">Forgot Password</h2>
                        <p className="text-[#A2C398] text-sm text-center mb-6">Enter your email to receive a password reset token.</p>
                        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                            <input
                                type="email"
                                className="rounded-lg px-4 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] outline-none w-full"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                            <motion.button
                                type="submit"
                                className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold py-3 rounded-lg transition-all mt-1"
                                disabled={loading}
                                whileTap={{ scale: 0.97 }}
                            >
                                {loading ? 'Sending…' : 'Get Reset Token'}
                            </motion.button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-[#53D22C] mt-4 mb-2">Reset Token Ready</h2>
                        <p className="text-[#A2C398] text-sm text-center mb-4">
                            Copy this token and use it on the reset password page.
                        </p>
                        <div className="w-full bg-[#21301C] border border-[#2E4328] rounded-lg px-4 py-3 text-white text-xs font-mono break-all select-all mb-4">
                            {resetToken}
                        </div>
                        <Link
                            to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                            className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold py-2 px-6 rounded-lg transition-all text-sm"
                        >
                            Set New Password →
                        </Link>
                    </>
                )}

                <div className="mt-6 text-gray-400 text-sm">
                    <Link to="/login" className="text-[#53D22C] hover:underline">Back to Sign In</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;

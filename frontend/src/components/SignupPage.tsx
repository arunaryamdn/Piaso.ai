import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const SignupPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:4000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#162013] px-4 relative overflow-hidden">
            {/* Animated gradient background */}
            <motion.div
                className="fixed inset-0 -z-10 bg-gradient-to-tr from-[#162013] via-[#1F2C1A] to-[#53D22C]/30 opacity-90"
                style={{ backgroundSize: '200% 200%' }}
                animate={{
                    backgroundPosition: [
                        '0% 50%', '100% 50%', '100% 100%', '0% 50%'
                    ]
                }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-10 flex flex-col items-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="paiso.ai logo" className="h-14 w-14 rounded-full bg-white p-2 mb-2 border-2 border-[#53D22C] shadow" />
                    <span className="font-extrabold text-2xl text-white lowercase tracking-tight mb-1">paiso.ai</span>
                    <span className="text-[#A2C398] text-sm text-center">Create your paiso.ai account</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Sign up</h2>
                <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="on">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#53D22C]">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="#53D22C" strokeWidth="2" /><path d="M2 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#53D22C" strokeWidth="2" /></svg>
                        </span>
                        <input
                            type="email"
                            className="rounded-lg pl-10 pr-4 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] focus:ring-[#53D22C] outline-none w-full transition-all"
                            placeholder="Email"
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#53D22C]">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="7" rx="3.5" stroke="#53D22C" strokeWidth="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#53D22C" strokeWidth="2" /></svg>
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="rounded-lg pl-10 pr-10 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] focus:ring-[#53D22C] outline-none w-full transition-all"
                            placeholder="Password"
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A2C398] hover:text-[#53D22C] focus:outline-none"
                            onClick={() => setShowPassword(v => !v)}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="#53D22C" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="#53D22C" strokeWidth="2" /></svg>
                            ) : (
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A9.97 9.97 0 0 1 12 19c-6.5 0-10-7-10-7a19.77 19.77 0 0 1 4.22-5.29M9.5 9.5a3 3 0 0 1 4.24 4.24" stroke="#53D22C" strokeWidth="2" /><path d="m1 1 22 22" stroke="#53D22C" strokeWidth="2" /></svg>
                            )}
                        </button>
                    </div>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <motion.button
                        type="submit"
                        className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold py-3 rounded-lg transition-all mt-2 shadow-lg focus:ring-2 focus:ring-[#53D22C] focus:ring-offset-2"
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </motion.button>
                </form>
                <div className="flex items-center my-6 w-full">
                    <div className="flex-1 h-px bg-[#2E4328]" />
                    <span className="mx-4 text-[#A2C398] text-xs">or sign up with</span>
                    <div className="flex-1 h-px bg-[#2E4328]" />
                </div>
                <div className="flex gap-4 mb-4">
                    <button className="bg-white/20 hover:bg-white/30 text-[#53D22C] font-bold px-4 py-2 rounded-lg shadow transition-colors border border-[#53D22C]/30" disabled>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.25-1.4 3.67-5.27 3.67-3.18 0-5.78-2.63-5.78-5.86s2.6-5.86 5.78-5.86c1.81 0 3.03.77 3.73 1.43l2.54-2.47C16.09 4.5 14.24 3.5 12 3.5 6.76 3.5 2.5 7.76 2.5 13s4.26 9.5 9.5 9.5c5.5 0 9.5-4.5 9.5-9.5 0-.64-.07-1.26-.15-1.9z" /></svg>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 text-[#53D22C] font-bold px-4 py-2 rounded-lg shadow transition-colors border border-[#53D22C]/30" disabled>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 3.6 8.07 8.19 8.93v-6.32h-2.47v-2.61h2.47v-2c0-2.44 1.46-3.78 3.7-3.78 1.07 0 2.19.19 2.19.19v2.41h-1.24c-1.22 0-1.6.76-1.6 1.54v1.64h2.72l-.44 2.61h-2.28v6.32c4.59-.86 8.19-4.52 8.19-8.93 0-5.5-4.46-9.96-9.96-9.96z" /></svg>
                    </button>
                </div>
                <div className="mt-2 text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#53D22C] hover:underline">Sign In</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage; 
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const SignupPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        <div className="min-h-screen flex items-center justify-center bg-[#162013] px-4">
            <div className="w-full max-w-md bg-[#1F2C1A] rounded-xl shadow-lg p-8 flex flex-col items-center">
                <img src={logo} alt="Paiso.ai Logo" className="h-14 w-14 rounded-full bg-white p-2 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-6">Create your Paiso.ai account</h2>
                <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="rounded-lg px-4 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] focus:ring-[#53D22C] outline-none"
                        placeholder="Email"
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="rounded-lg px-4 py-3 bg-[#21301C] text-white border border-[#2E4328] focus:border-[#53D22C] focus:ring-[#53D22C] outline-none"
                        placeholder="Password"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <button
                        type="submit"
                        className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold py-3 rounded-lg transition-colors mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-6 text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#53D22C] hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage; 
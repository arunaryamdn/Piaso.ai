import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import landingImg from '../assets/Paiso_Landing_Page.png';

function isAuthenticated() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return true;
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    } catch {
        return false;
    }
}

const features = [
    {
        title: 'AI-Powered Portfolio Analysis',
        desc: 'Get actionable insights and analytics on your investments using advanced AI algorithms.'
    },
    {
        title: 'Real-Time Market Insights',
        desc: 'Stay ahead with live news, stock prices, and market trends tailored to your portfolio.'
    },
    {
        title: 'Personalized Recommendations',
        desc: 'Receive buy/sell/hold suggestions and diversification tips based on your unique profile.'
    },
    {
        title: 'Secure & Private',
        desc: 'Your data is encrypted and never shared. You are always in control of your information.'
    }
];

const LandingPage: React.FC = () => (
    <div className="min-h-screen bg-[#162013] text-white flex flex-col font-sans">
        {/* Top bar with login/signup */}
        {/* DO NOT REMOVE: Login and Sign Up buttons must always be visible for unauthenticated users */}
        {!isAuthenticated() && (
            <div className="w-full flex justify-end items-center px-8 py-6 gap-6 bg-[#101c13] shadow-lg">
                <Link to="/login">
                    <button className="bg-[#232837] hover:bg-[#53D22C] text-[#53D22C] hover:text-[#162013] font-bold px-8 py-3 rounded-xl text-lg shadow transition-colors border-2 border-[#53D22C]">Login</button>
                </Link>
                <Link to="/signup">
                    <button className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold px-8 py-3 rounded-xl text-lg shadow transition-colors border-2 border-[#53D22C]">Sign Up</button>
                </Link>
            </div>
        )}

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-20 px-4 bg-[#162013] border-b-2 border-[#53D22C]/20">
            <img src={logo} alt="Paiso.ai Logo" className="h-24 w-24 rounded-full bg-white p-2 mb-6 border-4 border-[#53D22C] shadow-xl" />
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">Paiso.ai</h1>
            <p className="text-xl md:text-2xl text-[#A2C398] mb-8 text-center max-w-2xl font-medium">
                Smarter investing starts here. Analyze, optimize, and grow your wealth with AI-driven insights.
            </p>
            <Link to="/login">
                <button className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold px-10 py-4 rounded-full text-2xl shadow-2xl transition-colors border-2 border-[#53D22C]">
                    Get Started
                </button>
            </Link>
        </section>

        {/* Features Section */}
        <section className="py-12 px-4 bg-[#1F2C1A]">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((f, i) => (
                    <div key={i} className="bg-[#21301C] border border-[#2E4328] rounded-xl p-6 shadow-lg flex flex-col items-start">
                        <h3 className="text-xl font-bold mb-2 text-[#53D22C]">{f.title}</h3>
                        <p className="text-gray-300 text-base">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Product Screenshot Section */}
        <section className="py-16 px-4 flex flex-col items-center bg-transparent">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">See Paiso.ai in Action</h2>
            <img src={landingImg} alt="Paiso.ai Screenshot" className="rounded-2xl shadow-2xl w-full max-w-3xl border-4 border-[#2E4328]" />
        </section>

        {/* Call to Action */}
        <section className="py-12 flex flex-col items-center bg-[#1F2C1A]">
            <h3 className="text-2xl font-bold mb-4 text-white">Ready to take control of your financial future?</h3>
            <Link to="/login">
                <button className="bg-[#53D22C] hover:bg-[#70e048] text-[#162013] font-bold px-8 py-3 rounded-full text-lg shadow-lg transition-colors">
                    Get Started
                </button>
            </Link>
        </section>
    </div>
);

export default LandingPage; 
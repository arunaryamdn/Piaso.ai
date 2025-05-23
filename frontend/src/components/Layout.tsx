import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';

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

const Layout: React.FC = () => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const isMobile = window.innerWidth < 768;

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
        // Listen for storage changes (logout/login in other tabs)
        const onStorage = () => setIsLoggedIn(isAuthenticated());
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex bg-[#162013] text-white font-sans">
            {/* Hamburger menu for mobile, only if logged in */}
            {isLoggedIn && isMobile && (
                <button
                    className="fixed top-4 left-4 z-50 md:hidden bg-[#232837] text-[#53D22C] p-2 rounded-full shadow-lg focus:outline-none"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sidebar"
                >
                    <span className="material-icons">menu</span>
                </button>
            )}
            {/* Sidebar only if logged in */}
            {isLoggedIn && (
                <Sidebar open={!isMobile || sidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}
            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    className="flex-1 ml-0 md:ml-64 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 py-8 transition-all"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                >
                    <Outlet />
                </motion.main>
            </AnimatePresence>
        </div>
    );
};

export default Layout; 
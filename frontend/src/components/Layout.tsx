import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBell, FaUserCircle } from 'react-icons/fa';

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

const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/portfolio')) return 'Portfolio';
    if (pathname.startsWith('/news')) return 'News';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/realtime')) return 'Real-Time Prices';
    if (pathname.startsWith('/ai')) return 'AI Recommendations';
    return '';
};

const Layout: React.FC = () => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const isMobile = window.innerWidth < 768;
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
        // Listen for storage changes (logout/login in other tabs)
        const onStorage = () => setIsLoggedIn(isAuthenticated());
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex bg-[#162013] text-white font-sans">
            {/* Sidebar only if logged in */}
            {isLoggedIn && (
                <Sidebar open={!isMobile || sidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}
            {/* Scrollable content area (header + main) */}
            <div className="flex-1 flex flex-col w-full min-w-0">
                {/* Header (no longer sticky on desktop) */}
                <header className={`sticky top-0 z-40 w-full min-w-0 bg-[#162013] bg-opacity-95 backdrop-blur-lg shadow-lg flex items-center justify-between px-4 sm:px-6 py-4 h-[64px] ${isMobile && sidebarOpen ? 'pointer-events-none opacity-40' : ''}`}>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg truncate">{getPageTitle(location.pathname)}</h1>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <button className="relative p-2 rounded-full hover:bg-[#232837]/40">
                            <FaBell size={22} className="text-[#7ecbff]" />
                            {/* Notification dot */}
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff5a5a] rounded-full" />
                        </button>
                        <FaUserCircle size={28} className="text-[#b2e3a7]" />
                    </div>
                </header>
                <AnimatePresence mode="wait">
                    <motion.main
                        key={location.pathname}
                        className={`flex-1 w-full min-w-0 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24 pt-6 transition-all md:pl-64 ${isMobile && sidebarOpen ? 'pointer-events-none opacity-40' : ''}`}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -24 }}
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Layout; 
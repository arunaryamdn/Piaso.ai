// Sidebar.tsx
// Sidebar navigation for Paiso.ai dashboard.

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';
import { UI_STRINGS } from '../config';

const navLinks = [
    { name: UI_STRINGS.NAV.DASHBOARD, to: '/dashboard', icon: 'dashboard' },
    { name: UI_STRINGS.NAV.PORTFOLIO, to: '/portfolio', icon: 'folder' },
    { name: UI_STRINGS.NAV.WATCHLIST, to: '/watchlist', icon: 'visibility' },
    { name: UI_STRINGS.NAV.NEWS, to: '/news', icon: 'article' },
    { name: UI_STRINGS.NAV.PROFILE, to: '/profile', icon: 'person' },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Sidebar navigation component for Paiso.ai dashboard.
 */
const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        console.debug('[Sidebar] Logging out user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/');
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <motion.aside
                className={`fixed md:static top-0 left-0 z-50 h-screen h-full w-48 md:w-56 lg:w-64 bg-[#1A2615] flex flex-col justify-between shadow-xl transform transition-transform duration-300
                  ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:block`}
                initial={{ x: -260, opacity: 0 }}
                animate={{ x: open ? 0 : -260, opacity: open ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
                {/* Top/logo/nav section with flex-1 for max push */}
                <div className="flex flex-col flex-1">
                    <div className="relative">
                        <div className="flex items-center gap-3 px-4 py-6 md:py-8">
                            <img src={logo} alt="Paiso.ai Logo" className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white p-2 border-4 border-[#53D22C] shadow-xl" />
                            <span className="text-2xl md:text-3xl font-extrabold text-[#53D22C] tracking-tight drop-shadow-lg">Paiso.ai</span>
                            {/* Close button for mobile, positioned relative to sidebar */}
                            {open && (
                                <motion.button
                                    className="md:hidden text-gray-400 hover:text-white text-3xl focus:outline-none absolute right-4 top-4 bg-[#232837] bg-opacity-80 rounded-full p-2 shadow-lg z-50"
                                    onClick={onClose}
                                    aria-label="Close sidebar"
                                    whileTap={{ scale: 0.85 }}
                                    whileHover={{ scale: 1.08 }}
                                >
                                    <span className="material-icons">close</span>
                                </motion.button>
                            )}
                        </div>
                        <hr className="border-[#232837] mb-2" />
                        <nav className="flex flex-col gap-2 mt-4 px-2 md:px-4">
                            {navLinks.map(link => (
                                <motion.li
                                    key={link.to}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base md:text-lg font-semibold transition-colors
                ${location.pathname === link.to ? 'bg-[#232837] text-[#53D22C]' : 'text-gray-300 hover:bg-[#232837] hover:text-[#53D22C]'}`}
                                    whileTap={{ scale: 0.92 }}
                                    whileHover={{ scale: 1.04, backgroundColor: '#232837' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                >
                                    <Link
                                        to={link.to}
                                        className="flex items-center gap-3 px-2 py-2 rounded-lg text-base md:text-lg font-semibold transition-colors w-full"
                                        onClick={onClose}
                                    >
                                        <span className="material-icons text-xl md:text-2xl">{link.icon}</span>
                                        {link.name}
                                    </Link>
                                </motion.li>
                            ))}
                        </nav>
                    </div>
                </div>
                <hr className="border-[#232837] my-2" />
                {/* Bottom section: profile photo + logout, flush with bottom */}
                <div className="flex flex-col items-center gap-6 mb-0">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 h-12 md:w-16 md:h-16 border-4 border-[#53D22C] shadow-lg" style={{ backgroundImage: 'url("https://randomuser.me/api/portraits/men/32.jpg")' }} title="Profile"></div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#232837] hover:bg-[#53D22C] text-[#53D22C] hover:text-[#162013] transition-colors shadow-lg border-2 border-[#53D22C]"
                        title={UI_STRINGS.NAV.LOGOUT}
                    >
                        <span className="material-icons text-2xl md:text-3xl">power_settings_new</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar; 
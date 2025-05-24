import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardCardProps {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    percent?: ReactNode;
    percentColor?: string;
    dropdownOptions?: { value: string; label: string }[];
    dropdownValue?: string;
    onDropdownChange?: (val: string) => void;
    tooltip?: string;
    accentColor?: string;
    className?: string;
}

const valueMotion = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
    icon,
    label,
    value,
    percent,
    percentColor,
    dropdownOptions,
    dropdownValue,
    onDropdownChange,
    tooltip,
    accentColor = '#53d22c',
    className = '',
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <motion.div
            className={`relative bg-[#1A2615]/80 backdrop-blur-xl rounded-2xl p-7 flex flex-col items-start shadow-xl min-w-[220px] flex-1 border border-white/10 hover:shadow-2xl transition-shadow duration-200 ${className}`}
            style={{ boxShadow: `0 4px 32px 0 ${accentColor}22` }}
            whileHover={{ y: -4, boxShadow: `0 8px 40px 0 ${accentColor}33` }}
        >
            <div className="flex items-center w-full justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl" style={{ color: accentColor }}>{icon}</span>
                    <span className="text-[#53d22c] font-bold text-lg tracking-wide max-w-[200px]" title={label}>{label}</span>
                    {tooltip && (
                        <span
                            className="ml-1 text-[#7ecbff] cursor-pointer relative"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            tabIndex={0}
                            onFocus={() => setShowTooltip(true)}
                            onBlur={() => setShowTooltip(false)}
                        >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#7ecbff" opacity="0.18" /><path d="M12 8v4" stroke="#7ecbff" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="#7ecbff" /></svg>
                            <AnimatePresence>
                                {showTooltip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 bg-[#101c13] text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-white/10 min-w-[180px]"
                                    >
                                        {tooltip}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </span>
                    )}
                </div>
                {dropdownOptions && dropdownValue && onDropdownChange && (
                    <div className="flex-shrink-0 ml-2">
                        <select
                            className="bg-transparent text-[#7ecbff] font-semibold text-sm outline-none cursor-pointer px-1 py-0.5 rounded hover:bg-[#162013]/40 border border-white/10"
                            value={dropdownValue}
                            onChange={e => onDropdownChange(e.target.value)}
                            title="Change timeframe"
                        >
                            {dropdownOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                )}
            </div>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={String(value)} {...valueMotion} className="text-2xl font-extrabold mb-1 text-white drop-shadow">
                    {value}
                </motion.div>
            </AnimatePresence>
            {typeof percent !== 'undefined' && (
                <div className="text-sm font-semibold" style={{ color: percentColor || (Number(percent) >= 0 ? accentColor : '#ff5a5a') }}>
                    {percent}
                </div>
            )}
        </motion.div>
    );
}; 
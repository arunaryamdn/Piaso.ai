import React from 'react';
import { motion } from 'framer-motion';

const McpChat: React.FC = () => (
    <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
    >
        <div className="rounded-2xl bg-[#1A2615]/80 border border-white/10 shadow-2xl p-12 flex flex-col items-center max-w-md w-full text-center">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-6">
                <circle cx="12" cy="12" r="10" stroke="#53D22C" strokeWidth="1.5" opacity="0.3" />
                <path d="M8 12h8M12 8v8" stroke="#53D22C" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h2 className="text-2xl font-extrabold text-white mb-3">Broker Chat</h2>
            <p className="text-[#A2C398] text-base mb-2">
                AI-powered broker integration is coming soon.
            </p>
            <p className="text-gray-500 text-sm">
                Connect your Zerodha account to chat with your portfolio, place orders, and get real-time insights.
            </p>
            <span className="mt-8 inline-block bg-[#53D22C]/10 text-[#53D22C] text-xs font-bold px-4 py-1.5 rounded-full border border-[#53D22C]/30">
                Coming Soon
            </span>
        </div>
    </motion.div>
);

export default McpChat;

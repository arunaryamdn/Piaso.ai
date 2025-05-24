import React from 'react';

const CardSkeleton: React.FC = () => (
    <div className="min-h-[180px] flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a2615]/60 to-[#1a2615]/80 shadow animate-pulse p-7 w-full">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#232837]/40" />
            <div className="h-5 w-32 rounded bg-[#232837]/60" />
        </div>
        <div className="h-8 w-40 rounded bg-[#232837]/60 mb-2" />
        <div className="h-4 w-24 rounded bg-[#232837]/40" />
    </div>
);

export default CardSkeleton; 
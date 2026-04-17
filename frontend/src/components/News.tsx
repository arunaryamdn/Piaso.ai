import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UI_STRINGS, API } from '../config';

interface Article {
    title: string;
    link: string;
    publisher: string;
    published: number | null;
    symbol: string;
    thumbnail?: string;
}

const formatDate = (ts: number | null) => {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const News: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [symbolFilter, setSymbolFilter] = useState('');

    useEffect(() => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        fetch(`${API.BASE_URL}/api/news`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
            .then(data => setArticles(data.articles || []))
            .catch(e => setError(e.detail || e.message || UI_STRINGS.GENERAL.ERROR))
            .finally(() => setLoading(false));
    }, []);

    const symbols = Array.from(new Set(articles.map(a => a.symbol))).filter(Boolean);
    const filtered = symbolFilter ? articles.filter(a => a.symbol === symbolFilter) : articles;

    return (
        <motion.div
            className="p-4 md:p-6 flex flex-col gap-6 w-full max-w-screen-xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div>
                <h1 className="text-3xl font-extrabold text-white">{UI_STRINGS.NEWS.TITLE}</h1>
                <p className="text-[#A2C398] mt-1">Latest news from your portfolio stocks</p>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    onClick={() => setSymbolFilter('')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${symbolFilter === '' ? 'bg-[#53D22C] text-[#162013]' : 'bg-[#1A2615] text-[#A2C398] border border-white/10 hover:border-[#53D22C]/40'}`}
                >
                    All
                </button>
                {symbols.map(sym => (
                    <button
                        key={sym}
                        onClick={() => setSymbolFilter(sym)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${symbolFilter === sym ? 'bg-[#53D22C] text-[#162013]' : 'bg-[#1A2615] text-[#A2C398] border border-white/10 hover:border-[#53D22C]/40'}`}
                    >
                        {sym}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-[#1A2615]/80 border border-white/5 p-5 animate-pulse h-40" />
                    ))}
                </div>
            )}

            {error && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-4xl mb-4">📰</span>
                    <h2 className="text-xl font-bold text-[#53d22c] mb-2">{UI_STRINGS.NEWS.UNAVAILABLE}</h2>
                    <p className="text-gray-400">{UI_STRINGS.NEWS.UNAVAILABLE_DESC}</p>
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-4xl mb-4">📭</span>
                    <p className="text-gray-400">No news articles found. Upload a portfolio to see relevant news.</p>
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((article, idx) => (
                        <a
                            key={idx}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col rounded-2xl bg-[#1A2615]/80 border border-white/5 hover:border-[#53D22C]/30 p-5 transition-all hover:shadow-xl hover:-translate-y-0.5 group"
                        >
                            {article.thumbnail && (
                                <img
                                    src={article.thumbnail}
                                    alt=""
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-[#53D22C]/10 text-[#53D22C] border border-[#53D22C]/20 rounded px-2 py-0.5">
                                    {article.symbol}
                                </span>
                                {article.publisher && (
                                    <span className="text-xs text-gray-500 truncate">{article.publisher}</span>
                                )}
                            </div>
                            <p className="text-white text-sm font-semibold leading-snug group-hover:text-[#53D22C] transition-colors flex-1 line-clamp-3">
                                {article.title}
                            </p>
                            {article.published && (
                                <p className="text-gray-500 text-xs mt-3">{formatDate(article.published)}</p>
                            )}
                        </a>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default News;

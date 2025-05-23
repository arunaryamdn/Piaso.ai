// News.tsx
// News page for Paiso.ai. Shows real-time news feed (currently unavailable placeholder).

import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';
import { UI_STRINGS } from '../config';

/**
 * News page component. Shows filters and a placeholder message for news feed.
 */
const News: React.FC = () => {
  const [stock, setStock] = useState('');
  const [sector, setSector] = useState('');
  const [search, setSearch] = useState('');

  console.debug('[News] Rendered News page');

  const stockOptions = [
    { value: '', label: 'All Stocks' },
    { value: 'reliance', label: 'Reliance Industries' },
    { value: 'tcs', label: 'Tata Consultancy Services' },
    { value: 'hdfc', label: 'HDFC Bank' },
    { value: 'infosys', label: 'Infosys' },
  ];
  const sectorOptions = [
    { value: '', label: 'All Sectors' },
    { value: 'it', label: 'Information Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'energy', label: 'Energy' },
    { value: 'auto', label: 'Automobile' },
  ];

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', width: '100%' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>{UI_STRINGS.NEWS.TITLE}</h1>
      </div>
      <div className="relative flex min-h-screen flex-col bg-[#162013] font-[Manrope, Noto Sans, sans-serif]">
        <header className="flex items-center justify-between border-b border-[#2e4328] px-10 py-4 shadow-sm">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 text-[#53d22c]">
              <img src={logo} alt="Paiso.ai Logo" className="news-logo" style={{ height: 28, width: 28 }} />
              <h2 className="text-[#53d22c] text-xl font-bold leading-tight tracking-[-0.015em]">Paiso.ai</h2>
            </div>
            <nav className="flex items-center gap-8">
              <Link className="text-gray-300 hover:text-white text-sm font-medium" to="/portfolio">{UI_STRINGS.NAV.PORTFOLIO}</Link>
              <Link className="text-gray-300 hover:text-white text-sm font-medium" to="/dashboard">{UI_STRINGS.NAV.WATCHLIST}</Link>
              <Link className="text-[#53d22c] text-sm font-bold" to="/news">{UI_STRINGS.NAV.NEWS}</Link>
              <Link className="text-gray-300 hover:text-white text-sm font-medium" to="/ai">{UI_STRINGS.NAV.AI}</Link>
              <Link className="text-gray-300 hover:text-white text-sm font-medium" to="/realtime">{UI_STRINGS.NAV.REALTIME}</Link>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 gap-8 px-8 py-6">
          <aside className="flex flex-col w-72 bg-[#1A2615] rounded-xl p-6 shadow-lg self-start">
            <h2 className="text-white text-xl font-semibold mb-6">{UI_STRINGS.NEWS.FILTERS}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="stock-filter">Filter by Stock</label>
                <select
                  className="form-select block w-full rounded-lg text-gray-300 focus:outline-0 focus:ring-2 focus:ring-[#53d22c] border border-[#426039] bg-[#21301c] focus:border-[#53d22c] h-12 px-3.5 text-sm font-normal"
                  id="stock-filter"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                >
                  {stockOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="sector-filter">Filter by Sector</label>
                <select
                  className="form-select block w-full rounded-lg text-gray-300 focus:outline-0 focus:ring-2 focus:ring-[#53d22c] border border-[#426039] bg-[#21301c] focus:border-[#53d22c] h-12 px-3.5 text-sm font-normal"
                  id="sector-filter"
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                >
                  {sectorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center rounded-lg h-11 px-4 mt-8 w-full bg-[#53d22c] hover:bg-[#48b826] text-[#162013] text-sm font-bold tracking-[0.015em] transition-colors">
              <span className="truncate">{UI_STRINGS.NEWS.APPLY_FILTERS}</span>
            </button>
          </aside>
          <section className="flex flex-col flex-1">
            <h1 className="text-white tracking-tight text-3xl font-bold mb-6">{UI_STRINGS.NEWS.REALTIME_FEED}</h1>
            <div className="flex flex-col items-center justify-center h-full py-24">
              <span className="material-icons" style={{ fontSize: 64, color: '#7ecbff', marginBottom: 16 }}>info</span>
              <h2 className="text-2xl font-bold text-[#53d22c] mb-2">{UI_STRINGS.NEWS.UNAVAILABLE}</h2>
              <p className="text-gray-400 text-lg">{UI_STRINGS.NEWS.UNAVAILABLE_DESC}</p>
            </div>
          </section>
        </main>
      </div>
    </motion.div>
  );
};

export default News;
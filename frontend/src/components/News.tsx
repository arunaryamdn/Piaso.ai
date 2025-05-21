import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from './useNews';
import logo from '../assets/logo.png'; // Adjust path as needed

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

const News: React.FC = () => {
  const { data, loading, error } = useNews();
  const [stock, setStock] = useState('');
  const [sector, setSector] = useState('');
  const [search, setSearch] = useState('');

  // Demo images for static news (replace with real data if available)
  const demoImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCDXn_p6DCfqE3gr7oWx8jS5_n-SpS4G3GJI-eouc58WSz76brWfh7lpsaj5EjBmMFQPspVyGl9bb0p4WMH7AY9ynWoKZW5zhXZ3LnPaojdmbzAqKJzweMKCmBa1DjbK8DFnFNr6DadRV3dd79hytfsSR4KOrNrYJFpMxTGtb7uhbwuJOoA8kTg-b7Jrdbtua1OKOeCwUqanzQQnXCPtp8cs_NHTX8zhlhjW7CdgrGUJm-n_NShmHfOXmNoZ9wg6yZszvUPVQRHs6Xc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuALA-a_9C63yd68AulDPALkt4TfIGHoroQlYkqulvdKbXY4YaNE9WH-Fyxe0CiucqzjIdXqNS-ZlCU8heYAHADVn1i8nSEsHqy_hCEybNMXPNsHDj_5HbUWx1j7iDy_GAXC98RlZcYJBIU2cTQIL9gmt3l8_WuYXfhRG7xftUwZ6FGz6n1WdbqGuMr-letUg7kEJtejt55kRfvVpMewppns5uENrVtsHcXysuj0Y-zlM6XJdYND93DW6TeyQGR7ZtdLOkHEPp8HmjsT',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBXw1He2zlBYU24pbyxjDFcOThPsMq-HoIVxYi9xWf3xFc1XY5s73ygIBRm5LuRPoIenNJM0qtYj0zs-RFlzmpY89bWBXnj4PHu3COqha_SfMmn9_C0d0XG6hapAN0BFfwEGORflR0fXNegvUHoCX80Vm892Ca-O2z82KqaymejiE2-rwn8RVw4pq1ku9uHpif1g6jdTwBAcv9cFuJH1bc3MjBY12a7BEzClJIfEalgI9uUSk9pFDIa-2ufDDNQTukeGZMGrew3zaxX',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBqVEzbrlkh_7coasYjTQXED6wqBlFn7Sjlcxep2WF49Tgu9zeLJpJU5y-BJcmfgS6I1fZsPfv4mCGb9JaivtJ0tS00MSonivbaty-3OtBX_sHZ46B-V_hGNkvbpSwIIvh6-qXl8G-V-o9jGWSnDVc0g7k9a8_XCO_L9QdAr_mhRwFrMqQKfdpDpP7F4CI1TKp0Uv3Fu_lEeAYLPeRAPUJLAMH8QQ_Z_Hc81KzVJ8nFE5qB1_PYDLzS5_YvWiFWSZIH8u9wPr7E0fzf',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBkkja8RsYeAIQIuzUGbX2uDcJFB0yPU_kGd_Yqgc9Rgy8WuRoKUX_UwosBcb7KsO3cIDZ8cNcFVqRx0s0PJIXjf626roMT8yTWUE3nc9idZmqdHHSHHQ3S_W-udjsPnfpl7GyIAaAo4O-Q9Y9yBHFvrYTu9kWOH_nQeLL72oEsHlJeVsADyc3OB69gwfVMfuB7OeKGozBJOA-0_gDMAM4u6xN69Hm9HK2J1SvIZP1oSA_aTp-5gB-fUJqyLKVn-Fmgx8_ryn-vK3BM',
  ];

  // Flatten news data for rendering
  const articles = Object.entries(data).flatMap(([ticker, arr]) =>
    arr.map((article, i) => ({ ...article, ticker, img: demoImages[i % demoImages.length] }))
  );

  // Filter logic (demo only, real filter should be backend-driven)
  const filtered = articles.filter(a =>
    (!stock || a.ticker.toLowerCase() === stock || a.ticker.toLowerCase().includes(stock)) &&
    (!sector || true) && // sector filter demo only
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-[#162013] font-[Manrope, Noto Sans, sans-serif]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#2e4328] px-10 py-4 shadow-sm">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 text-[#53d22c]">
            <img src={logo} alt="Paiso.ai Logo" className="news-logo" style={{ height: 28, width: 28 }} />
            <h2 className="text-[#53d22c] text-xl font-bold leading-tight tracking-[-0.015em]">Paiso.ai</h2>
          </div>
          <nav className="flex items-center gap-8">
            <Link className="text-gray-300 hover:text-white text-sm font-medium" to="/portfolio">My Portfolio</Link>
            <Link className="text-gray-300 hover:text-white text-sm font-medium" to="/dashboard">Watchlist</Link>
            <Link className="text-[#53d22c] text-sm font-bold" to="/news">News</Link>
            <Link className="text-gray-300 hover:text-white text-sm font-medium" to="/ai">Analysis</Link>
            <Link className="text-gray-300 hover:text-white text-sm font-medium" to="/realtime">Community</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#a2c398] flex border-none bg-[#222e1c] items-center justify-center pl-3 rounded-l-lg border-r-0">
                {/* Magnifying glass icon */}
                <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-300 focus:outline-0 focus:ring-2 focus:ring-[#53d22c] border-none bg-[#222e1c] focus:border-none h-full placeholder:text-[#a2c398] px-3.5 rounded-l-none border-l-0 pl-2 text-sm font-normal"
                placeholder="Search stocks, news..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </label>
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-[#222e1c] text-gray-300 hover:text-white hover:bg-[#2e4328] transition-colors">
            {/* Bell icon */}
            <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path></svg>
          </button>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#53d22c]" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAiL-Xs3OqsHTRanmYESiaBo-Cgu36H4pef3iEwbUUXb7ZB-5Bi7Yh_-MU6dbN1jfnP4O4FwRF41rGYAxkp4VxQRmFWtnau-iOeRvy8T35XvYu62_B_xcgEA-64fZ3mVUjUcajWZeTUrWHZjSw-9XiT66py5Hf1h5OWDvo_p4uWDz87l5JDcEi1RufhDYfypP54M-CxjxsJq-dLLZA_mT97zDuKVZAWO_E65pjJTeo1xeobYRYe5VMtIW5zMhWr-owv--x68Qb7F3H5)' }} />
        </div>
      </header>
      <main className="flex flex-1 gap-8 px-8 py-6">
        {/* Sidebar Filters */}
        <aside className="flex flex-col w-72 bg-[#1A2615] rounded-xl p-6 shadow-lg self-start">
          <h2 className="text-white text-xl font-semibold mb-6">Filters</h2>
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
            <span className="truncate">Apply Filters</span>
          </button>
        </aside>
        {/* News Feed Section */}
        <section className="flex flex-col flex-1">
          <h1 className="text-white tracking-tight text-3xl font-bold mb-6">Real-Time News Feed</h1>
          <div className="space-y-5">
            {loading && <div className="text-gray-400">Loading news...</div>}
            {error && <div className="text-red-400">Error: {error}</div>}
            {!loading && !error && filtered.length === 0 && <div className="text-gray-400">No news available.</div>}
            {filtered.map((article, i) => (
              <article key={i} className="flex gap-5 bg-[#1A2615] p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
                <img
                  alt={article.title}
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[80px] object-cover"
                  src={article.img}
                />
                <div className="flex flex-1 flex-col justify-center">
                  <a href={article.link} target="_blank" rel="noopener noreferrer">
                    <h3 className="text-white text-lg font-semibold leading-snug hover:text-[#53d22c] transition-colors cursor-pointer">{article.title}</h3>
                  </a>
                  <p className="text-[#a2c398] text-sm font-normal mt-1">{article.ticker}</p>
                  <p className="text-gray-500 text-xs font-normal mt-2">{article.publisher} • {article.providerPublishTime}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default News;
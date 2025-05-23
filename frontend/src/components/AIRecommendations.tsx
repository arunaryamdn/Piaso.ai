import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Adjust path as needed
import { motion } from 'framer-motion';

const AIRecommendations: React.FC = () => {
  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', width: '100%' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>AI Recommendations</h1>
        {/* Add any action buttons here, styled with dashboard-add-btn if needed */}
      </div>
      <div className="ai-root">
        <header className="ai-header">
          <div className="ai-logo-row">
            <img src={logo} alt="Paiso.ai Logo" className="ai-logo" style={{ height: 32, width: 32 }} />
            <h1>Paiso.ai</h1>
          </div>
          <nav className="ai-nav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/ai">Research</Link>
            <Link to="/news">News</Link>
          </nav>
          <div className="ai-header-actions">
            <label className="ai-search-label">
              <span className="ai-search-icon">
                <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11 0 1 0-11.31,11.31l50.06,50.07a8,8 0 0 0 11.32-11.32ZM40,112a72,72 0 1 1,72,72A72.08,72.08 0 0 1,40,112Z" />
                </svg>
              </span>
              <input className="ai-search-input" placeholder="Search stocks..." />
            </label>
            <button className="ai-notify-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="ai-avatar" />
          </div>
        </header>
        <main className="ai-main">
          <div className="ai-title-block">
            <h1>AI Investment <span className="ai-title-highlight">Recommendations</span> & Insights</h1>
            <p>Leverage our AI-powered analytics for smarter portfolio decisions. Get actionable insights on diversification, buying/selling opportunities, and risk management.</p>
          </div>
          <motion.div
            className="ai-cards-grid fadeInUp"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.13,
                },
              },
            }}
          >
            <motion.div
              className="ai-card"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <div className="ai-card-header">
                <span className="material-symbols-outlined" style={{ color: '#53d22c' }}>account_balance_wallet</span>
                <h3>Portfolio Diversification</h3>
              </div>
              <p>Our AI suggests diversifying into <b>IT, Healthcare, and Consumer Discretionary</b> sectors to mitigate risk and potentially enhance returns based on your current holdings.</p>
              <button className="ai-card-btn">
                Explore Diversification <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </motion.div>
            <motion.div
              className="ai-card"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <div className="ai-card-header">
                <span className="material-symbols-outlined" style={{ color: '#53d22c' }}>trending_up</span>
                <h3>Buying Opportunities</h3>
              </div>
              <p>Identified undervalued stocks with strong fundamentals: Consider adding <b>'Tech Solutions Ltd.', 'HealthCare Innovations Inc.', and 'Consumer Goods Corp.'</b> to your portfolio.</p>
              <button className="ai-card-btn">
                View Opportunities <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </motion.div>
            <motion.div
              className="ai-card"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <div className="ai-card-header">
                <span className="material-symbols-outlined" style={{ color: 'orange' }}>trending_down</span>
                <h3>Selling Considerations</h3>
              </div>
              <p>Review your holdings in <b>'Energy Resources Ltd.' and 'Financial Services Group'.</b> Consider selling or reducing positions to optimize performance.</p>
              <button className="ai-card-btn ai-card-btn-orange">
                Analyze Holdings <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </motion.div>
            <motion.div
              className="ai-card"
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <div className="ai-card-header">
                <span className="material-symbols-outlined" style={{ color: '#60a5fa' }}>verified_user</span>
                <h3>Risk Management</h3>
              </div>
              <p>Our AI recommends setting stop-loss orders and regularly reviewing your portfolio to manage downside risk and protect gains.</p>
              <button className="ai-card-btn ai-card-btn-blue">
                Learn More <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </motion.div>
  );
};

export default AIRecommendations;
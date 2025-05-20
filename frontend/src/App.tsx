import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Dashboard from './components/Dashboard';
import PortfolioTable from './components/PortfolioTable';
import SectorAnalysis from './components/SectorAnalysis';
import RealTimePrices from './components/RealTimePrices'; // Capital 'T'
import AIRecommendations from './components/AIRecommendations';
import News from './components/News';
import PortfolioUpload from './components/PortfolioUpload';
import HistoricalPerformance from './components/HistoricalPerformance';
import RiskMetrics from './components/RiskMetrics';

function App() {
  return (
    <Router>
      <div>
        <h1>Stock Market Analyser</h1>
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: 10 }}>Home</Link>
          <Link to="/dashboard" style={{ marginRight: 10 }}>Dashboard</Link>
          <Link to="/portfolio" style={{ marginRight: 10 }}>Portfolio</Link>
          <Link to="/sector" style={{ marginRight: 10 }}>Sector Analysis</Link>
          <Link to="/realtime" style={{ marginRight: 10 }}>Real-Time Prices</Link>
          <Link to="/ai" style={{ marginRight: 10 }}>AI Recommendations</Link>
          <Link to="/news" style={{ marginRight: 10 }}>News</Link>
          <Link to="/upload" style={{ marginRight: 10 }}>Upload Portfolio</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<PortfolioTable />} />
          <Route path="/sector" element={<SectorAnalysis />} />
          <Route path="/realtime" element={<RealTimePrices />} />
          <Route path="/ai" element={<AIRecommendations />} />
          <Route path="/news" element={<News />} />
          <Route path="/upload" element={<PortfolioUpload />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <HistoricalPerformance />
        <RiskMetrics />
      </div>
    </Router>
  );
}

export default App;

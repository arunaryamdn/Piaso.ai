import React, { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSkeleton from './LoadingSkeleton';
import { fetchFromBackend } from '../services/api';
import { UI_STRINGS } from '../config';

const RiskMetrics: React.FC = () => {
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFromBackend('api/risk?days=30')
      .then(setRisk)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton type="card" width="100%" height={120} count={3} />;
  if (error) return <div className="error-message">{error}</div>;
  if (!risk) return <div>{UI_STRINGS.GENERAL.NO_DATA}</div>;

  return (
    <ErrorBoundary>
      <div>
        <h2>Risk Metrics</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div className="risk-card">
            <strong>Volatility:</strong><br />
            {risk.volatility !== null ? `${risk.volatility.toFixed(2)}%` : 'N/A'}
          </div>
          <div className="risk-card">
            <strong>Max Drawdown:</strong><br />
            {risk.max_drawdown !== null ? `${risk.max_drawdown.toFixed(2)}%` : 'N/A'}
          </div>
          <div className="risk-card">
            <strong>Top Sector:</strong><br />
            {risk.top_sector || 'N/A'}
          </div>
          <div className="risk-card">
            <strong>Top Sector Exposure:</strong><br />
            {risk.top_sector_exposure !== null ? `${risk.top_sector_exposure.toFixed(2)}%` : 'N/A'}
          </div>
          <div className="risk-card">
            <strong>Sector Concentration:</strong><br />
            {risk.sector_concentration !== null ? `${risk.sector_concentration.toFixed(2)}%` : 'N/A'}
          </div>
          <div className="risk-card">
            <strong>Number of Sectors:</strong><br />
            {risk.num_sectors !== null ? risk.num_sectors : 'N/A'}
          </div>
        </div>
        <style>
          {`
            .risk-card {
              background: #f4f6fb;
              border-radius: 12px;
              padding: 20px 28px;
              min-width: 180px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
              margin-bottom: 16px;
            }
          `}
        </style>
      </div>
    </ErrorBoundary>
  );
};

export default RiskMetrics;
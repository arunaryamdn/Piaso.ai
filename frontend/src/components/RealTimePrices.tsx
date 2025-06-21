import React, { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSkeleton from './LoadingSkeleton';
import { UI_STRINGS } from '../config';
import { Link } from 'react-router-dom';
import { fetchFromBackend } from '../services/api';

interface MarketStatusResponse {
  status: 'open' | 'closed';
}

interface RealTimePriceData {
  Symbol: string;
  Live_Price: number;
  [key: string]: any;
}

const RealTimePrices: React.FC = () => {
  const [data, setData] = useState<RealTimePriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchFromBackend<RealTimePriceData[]>('api/realtime_prices')
      .then((response: RealTimePriceData[]) => setData(response))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFromBackend<MarketStatusResponse>('api/marketstatus')
      .then((response: MarketStatusResponse) => setMarketStatus(response.status || 'closed'))
      .catch((err: any) => setStatusError(err.message))
      .finally(() => setStatusLoading(false));
  }, []);

  if (loading || statusLoading) return <LoadingSkeleton type="card" width="100%" height={120} count={2} />;
  if (statusError) return <div className="error-message">{statusError}</div>;
  if (!data.length) return <div>{UI_STRINGS.GENERAL.NO_DATA}</div>;

  return (
    <ErrorBoundary>
      <div className="realtime-prices">
        <h2>Real-Time Prices</h2>
        <div className="market-status">
          Market is currently {marketStatus === 'open' ? 'open' : 'closed'}
        </div>
        <div className="prices-grid">
          {data.map((stock) => (
            <div key={stock.Symbol} className="price-card">
              <Link to={`/stock/${stock.Symbol}`}>
                <div className="symbol">{stock.Symbol}</div>
                <div className="price">₹{stock.Live_Price?.toFixed(2) || 'N/A'}</div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RealTimePrices;
// PortfolioTable.tsx
// Table component for displaying uploaded portfolio in Paiso.ai.

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSkeleton from './LoadingSkeleton';
import { UI_STRINGS } from '../config';

interface PortfolioTableProps {
  data: Array<{
    symbol: string;
    quantity: number;
    avg_price: number;
    purchase_date: string;
    // Add historicalData?: number[] for sparkline in future
  }>;
  loading?: boolean;
  error?: string | null;
}

/**
 * Table component for displaying uploaded portfolio data.
 */
const PortfolioTable: React.FC<PortfolioTableProps> = ({ data, loading, error }) => {
  if (loading) return <LoadingSkeleton type="card" width="100%" height={120} count={3} />;
  if (error) return <div className="error-message">{error}</div>;
  if (!data || data.length === 0) {
    return <div style={{ color: '#b2e3a7', marginTop: 24 }}>{UI_STRINGS.GENERAL.NO_DATA}</div>;
  }
  return (
    <ErrorBoundary>
      <div className="portfolio-table">
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#232837', borderRadius: 12, overflow: 'hidden', marginTop: 16 }}>
          <thead>
            <tr style={{ background: '#1A2615', color: '#53d22c', fontWeight: 700 }}>
              <th style={{ padding: 12 }}>Stock Symbol</th>
              <th style={{ padding: 12 }}>Quantity</th>
              <th style={{ padding: 12 }}>Average Price</th>
              <th style={{ padding: 12 }}>Date of Purchase</th>
              <th style={{ padding: 12 }}>Performance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={`${row.symbol}-${row.purchase_date}`} style={{ borderBottom: '1px solid #2e4328', color: '#fff' }}>
                <td style={{ padding: 12 }}>{row.symbol}</td>
                <td style={{ padding: 12 }}>{row.quantity}</td>
                <td style={{ padding: 12 }}>₹{row.avg_price.toFixed(2)}</td>
                <td style={{ padding: 12 }}>{new Date(row.purchase_date).toLocaleDateString()}</td>
                <td style={{ padding: 12 }}>
                  {/* Placeholder for sparkline/mini-graph */}
                  <div className="w-24 h-6 bg-[#232837]/60 rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ErrorBoundary>
  );
};

export default PortfolioTable;
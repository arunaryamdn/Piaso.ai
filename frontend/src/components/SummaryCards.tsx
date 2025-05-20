import React from 'react';
import { DashboardMetrics } from './useDashboardData';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
}

const cardStyle: React.CSSProperties = {
  display: 'inline-block',
  margin: '0 16px 16px 0',
  padding: 16,
  border: '1px solid #eee',
  borderRadius: 8,
  minWidth: 160,
  background: '#fafbfc',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 24 }}>
    <div style={cardStyle}>
      <div>Total Investment</div>
      <div style={{ fontWeight: 'bold', fontSize: 20 }}>₹{metrics.total_investment ? metrics.total_investment.toLocaleString() : '0'}</div>
    </div>
    <div style={cardStyle}>
      <div>Current Value</div>
      <div style={{ fontWeight: 'bold', fontSize: 20 }}>₹{metrics.total_value ? metrics.total_value.toLocaleString() : '0'}</div>
    </div>
    <div style={cardStyle}>
      <div>Total P/L</div>
      <div style={{ fontWeight: 'bold', fontSize: 20, color: metrics.total_pl && metrics.total_pl >= 0 ? 'green' : 'red' }}>
        ₹{metrics.total_pl ? metrics.total_pl.toLocaleString() : '0'} ({metrics.pl_percent ? metrics.pl_percent.toFixed(2) : '0.00'}%)
      </div>
    </div>
    <div style={cardStyle}>
      <div>Stocks</div>
      <div style={{ fontWeight: 'bold', fontSize: 20 }}>{metrics.num_stocks ?? 0}</div>
      <div style={{ fontSize: 12, color: '#888' }}>🟢 {metrics.profit_stocks ?? 0} | 🔴 {metrics.loss_stocks ?? 0}</div>
    </div>
  </div>
);

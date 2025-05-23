// PortfolioTable.tsx
// Table component for displaying uploaded portfolio in Paiso.ai.

import React from 'react';
import { UI_STRINGS } from '../config';

interface PortfolioTableProps {
  data: Array<{
    symbol: string;
    quantity: number;
    avg_price: number;
    purchase_date: string;
  }>;
}

/**
 * Table component for displaying uploaded portfolio data.
 */
const PortfolioTable: React.FC<PortfolioTableProps> = ({ data }) => {
  console.debug('[PortfolioTable] Rendered with', data?.length, 'rows');
  if (!data || data.length === 0) {
    return <div style={{ color: '#b2e3a7', marginTop: 24 }}>{UI_STRINGS.GENERAL.NO_DATA}</div>;
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#232837', borderRadius: 12, overflow: 'hidden', marginTop: 16 }}>
      <thead>
        <tr style={{ background: '#1A2615', color: '#53d22c', fontWeight: 700 }}>
          <th style={{ padding: 12 }}>Stock Symbol</th>
          <th style={{ padding: 12 }}>Quantity</th>
          <th style={{ padding: 12 }}>Average Price</th>
          <th style={{ padding: 12 }}>Date of Purchase</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid #2e4328', color: '#fff' }}>
            <td style={{ padding: 12 }}>{row.symbol}</td>
            <td style={{ padding: 12 }}>{row.quantity}</td>
            <td style={{ padding: 12 }}>{row.avg_price}</td>
            <td style={{ padding: 12 }}>{row.purchase_date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PortfolioTable;
import React from 'react';
import { useRealTimePrices } from './useRealTimePrices';

const RealTimePrices: React.FC = () => {
  const { data, loading, error } = useRealTimePrices();

  if (loading) return <div>Loading real-time prices...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Real-Time Prices</h2>
      <table>
        <thead>
          <tr>
            {data[0] && Object.keys(data[0]).map(key => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => (
                <td key={j}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RealTimePrices;
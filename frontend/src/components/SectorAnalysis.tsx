import React from 'react';
import { useSectorAnalysis } from './useSectorAnalysis';

const SectorAnalysis: React.FC = () => {
  const { data, loading, error } = useSectorAnalysis();

  if (loading) return <div>Loading sector analysis...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Sector Analysis</h2>
      <table>
        <thead>
          <tr>
            <th>Sector</th>
            <th>Current Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.Sector}>
              <td>{row.Sector}</td>
              <td>{row.Current_Value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SectorAnalysis;
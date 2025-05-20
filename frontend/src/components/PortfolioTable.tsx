import React, { useState } from 'react';
import { usePortfolioTable } from './usePortfolioTable';

const PortfolioTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data, loading, error } = usePortfolioTable(search);

  return (
    <div>
      <h2>Portfolio Table</h2>
      <input
        type="text"
        placeholder="Search by Symbol or Sector"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, padding: 4 }}
      />
      {loading && <div>Loading portfolio...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {data[0] && Object.keys(data[0]).map(key => (
                <th key={key} style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j} style={{ padding: 8, borderBottom: '1px solid #eee' }}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PortfolioTable;
import React, { useEffect, useState } from 'react';

const SectorAnalysis: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Placeholder: fetch or set demo data
    setTimeout(() => {
      setData([
        { Sector: 'IT', Current_Value: 100000 },
        { Sector: 'Finance', Current_Value: 50000 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div>Loading sector analysis...</div>;

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
          {data.map((row: any) => (
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
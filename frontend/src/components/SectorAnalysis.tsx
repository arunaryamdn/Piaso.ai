import React, { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSkeleton from './LoadingSkeleton';
import { UI_STRINGS, API } from '../config';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  '#53D22C', '#7ecbff', '#ffb347', '#A2C398', '#76a369', '#b5cbb0', '#ff6384', '#36a2eb', '#ffce56', '#b39ddb', '#f06292'
];

const SectorAnalysis: React.FC = () => {

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    fetch(`${API.BASE_URL}/api/sector_analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({})
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch sector allocation');
        const d = await res.json();
        setData(Array.isArray(d) ? d : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton type="card" width="100%" height={200} count={1} />;
  if (error) return <div className="error-message">{error}</div>;
  if (!data.length) return <div>{UI_STRINGS.GENERAL.NO_DATA}</div>;

  const normalized = data.map((row: any) => ({
    sector: row.Sector ?? row.sector,
    current_value: row.Current_Value ?? row.current_value
  }));

  return (
    <ErrorBoundary>
      <div className="rounded-2xl bg-[#1A2615]/80 p-6 shadow-xl w-full">
        <h2 className="text-lg font-bold mb-4 text-[#53d22c] flex items-center gap-2">
          <span className="material-icons text-2xl align-middle">pie_chart</span>
          Sector Allocation
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={normalized}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="current_value"
              nameKey="sector"
            >
              {normalized.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ErrorBoundary>
  );
};

export default SectorAnalysis;
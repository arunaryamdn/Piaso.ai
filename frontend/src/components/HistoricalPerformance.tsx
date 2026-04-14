import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CardSkeleton from './CardSkeleton';
import { API } from '../config';

const HistoricalPerformance: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API.BASE_URL}/api/historical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
      .then(setData)
      .catch(e => {
        console.error('HistoricalPerformance error:', e);
        setError(e.detail || e.message || 'Failed to load historical data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CardSkeleton />;
  if (error) return <div className="rounded-2xl bg-[#1A2615]/80 p-6 shadow-xl w-full text-red-500">{error}</div>;
  if (!data || !Array.isArray(data) || !data.length) return <div className="rounded-2xl bg-[#1A2615]/80 p-6 shadow-xl w-full text-gray-400">No historical data available.</div>;

  return (
    <div className="rounded-2xl bg-[#1A2615]/80 p-6 shadow-xl w-full">
      <h2 className="text-lg font-bold mb-4 text-[#53d22c]">Historical Performance</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="Portfolio_Value" stroke="#7ecbff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalPerformance;
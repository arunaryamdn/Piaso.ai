import React from 'react';
import { useDashboardData } from './useDashboardData';
import { SummaryCards } from './SummaryCards';

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No dashboard data available.</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <SummaryCards metrics={data} />
      {/* Add more modular subcomponents here for charts, tables, etc. */}
    </div>
  );
};

export default Dashboard;
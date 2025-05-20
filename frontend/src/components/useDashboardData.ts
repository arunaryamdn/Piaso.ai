import { useEffect, useState } from 'react';
import { fetchFromBackend } from '../services/api';

export interface DashboardMetrics {
  total_investment: number;
  total_value: number;
  total_pl: number;
  pl_percent: number;
  num_stocks: number;
  profit_stocks: number;
  loss_stocks: number;
  // ...add more fields as needed
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFromBackend('api/dashboard')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

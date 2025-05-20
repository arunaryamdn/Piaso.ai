import { useEffect, useState } from 'react';
import { fetchFromBackend } from '../services/api';

export interface PortfolioRow {
  Stock: string;
  Ticker?: string;
  Quantity: number;
  Avg_Price: number;
  Sector?: string;
  [key: string]: any;
}

export function usePortfolioTable(search: string) {
  const [data, setData] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFromBackend(`api/portfolio_table?search=${encodeURIComponent(search)}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  return { data, loading, error };
}

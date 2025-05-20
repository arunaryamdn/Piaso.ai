import { useEffect, useState } from 'react';
import { fetchFromBackend } from '../services/api';

export interface RealTimePriceRow {
  Symbol: string;
  Live_Price: number;
  Avg_Price: number;
  Status?: string;
  [key: string]: any;
}

export function useRealTimePrices() {
  const [data, setData] = useState<RealTimePriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFromBackend('api/realtime_prices')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

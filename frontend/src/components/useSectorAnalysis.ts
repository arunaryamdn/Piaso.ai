import { useEffect, useState } from 'react';
import { fetchFromBackend } from '../services/api';

export interface SectorData {
  Sector: string;
  Current_Value: number;
}

export function useSectorAnalysis() {
  const [data, setData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFromBackend('api/sector_analysis')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

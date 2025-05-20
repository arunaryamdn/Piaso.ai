import { useEffect, useState } from 'react';
import { fetchFromBackend } from '../services/api';

export interface AIRecommendationRow {
  Symbol: string;
  Recommendation: string;
  Reason?: string;
  [key: string]: any;
}

export function useAIRecommendations() {
  const [data, setData] = useState<AIRecommendationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFromBackend('api/ai_recommendations')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

import { useEffect, useState } from 'react';
import { fetchFromBackend } from '../services/api';

export interface NewsArticle {
  title: string;
  link: string;
  publisher?: string;
  providerPublishTime?: string;
}

export function useNews() {
  const [data, setData] = useState<Record<string, NewsArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFromBackend('api/news')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

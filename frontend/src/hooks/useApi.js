import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export default function useApi(url, params = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = params ? await api.get(url, { params }) : await api.get(url);
      setData(res.data);
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  }, [url, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

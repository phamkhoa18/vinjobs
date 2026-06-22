/**
 * useApi — Generic data fetching hook
 * =====================================
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => jobsApi.list({ page: 1 }));
 *
 * Tự động fetch khi mount, hỗ trợ refetch thủ công.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (isMounted.current) setData(result);
    } catch (err) {
      if (isMounted.current) setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * useMutation — cho POST/PATCH/DELETE operations
 * Usage:
 *   const { mutate, loading, error } = useMutation((data) => jobsApi.create(data));
 *   await mutate(formData);
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      return result;
    } catch (err) {
      const message = err.message || 'Đã có lỗi xảy ra';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error };
}

export default useApi;

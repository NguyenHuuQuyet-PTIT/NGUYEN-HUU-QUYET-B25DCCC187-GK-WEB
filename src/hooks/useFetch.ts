import { useEffect, useState } from 'react';
import { ApiError, fetchResource } from '../services/api';
import type { TypeGuard } from '../types/models';

export function useFetch<T>(path: string | null, guard: TypeGuard<T>) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    path: string | null;
    data: T | null;
    error: ApiError | null;
    loading: boolean;
  }>({ path: null, data: null, error: null, loading: false });

  useEffect(() => {
    const controller = new AbortController();
    if (path === null) {
      setResult({ path, data: null, error: null, loading: false });
      return () => controller.abort();
    }
    setResult({ path, data: null, error: null, loading: true });
    fetchResource(path, guard, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ path, data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const failure = error instanceof ApiError ? error
          : new ApiError('Không thể kết nối đến máy chủ. Hãy kiểm tra mạng và thử lại.', 0);
        setResult({ path, data: null, error: failure, loading: false });
      });
    return () => controller.abort();
  }, [path, guard, attempt]);

  const current = result.path === path ? result
    : { data: null, error: null, loading: path !== null };
  return { ...current, retry: () => setAttempt((value) => value + 1) };
}

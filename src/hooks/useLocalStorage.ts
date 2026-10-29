import { useCallback, useEffect, useRef, useState } from 'react';
import type { TypeGuard } from '../types/models';

export function useLocalStorage<T>(key: string, fallback: T, guard: TypeGuard<T>) {
  const fallbackRef = useRef(fallback);
  const read = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallbackRef.current;
      const parsed: unknown = JSON.parse(raw);
      return guard(parsed) ? parsed : fallbackRef.current;
    } catch {
      return fallbackRef.current;
    }
  }, [key, guard]);
  const [value, setValue] = useState<T>(read);
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) setValue(read());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key, read]);

  const save = useCallback((next: T | ((previous: T) => T)) => {
    try {
      const updated = typeof next === 'function'
        ? (next as (previous: T) => T)(read()) : next;
      if (!guard(updated)) throw new Error('Invalid storage data');
      localStorage.setItem(key, JSON.stringify(updated));
      setValue(updated);
      setError('');
      return true;
    } catch {
      setError('Không lưu được dữ liệu. Hãy kiểm tra quyền lưu trữ và dung lượng trình duyệt.');
      return false;
    }
  }, [key, read, guard]);

  return { value, save, error };
}

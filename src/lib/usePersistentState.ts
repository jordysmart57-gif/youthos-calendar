import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * useState backed by localStorage. Falls back to `initial` when storage is
 * empty, corrupted, or unavailable (private browsing). Writes are best-effort.
 */
export function usePersistentState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      // ignore — fall back to initial
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage full or blocked — keep running in-memory
    }
  }, [key, state]);

  return [state, setState];
}

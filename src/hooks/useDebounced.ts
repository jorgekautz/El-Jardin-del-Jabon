import { useEffect, useState } from 'react';

/** Retrasa un valor para buscar sin filtrar en cada tecla. */
export function useDebounced<T>(value: T, delay = 180): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

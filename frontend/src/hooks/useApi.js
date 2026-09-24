import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small data-fetching hook: `const { data, loading, error, refetch } = useApi(() => CourseApi.list(params), [params])`
 */
export function useApi(fetcher, deps = [], { enabled = true, initial = null } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const seq = useRef(0);

  const run = useCallback(async () => {
    if (!enabled) return;
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      if (id === seq.current) setData(res);
    } catch (err) {
      if (id === seq.current) setError(err);
    } finally {
      if (id === seq.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run, setData };
}

export function useDebounce(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** Locks body scroll while `active` (drawers, modals). */
export function useLockBody(active) {
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}

/** Runs the callback when `Escape` is pressed. */
export function useEscape(cb, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const h = (e) => { if (e.key === 'Escape') cb(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [cb, active]);
}

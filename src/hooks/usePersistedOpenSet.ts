import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Persist a set of open/expanded keys in localStorage. Stored as an array so
 * JSON round-trips cleanly; exposed as isOpen(id) + toggle(id).
 */
export function usePersistedOpenSet<K extends string | number>(key: string) {
  const [list, setList] = useLocalStorage<K[]>(key, []);
  const set = useMemo(() => new Set(list), [list]);
  const isOpen = useCallback((id: K) => set.has(id), [set]);
  const toggle = useCallback(
    (id: K) => {
      setList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setList],
  );
  return { isOpen, toggle };
}

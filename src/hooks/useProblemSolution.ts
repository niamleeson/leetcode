import { useCallback, useEffect, useState } from 'react';
import { hasSolution, loadSolution } from '../data/solutions/lazy';
import type { ProblemSolution } from '../data/solutions/types';

interface SolutionState {
  id: number;
  solution?: ProblemSolution;
  error?: Error;
}

// The catalog/index supplies availability; this hook requests only the opened
// problem. Ignore an earlier request after navigation or collapse/unmount.
export function useProblemSolution(id: number | undefined) {
  const enabled = id !== undefined && hasSolution(id);
  const [state, setState] = useState<SolutionState>();
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setState(undefined);
    setAttempt(value => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled || id === undefined) return;
    let mounted = true;
    loadSolution(id).then(
      solution => { if (mounted) setState({ id, solution }); },
      error => { if (mounted) setState({ id, error: error instanceof Error ? error : new Error('The solution could not load.') }); },
    );
    return () => { mounted = false; };
  }, [id, enabled, attempt]);

  const current = enabled && state?.id === id ? state : undefined;
  return { solution: current?.solution, loading: enabled && !current, error: current?.error, retry };
}

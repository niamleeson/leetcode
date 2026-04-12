/**
 * useLlmHealth — feature detection for the local LLM grader.
 *
 * Pings /api/llm/health exactly once per page load and caches the result at
 * module scope. Every StudyMode render that calls this hook reads the same
 * cached promise, so a session with 50 reviews never issues 50 pings.
 *
 * Returns {status, health} where status is 'pending' | 'ready'. Modalities
 * branch on `health?.available` to decide whether to show grader UI.
 */
import { useEffect, useState } from 'react';
import { checkLlmHealth, LlmHealth } from '../utils/localLlm';

type Status = 'pending' | 'ready';

// Module-level cache. Resolved once per page load; surviving HMR is not worth
// the complexity since dev refreshes are cheap.
let cached: Promise<LlmHealth> | null = null;

function getHealth(): Promise<LlmHealth> {
  if (!cached) cached = checkLlmHealth();
  return cached;
}

export function useLlmHealth(): { status: Status; health: LlmHealth | null } {
  const [state, setState] = useState<{ status: Status; health: LlmHealth | null }>({
    status: 'pending',
    health: null,
  });

  useEffect(() => {
    let cancelled = false;
    getHealth().then((h) => {
      if (!cancelled) setState({ status: 'ready', health: h });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

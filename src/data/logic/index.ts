import { logicManifest, logicRevision } from './manifest';
import type { LogicProblem } from './types';

export { logicManifest, logicRevision };
export type { LogicProblem, LogicProblemSummary, LogicInterface, LogicParameter, LogicFixture, LogicExample } from './types';

const ids = new Set(logicManifest.map(problem => problem.id));
const cache = new Map<number, Promise<LogicProblem>>();

export function hasLogicProblem(id: number): boolean {
  return ids.has(id);
}

export function logicProblemUrl(id: number): string {
  if (!hasLogicProblem(id)) throw new Error(`No logic practice problem ${id}`);
  return `${import.meta.env.BASE_URL}logic/problems/${logicRevision}/${id}.json`;
}

export function loadLogicProblem(id: number): Promise<LogicProblem> {
  if (!hasLogicProblem(id)) return Promise.reject(new Error(`No logic practice problem ${id}`));
  if (!cache.has(id)) {
    const request = fetch(logicProblemUrl(id)).then(async response => {
      if (!response.ok) throw new Error(`Could not load practice problem (${response.status})`);
      const document: unknown = await response.json();
      if (!document || typeof document !== 'object') throw new Error('Invalid practice problem');
      const candidate = document as LogicProblem;
      if (candidate.id !== id || typeof candidate.starter !== 'string' || !Array.isArray(candidate.interfaces) ||
          !candidate.interfaces.length || !Array.isArray(candidate.fixtures) || !candidate.fixtures.length ||
          candidate.validation?.kind !== 'practice-cases') {
        throw new Error('Practice problem does not match the requested interface');
      }
      return candidate;
    }).catch(error => {
      cache.delete(id);
      throw error;
    });
    cache.set(id, request);
  }
  return cache.get(id)!;
}

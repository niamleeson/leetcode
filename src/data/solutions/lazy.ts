import type { ProblemSolution } from './types';
import { solutionFiles } from './manifest';

const pending = new Map<number, Promise<ProblemSolution>>();

export const hasSolution = (id: number): boolean => Object.prototype.hasOwnProperty.call(solutionFiles, id);

export function loadSolution(id: number): Promise<ProblemSolution> {
  if (!hasSolution(id)) return Promise.reject(new Error('No curated solution for this problem.'));
  const cached = pending.get(id);
  if (cached) return cached;
  const request = fetch(`${import.meta.env.BASE_URL}solutions/${solutionFiles[id]}`)
    .then(async response => {
      if (!response.ok) throw new Error('The solution could not load. Please retry.');
      const solution = await response.json() as ProblemSolution;
      if (solution.id !== id || typeof solution.code !== 'string' || typeof solution.description !== 'string') {
        throw new Error('The solution content is invalid. Please retry.');
      }
      return solution;
    })
    .catch(error => {
      pending.delete(id);
      throw error;
    });
  pending.set(id, request);
  return request;
}

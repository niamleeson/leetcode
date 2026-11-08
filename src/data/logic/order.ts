import { logicManifest } from './index';
import type { LogicProblemSummary } from './types';

const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
const laterTopics = new Set(['1-D Dynamic Programming', '2-D Dynamic Programming', 'Math & Geometry', 'Bit Manipulation']);

export const orderedLogicProblems: readonly LogicProblemSummary[] = [...logicManifest].sort((a, b) =>
  Number(laterTopics.has(a.topic)) - Number(laterTopics.has(b.topic))
  || difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty] || a.id - b.id);

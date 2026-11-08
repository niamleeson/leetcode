import { describe, expect, it } from 'vitest';
import { solutionMap } from './index';
import { complexitySymbols } from './complexity-variables';
import { neetcodeTopics } from '../neetcode250';

describe('problem-specific complexity meanings', () => {
  it('defines every time, space, and breakdown symbol for all 250 problems in both languages', () => {
    const problems = neetcodeTopics.flatMap(topic => topic.problems);
    expect(problems).toHaveLength(250);
    for (const problem of problems) {
      const solution = solutionMap[problem.id];
      for (const variant of [solution, ...solution.followUp ? [solution.followUp] : []]) {
        for (const language of ['javascript', 'python'] as const) {
          const meanings = language === 'python' ? variant.pythonComplexityVariables : variant.complexityVariables;
          expect(meanings, `${problem.id} ${language}`).toBeDefined();
          expect(Object.keys(meanings!)).toEqual(complexitySymbols(variant, language));
          for (const meaning of Object.values(meanings!)) expect(meaning.trim().length).toBeGreaterThan(8);
        }
      }
    }
  });

  it('recognizes nested expressions, powers, aliases, and named notation without treating prose as variables', () => {
    expect(complexitySymbols({ timeComplexity: 'Constructor: O(n + K log(K + 1)); query: O(|s| + |t|)', spaceComplexity: 'O(n²)' }, 'javascript')).toEqual(['n', 'K', '|s|', '|t|']);
    expect(complexitySymbols({ timeComplexity: 'O(k × C(n, k) + Cₙ + V × α(V))', spaceComplexity: 'O(total tweets + total follow relationships)' }, 'javascript')).toEqual(['Cₙ', 'C(n, k)', 'α', 'k', 'n', 'V']);
    expect(complexitySymbols({ timeComplexity: 'O(1)', spaceComplexity: 'O(1) for a fixed alphabet' }, 'javascript')).toEqual([]);
  });

  it('uses the actual quantities rather than a generic definition for n or L', () => {
    expect(solutionMap[14].complexityVariables).toMatchObject({ N: 'Number of input strings', L: 'Number of characters in the shortest string' });
    expect(solutionMap[200].complexityVariables?.m).toMatch(/rows/);
    expect(solutionMap[200].complexityVariables?.n).toMatch(/columns/);
    expect(solutionMap[127].complexityVariables?.L).toMatch(/characters in each word/);
    expect(solutionMap[242].complexityVariables?.m).toBeUndefined();
    expect(solutionMap[242].pythonComplexityVariables?.m).toBe('Number of characters in t');
    expect(solutionMap[232].timeComplexityBreakdown?.variables).toContain('n = total queued values');
  });
});

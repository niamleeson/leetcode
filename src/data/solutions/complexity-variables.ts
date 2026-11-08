import type { ProblemSolution, SolutionFollowUp, TimeComplexityBreakdown } from './types';
import { complexityVariablesHead } from './complexity-variables-head';
import { complexityVariablesTail } from './complexity-variables-tail';

const definitions = { ...complexityVariablesHead, ...complexityVariablesTail };
type Complexity = Pick<ProblemSolution, 'timeComplexity' | 'spaceComplexity' | 'pythonTimeComplexity' | 'timeComplexityBreakdown' | 'pythonTimeComplexityBreakdown'>;

function breakdownExpressions(breakdown: TimeComplexityBreakdown | undefined): string[] {
  return breakdown ? [breakdown, ...breakdown.operations ?? []].flatMap(calculation => [
    ...calculation.phases.map(phase => phase.cost), ...calculation.simplifications,
  ]) : [];
}

export function complexitySymbols(solution: Complexity, language: 'javascript' | 'python'): string[] {
  const time = language === 'python' ? solution.pythonTimeComplexity ?? solution.timeComplexity : solution.timeComplexity;
  const breakdown = language === 'python' ? solution.pythonTimeComplexityBreakdown ?? solution.timeComplexityBreakdown : solution.timeComplexityBreakdown;
  const symbols = new Set<string>();
  for (const text of [time, solution.spaceComplexity, ...breakdownExpressions(breakdown)]) {
    // Read balanced O(...) expressions so explanatory prose is not mistaken
    // for variables, and nested log/min/max arguments remain intact.
    for (const match of text.matchAll(/\bO\s*\(/g)) {
      const start = match.index! + match[0].length;
      let end = start, depth = 1;
      while (end < text.length && depth) {
        if (text[end] === '(') depth++;
        if (text[end] === ')') depth--;
        if (depth) end++;
      }
      let expression = text.slice(start, end)
        .replace(/total follow relationships|total tweets|total characters inserted|total characters in words|dictionary characters|row conditions|column conditions|number of distinct primes/g, ' ')
        .replace(/Cₙ/g, symbol => { symbols.add(symbol); return ' '; })
        .replace(/C\(n,\s*k\)/g, () => { symbols.add('C(n, k)'); return '(n, k)'; })
        .replace(/\|[a-zA-Z][a-zA-Z0-9_]*\|/g, symbol => { symbols.add(symbol); return ' '; });
      if (expression.includes('α')) symbols.add('α');
      for (const symbol of expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) ?? []) {
        if (!['log', 'ln', 'min', 'max', 'sqrt'].includes(symbol)) symbols.add(symbol);
      }
    }
  }
  return [...symbols];
}

function legend(solution: Complexity, language: 'javascript' | 'python', meanings: Record<string, string>, id: number): Record<string, string> {
  return Object.fromEntries(complexitySymbols(solution, language).map(symbol => {
    if (!meanings[symbol]) throw new Error(`Missing ${language} complexity meaning for #${id}: ${symbol}`);
    return [symbol, meanings[symbol]];
  }));
}

export function withComplexityVariables(solution: ProblemSolution): ProblemSolution {
  const meanings = definitions[solution.id];
  if (!meanings) return solution;
  const reviewed = solution.id === 232 && solution.timeComplexityBreakdown ? {
    ...solution,
    timeComplexityBreakdown: { ...solution.timeComplexityBreakdown, variables: 'n = total queued values; a transfer moves at most n values from inputStack. q = total calls.' },
  } : solution;
  const annotate = <T extends Complexity>(value: T): T & Pick<ProblemSolution, 'complexityVariables' | 'pythonComplexityVariables'> => ({
    ...value,
    complexityVariables: legend(value, 'javascript', meanings, solution.id),
    pythonComplexityVariables: legend(value, 'python', meanings, solution.id),
  });
  return {
    ...annotate(reviewed),
    ...(reviewed.followUp ? { followUp: annotate(reviewed.followUp) as SolutionFollowUp } : {}),
  };
}

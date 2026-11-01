import { ProblemSolution, TimeComplexityCalculation } from './types';

export type Runtime = Pick<ProblemSolution,
  'timeComplexity' | 'timeComplexityBreakdown' | 'pythonTimeComplexity' | 'pythonTimeComplexityBreakdown'>;
type Phases = [label: string, cost: string][];
type Reductions = [string, ...string[]];

export function calculation(title: string, phases: Phases, simplifications: Reductions, note: string): TimeComplexityCalculation {
  return { title, phases: phases.map(([label, cost]) => ({ label, cost })), simplifications, note };
}

export function runtime(variables: string, phases: Phases, simplifications: Reductions, note: string): Runtime {
  return {
    timeComplexity: simplifications[simplifications.length - 1],
    timeComplexityBreakdown: { variables, ...calculation('', phases, simplifications, note) },
  };
}

export function operations(variables: string, calculations: [TimeComplexityCalculation, ...TimeComplexityCalculation[]]): Runtime {
  const [first, ...rest] = calculations;
  return {
    timeComplexity: calculations.map(c => `${c.title}: ${c.simplifications[c.simplifications.length - 1]}`).join('; '),
    timeComplexityBreakdown: { variables, ...first, operations: rest },
  };
}

export function withPython(javascript: Runtime, python: Runtime): Runtime {
  return { ...javascript, pythonTimeComplexity: python.timeComplexity, pythonTimeComplexityBreakdown: python.timeComplexityBreakdown };
}

import { describe, expect, it } from 'vitest';
import { solutionMap } from '../solutions';
import { orangeCodeLines, treeCodeLines } from './traversal-code';
import { orangeTraceExamples, treeTraceExamples } from './traversals';

function statements(code: string, lines: number[]) {
  return lines.map(line => code.split('\n')[line - 1].trim());
}

describe('walkthrough source mapping', () => {
  it('maps every step in every example to the actual displayed source', () => {
    for (const example of treeTraceExamples) {
      for (const step of example.steps) expect(treeCodeLines(step, solutionMap[102].jsCode!).length).toBeGreaterThan(0);
    }
    for (const example of orangeTraceExamples) {
      for (const step of example.steps) expect(orangeCodeLines(step, solutionMap[994].jsCode!).length).toBeGreaterThan(0);
    }
  });

  it('highlights only the child condition on a tree no-op', () => {
    const code = solutionMap[102].jsCode!;
    for (const step of treeTraceExamples[0].steps.filter(step => step.action === 'child')) {
      const selected = statements(code, treeCodeLines(step, code));
      expect(selected).toEqual(step.noop
        ? [`if (node.${step.checked!.side}) {`]
        : [`if (node.${step.checked!.side}) {`, `queue.push(node.${step.checked!.side});`]);
    }
    const emptyReturn = treeTraceExamples[2].steps[1];
    expect(statements(code, treeCodeLines(emptyReturn, code))).toEqual(['if (!root) {', 'return [];']);
  });

  it('separates failed neighbor checks, rotting, and enqueueing', () => {
    const code = solutionMap[994].jsCode!;
    const steps = orangeTraceExamples[0].steps;
    const outside = steps.find(step => step.title.includes('outside grid'))!;
    expect(statements(code, orangeCodeLines(outside, code))).toEqual([
      'const inBounds = neighborRow >= 0 && neighborRow < rows &&',
      'neighborCol >= 0 && neighborCol < cols;',
      'if (inBounds && grid[neighborRow][neighborCol] === 1) {',
    ]);
    const alreadyRotten = steps.find(step => step.action === 'neighbor' && step.title.includes('already rotten'))!;
    expect(statements(code, orangeCodeLines(alreadyRotten, code))).toEqual(['if (inBounds && grid[neighborRow][neighborCol] === 1) {']);
    const rot = steps.find(step => step.action === 'neighbor' && !step.noop)!;
    expect(statements(code, orangeCodeLines(rot, code))).toEqual(['if (inBounds && grid[neighborRow][neighborCol] === 1) {', 'grid[neighborRow][neighborCol] = 2;', 'freshCount--;']);
    const enqueue = steps.find(step => step.action === 'enqueue')!;
    expect(statements(code, orangeCodeLines(enqueue, code))).toEqual(['queue.push([neighborRow, neighborCol]);']);
  });

  it('follows source lines when comments are inserted above the solution', () => {
    const code = solutionMap[102].jsCode!;
    const step = treeTraceExamples[0].steps.find(step => step.action === 'dequeue')!;
    expect(treeCodeLines(step, `// Added context\n\n${code}`)).toEqual(treeCodeLines(step, code).map(line => line + 2));
  });
});

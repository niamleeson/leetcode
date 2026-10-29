import { describe, expect, it } from 'vitest';
import { solutionMap } from '../solutions';
import { buildOrangeSteps, buildTreeTrace, orangeTraceExamples, treeTraceExamples } from './traversals';

describe('tree traversal steps', () => {
  it('checks both children of every node, including null children', () => {
    const { steps } = buildTreeTrace([1, 2, 3]);
    const checks = steps.filter(step => step.action === 'child');
    expect(checks.map(step => [step.current, step.checked?.side, step.checked?.child, !!step.noop])).toEqual([
      [0, 'left', 1, false], [0, 'right', 2, false],
      [1, 'left', null, true], [1, 'right', null, true],
      [2, 'left', null, true], [2, 'right', null, true],
    ]);
    for (let stepIndex = 1; stepIndex < steps.length; stepIndex++) {
      if (!steps[stepIndex].noop) continue;
      expect(steps[stepIndex].queue).toEqual(steps[stepIndex - 1].queue);
      expect(steps[stepIndex].level).toEqual(steps[stepIndex - 1].level);
      expect(steps[stepIndex].result).toEqual(steps[stepIndex - 1].result);
    }
    expect(steps.filter(step => step.action === 'level-start').map(step => step.remaining)).toEqual([1, 2]);
    expect(steps[0].queue).toEqual([]);
    expect(steps[steps.length - 1].result).toEqual([[1], [2, 3]]);
  });

  it('keeps repeated node values distinct', () => {
    const { steps } = buildTreeTrace([1, 1, 1]);
    expect(steps.filter(step => step.action === 'dequeue').map(step => step.current)).toEqual([0, 1, 2]);
    expect(steps[steps.length - 1].result).toEqual([[1], [1, 1]]);
  });

  it('agrees with the displayed JavaScript solution for every tree example', () => {
    const solve = new Function(`${solutionMap[102].jsCode}; return levelOrder;`)();
    for (const example of treeTraceExamples) {
      type InputNode = { val: number; left: InputNode | null; right: InputNode | null };
      const inputs: InputNode[] = example.nodes.map(node => ({ val: node.value, left: null, right: null }));
      example.nodes.forEach(node => {
        inputs[node.id].left = node.left === null ? null : inputs[node.left];
        inputs[node.id].right = node.right === null ? null : inputs[node.right];
      });
      expect(example.steps[example.steps.length - 1].result).toEqual(solve(inputs[0] ?? null));
    }
  });
});

describe('rotting oranges traversal steps', () => {
  it('checks every neighbor in code order and preserves state on every no-op', () => {
    const steps = buildOrangeSteps([[2, 1], [1, 1]]);
    const offsets = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      const step = steps[stepIndex];
      if (step.action === 'dequeue') {
        const following = steps.slice(stepIndex + 1);
        const nextPop = following.findIndex(frame => frame.action === 'dequeue');
        const checks = (nextPop < 0 ? following : following.slice(0, nextPop)).filter(frame => frame.action === 'neighbor');
        expect(checks.map(frame => frame.checked)).toEqual(offsets.map(([row, column]) => [step.current![0] + row, step.current![1] + column]));
      }
      if (step.noop) {
        const previous = steps[stepIndex - 1];
        expect([step.grid, step.queue, step.fresh, step.elapsed]).toEqual([previous.grid, previous.queue, previous.fresh, previous.elapsed]);
      }
    }
    expect(steps.filter(step => step.action === 'neighbor')).toHaveLength(16);
    expect(steps.filter(step => step.action === 'neighbor' && step.noop)).toHaveLength(13);
    expect(steps[0].grid).toEqual([[2, 1], [1, 1]]);
    expect(steps[0].queue).toEqual([]);
  });

  it('defers newly rotten cells to the next round and includes the final no-op round', () => {
    const steps = buildOrangeSteps([[2, 1], [1, 1]]);
    expect(steps.filter(step => step.action === 'dequeue').map(step => [step.current, step.elapsed])).toEqual([
      [[0, 0], 0], [[1, 0], 1], [[0, 1], 1], [[1, 1], 2],
    ]);
    const last = steps[steps.length - 1];
    expect([last.answer, last.elapsed, last.fresh]).toEqual([2, 3, 0]);
  });

  it('matches the JavaScript solution for all examples without mutating their inputs', () => {
    const solve = new Function(`${solutionMap[994].jsCode}; return orangesRotting;`)();
    for (const example of orangeTraceExamples) {
      const original = example.grid.map(row => [...row]);
      const steps = buildOrangeSteps(example.grid);
      expect(steps[steps.length - 1].answer).toBe(solve(example.grid.map(row => [...row])));
      expect(example.grid).toEqual(original);
    }
  });

  it('shows empty-cell no-ops and the no-fresh early return', () => {
    const steps = buildOrangeSteps([[0, 2]]);
    expect(steps[1].noop).toBe(true);
    expect(steps[steps.length - 1].answer).toBe(0);
    expect(steps.some(step => step.action === 'dequeue')).toBe(false);
  });
});

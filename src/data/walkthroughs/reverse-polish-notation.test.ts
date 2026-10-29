import { describe, expect, it } from 'vitest';
import { buildRpnSteps, rpnExamples } from './reverse-polish-notation';

describe('reverse Polish notation walkthrough', () => {
  it('shows each pop separately and preserves earlier stack states', () => {
    const steps = buildRpnSteps(rpnExamples[0].tokens);
    const addition = steps.filter(step => step.tokenIndex === 2);

    expect(steps[2].stack.map(entry => entry.value)).toEqual([2, 1]);
    expect(addition.map(step => step.action)).toEqual(['pop-right', 'pop-left', 'result']);
    expect(addition.map(step => step.stack.map(entry => entry.value))).toEqual([[2], [], [3]]);
    expect(addition[0].right?.value).toBe(1);
    expect(addition[0].left).toBeUndefined();
    expect(addition[1].left?.value).toBe(2);

    const repeatedValues = steps.find(step => step.tokenIndex === 3)!;
    expect(repeatedValues.stack.map(entry => entry.value)).toEqual([3, 3]);
    expect(new Set(repeatedValues.stack.map(entry => entry.id)).size).toBe(2);
    expect(steps[steps.length - 1].result?.value).toBe(9);
  });

  it('uses the correct operand order and truncates negative division toward zero', () => {
    const steps = buildRpnSteps(rpnExamples[2].tokens);
    const division = steps.find(step => step.operator === '/' && step.action === 'result')!;
    expect([division.left?.value, division.right?.value, division.result?.value]).toEqual([7, -3, -2]);
    expect(division.detail).toContain('toward zero');
    expect(steps[steps.length - 1].result?.value).toBe(-4);
  });

  it('keeps untouched values in place while evaluating a nested expression', () => {
    const steps = buildRpnSteps(rpnExamples[1].tokens);
    const division = steps.filter(step => step.operator === '/');
    expect(division.map(step => step.stack.map(entry => entry.value))).toEqual([[4, 13], [4], [4, 2]]);
    expect(steps[steps.length - 1].result?.value).toBe(6);
  });
});

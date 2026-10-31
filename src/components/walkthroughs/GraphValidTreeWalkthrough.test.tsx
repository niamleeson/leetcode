import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { ExecutionPlayer } from './ExecutionWalkthrough';
import { ExecutionTrace, materialize, objectFor } from '../../data/walkthroughs/execution';
import { solutionMap } from '../../data/solutions';

const trace = JSON.parse(readFileSync('src/data/walkthroughs/generated/261.json', 'utf8')) as ExecutionTrace;
beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('keeps graph positions, DFS state, and code highlights accurate throughout all six examples', () => {
  expect(trace.code).toBe(solutionMap[261].jsCode);
  expect(trace.examples).toHaveLength(6);
  render(<ExecutionPlayer trace={trace} />);
  for (const [exampleIndex, example] of trace.examples.entries()) {
    fireEvent.change(screen.getByRole('combobox'), { target: { value: exampleIndex } });
    const positions = new Map<string, string>();
    for (const [index, step] of example.steps.entries()) {
      fireEvent.change(screen.getByRole('slider'), { target: { value: index } });
      expect([...document.querySelectorAll('[aria-current="step"]')].map(line => Number(line.getAttribute('data-line')))).toEqual(step.lines || [step.line]);
      const { heap } = materialize(example.steps, index);
      const visited = objectFor(step.state.visited, heap)?.items || [];
      const pending = (objectFor(step.state.stack, heap)?.items || []).map(pair => objectFor(pair, heap)!.items![0]);
      const nodes = [...document.querySelectorAll('[data-node-key]')];
      expect(nodes).toHaveLength(example.input[0] as number);
      for (const node of nodes) {
        const key = node.getAttribute('data-node-key')!, value = Number(key);
        const position = node.getAttribute('transform')!;
        if (positions.has(key)) expect(position).toBe(positions.get(key));
        positions.set(key, position);
        expect(node.classList.contains('is-visited')).toBe(visited.includes(value));
        expect(node.classList.contains('is-queued')).toBe(pending.includes(value));
        for (const name of ['node', 'parent', 'neighbor']) {
          if (step.state[name] === value) expect(node.querySelector('.execution-node-pointer')?.textContent).toContain(name);
        }
      }
      if (step.state.stack !== undefined && visited.length) expect(screen.getByText('Dashed: in stack')).toBeTruthy();
    }
    expect(screen.getByLabelText('Final result').textContent).toContain(String(example.expected));
  }
});

it('records parent skips, cycle detection, connectivity checks, and marking before every push', () => {
  let parentSkips = 0, cycles = 0, connectivityChecks = 0;
  for (const example of trace.examples) {
    const popped = new Set<number>();
    for (const [index, step] of example.steps.entries()) {
      const { heap } = materialize(example.steps, index);
      const visited = objectFor(step.state.visited, heap)?.items || [];
      if (step.kind === 'operation' && step.label === 'stack.push([neighbor, node])') {
        expect(visited).toContain(step.state.neighbor);
        const stack = objectFor(step.state.stack, heap)!.items!;
        expect(objectFor(stack[stack.length - 1], heap)!.items).toEqual([step.state.neighbor, step.state.node]);
      }
      if (step.kind === 'operation' && step.label === 'stack.pop()') {
        const [node] = objectFor(step.value, heap)!.items! as number[];
        expect(popped.has(node)).toBe(false);
        expect(visited).toContain(node);
        popped.add(node);
      }
      if (step.kind === 'continue') {
        expect(step.state.neighbor).toBe(step.state.parent);
        parentSkips++;
      }
      if (step.kind === 'return' && step.label === 'return false;') {
        expect(step.state.neighbor).not.toBe(step.state.parent);
        expect(visited).toContain(step.state.neighbor);
        cycles++;
      }
      if (step.kind === 'return' && step.label === 'return visited.size === n;') {
        expect(objectFor(step.state.stack, heap)!.items).toHaveLength(0);
        expect(visited.length === example.input[0]).toBe(example.expected);
        connectivityChecks++;
      }
    }
  }
  expect(parentSkips).toBeGreaterThan(0);
  expect(cycles).toBe(1);
  expect(connectivityChecks).toBe(5);
});

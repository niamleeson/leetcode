import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import ExecutionWalkthrough from './ExecutionWalkthrough';
import { ExecutionTrace, materialize, objectFor } from '../../data/walkthroughs/execution';
import { solutionMap } from '../../data/solutions';

const trace = JSON.parse(readFileSync('src/data/walkthroughs/generated/1462.json', 'utf8')) as ExecutionTrace;
beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('loads the BFS primary with accurate highlights, queue membership, and a separate reachability row per start', async () => {
  const solution = solutionMap[1462];
  expect(trace.code).toBe(solution.jsCode);
  expect(trace.examples).toHaveLength(6);
  render(<ExecutionWalkthrough id={1462} code={solution.jsCode!} />);
  await screen.findByRole('slider');

  for (const [exampleIndex, example] of trace.examples.entries()) {
    fireEvent.change(screen.getByRole('combobox'), { target: { value: exampleIndex } });
    const positions = new Map<string, string>();
    for (const [index, step] of example.steps.entries()) {
      fireEvent.change(screen.getByRole('slider'), { target: { value: index } });
      expect([...document.querySelectorAll('[aria-current="step"]')].map(line => Number(line.getAttribute('data-line')))).toEqual(step.lines || [step.line]);
      const { heap } = materialize(example.steps, index);
      const queue = objectFor(step.state.queue, heap)?.items || [];
      const nodes = [...document.querySelectorAll('[data-node-key]')];
      expect(nodes).toHaveLength(example.input[0] as number);
      for (const node of nodes) {
        const key = node.getAttribute('data-node-key')!, value = Number(key);
        const position = node.getAttribute('transform')!;
        if (positions.has(key)) expect(position).toBe(positions.get(key));
        positions.set(key, position);
        expect(node.classList.contains('is-queued')).toBe(queue.includes(value));
        for (const name of ['prerequisite', 'start', 'course', 'next']) {
          if (step.state[name] === value) expect(node.querySelector('.execution-node-pointer')?.textContent).toContain(name);
        }
      }
      if (step.label === 'reachable[start][next] = true;') {
        const panel = screen.getByRole('group', { name: 'reachable' });
        const rows = within(panel).getAllByRole('row');
        expect(rows).toHaveLength(example.input[0] as number);
        rows.forEach(row => expect(within(row).getAllByRole('cell')).toHaveLength(example.input[0] as number));
        expect(panel.querySelector(`[title^="[${step.state.start}][${step.state.next}]"]`)?.textContent).toContain('true');
      }
    }
    expect(screen.getByLabelText('Final result').textContent).toContain(JSON.stringify(example.expected));
  }
},15000);

it('marks before enqueueing, removes courses from the front once per start, and records duplicate-path skips', () => {
  let enqueued = 0, dequeued = 0, processed = 0, skipped = 0;
  for (const example of trace.examples) {
    const seen = new Set<string>();
    for (const [index, step] of example.steps.entries()) {
      const { heap } = materialize(example.steps, index);
      const rows = objectFor(step.state.reachable, heap)?.items || [];
      const row = typeof step.state.start === 'number' ? objectFor(rows[step.state.start], heap)?.items || [] : [];
      if (step.kind === 'operation' && step.label === 'queue.push(next)') {
        expect(row[step.state.next as number]).toBe(true);
        const queue = objectFor(step.state.queue, heap)!.items!;
        expect(queue[queue.length - 1]).toBe(step.state.next);
        expect(new Set(queue).size).toBe(queue.length);
        enqueued++;
      }
      if (step.kind === 'operation' && step.label === 'queue.shift()') {
        const previous = example.steps[index - 1];
        const previousHeap = materialize(example.steps, index - 1).heap;
        const previousQueue = objectFor(previous.state.queue, previousHeap)!.items!;
        expect(step.value).toBe(previousQueue[0]);
        expect(objectFor(step.state.queue, heap)!.items).toEqual(previousQueue.slice(1));
        dequeued++;
      }
      if (step.kind === 'statement' && step.label === 'const course = queue.shift();') {
        const queue = objectFor(step.state.queue, heap)!.items!;
        expect(queue).not.toContain(step.state.course);
        expect(step.state.course).toBe(example.steps[index - 1].value);
        const key = `${step.state.start}/${step.state.course}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
        processed++;
      }
      if (step.kind === 'continue') {
        expect(row[step.state.next as number]).toBe(true);
        skipped++;
      }
    }
  }
  expect(enqueued).toBeGreaterThan(0);
  expect(dequeued).toBe(processed);
  expect(processed).toBeGreaterThan(enqueued);
  expect(skipped).toBeGreaterThan(0);
});

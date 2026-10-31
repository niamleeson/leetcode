import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import FollowUpSolution from '../FollowUpSolution';
import { ExecutionTrace, materialize, objectFor } from '../../data/walkthroughs/execution';
import { solutionMap } from '../../data/solutions';

const trace = JSON.parse(readFileSync('src/data/walkthroughs/generated/1462-bfs.json', 'utf8')) as ExecutionTrace;
beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('loads the BFS alternative with accurate highlights, queue membership, and a separate reachability row per start', async () => {
  const solution = solutionMap[1462].followUp!;
  expect(trace.code).toBe(solution.jsCode);
  expect(solution.walkthroughVariant).toBe('bfs');
  expect(trace.examples).toHaveLength(6);
  render(<FollowUpSolution solution={solution} problemId={1462} language="javascript" />);
  await screen.findByRole('slider');
  expect(screen.getByRole('heading', { name: 'Alternative: BFS from each course' })).toBeTruthy();

  for (const [exampleIndex, example] of trace.examples.entries()) {
    fireEvent.change(screen.getByRole('combobox'), { target: { value: exampleIndex } });
    const positions = new Map<string, string>();
    for (const [index, step] of example.steps.entries()) {
      fireEvent.change(screen.getByRole('slider'), { target: { value: index } });
      expect([...document.querySelectorAll('[aria-current="step"]')].map(line => Number(line.getAttribute('data-line')))).toEqual(step.lines || [step.line]);
      const { heap } = materialize(example.steps, index);
      const queue = objectFor(step.state.queue, heap)?.items || [];
      const head = typeof step.state.head === 'number' ? step.state.head : 0;
      const nodes = [...document.querySelectorAll('[data-node-key]')];
      expect(nodes).toHaveLength(example.input[0] as number);
      for (const node of nodes) {
        const key = node.getAttribute('data-node-key')!, value = Number(key);
        const position = node.getAttribute('transform')!;
        if (positions.has(key)) expect(position).toBe(positions.get(key));
        positions.set(key, position);
        expect(node.classList.contains('is-queued')).toBe(queue.slice(head).includes(value));
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
});

it('marks before enqueueing, processes each course once per start, and records duplicate-path skips', () => {
  let enqueued = 0, processed = 0, skipped = 0;
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
      if (step.kind === 'statement' && step.label === 'const course = queue[head++];') {
        const queue = objectFor(step.state.queue, heap)!.items!;
        expect(queue[(step.state.head as number) - 1]).toBe(step.state.course);
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
  expect(processed).toBeGreaterThan(enqueued);
  expect(skipped).toBeGreaterThan(0);
});

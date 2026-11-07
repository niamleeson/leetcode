import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import ExecutionWalkthrough, { ExecutionPlayer, hasExecutionWalkthrough } from './ExecutionWalkthrough';
import { ExecutionTrace, formatTraceResult } from '../../data/walkthroughs/execution';
import { neetcodeTopics } from '../../data/neetcode250';
import { solutionMap } from '../../data/solutions';

const problems = neetcodeTopics.flatMap(topic => topic.problems);
const solutions = problems.flatMap(problem => {
  const solution = solutionMap[problem.id];
  const entries = [{ id: problem.id, key: String(problem.id), variant: undefined as string | undefined, code: solution.code }];
  if (solution.followUp?.walkthroughVariant) entries.push({ id: problem.id, key: `${problem.id}-${solution.followUp.walkthroughVariant}`, variant: solution.followUp.walkthroughVariant, code: solution.followUp.code });
  return entries;
});
const trace = (key: string) => JSON.parse(readFileSync(`src/data/walkthroughs/generated-python/${key}.json`, 'utf8')) as ExecutionTrace;
const codeText = () => [...document.querySelectorAll('.traversal-line-content')].map(line => line.textContent).join('\n');

beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('provides Python recordings for every NeetCode 250 problem and each recorded alternative', () => {
  expect(problems).toHaveLength(250);
  for (const solution of solutions) expect(hasExecutionWalkthrough(solution.id, solution.variant, 'python'), solution.key).toBe(true);
  expect(hasExecutionWalkthrough(1, 'missing', 'python')).toBe(false);
});

it.each(solutions)('renders Python $key with exact code, debugger values and line highlighting through the result', ({ key, code }) => {
  const data = trace(key);
  expect(data.language).toBe('python');
  expect(data.code).toBe(code);
  render(<ExecutionPlayer trace={data}/>);
  const example = data.examples[0];
  expect(screen.getByLabelText('Walkthrough Python code')).toBeTruthy();
  expect(codeText()).toBe(code);
  for (const index of [0, Math.floor(example.steps.length / 2), example.steps.length - 1]) {
    fireEvent.change(screen.getByRole('slider'), { target: { value: index } });
    expect([...document.querySelectorAll('[aria-current="step"]')].map(element => Number(element.getAttribute('data-line')))).toEqual(example.steps[index].lines ?? [example.steps[index].line]);
    expect(screen.getByRole('region', { name: 'Debugger variables' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Local variables' })).toBeTruthy();
  }
  expect(screen.getByLabelText('Final result').textContent).toBe(`Result${formatTraceResult(example.result, 'python')}`);
  expect((screen.getByRole('button', { name: 'Next →' }) as HTMLButtonElement).disabled).toBe(true);
});

it('switches languages without showing stale code or carrying the previous playback position', async () => {
  const solution = solutionMap[1];
  const page = render(<ExecutionWalkthrough id={1} code={solution.jsCode!}/>);
  await screen.findByRole('slider');
  fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
  expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('1');
  page.rerender(<ExecutionWalkthrough id={1} code={solution.code} language="python"/>);
  expect(screen.queryByLabelText('Walkthrough JavaScript code')).toBeNull();
  expect(screen.getByLabelText('Walkthrough Python code')).toBeTruthy();
  expect(codeText()).toBe(solution.code);
  await screen.findByRole('slider');
  expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('0');
  fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
  page.rerender(<ExecutionWalkthrough id={1} code={solution.jsCode!}/>);
  expect(screen.queryByLabelText('Walkthrough Python code')).toBeNull();
  await screen.findByRole('slider');
  expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('0');
  expect(codeText()).toBe(solution.jsCode);
});

it('rewinds actual Python snapshots, resets, and selects the next example independently', () => {
  const data = trace('1');
  render(<ExecutionPlayer trace={data}/>);
  const inspector = () => screen.getByRole('region', { name: 'Debugger variables' }).textContent;
  const initial = inspector();
  const index = data.examples[0].steps.findIndex(step => 'seen' in step.state);
  expect(index).toBeGreaterThan(0);
  fireEvent.change(screen.getByRole('slider'), { target: { value: index } });
  const selected = inspector();
  expect(selected).not.toBe(initial);
  fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(inspector()).toBe(selected);
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(inspector()).toBe(initial);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 1 } });
  expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('0');
  fireEvent.change(screen.getByRole('slider'), { target: { value: data.examples[1].steps.length - 1 } });
  expect(screen.getByLabelText('Final result').textContent).toContain(formatTraceResult(data.examples[1].result, 'python'));
});

it('shows the actual Python recursion stack and return value for a recursive tree walk', () => {
  const data = trace('104');
  const index = data.examples[0].steps.findIndex(step => step.stack.length > 2 && step.kind === 'return');
  expect(index).toBeGreaterThan(0);
  render(<ExecutionPlayer trace={data}/>);
  fireEvent.change(screen.getByRole('slider'), { target: { value: index } });
  expect([...screen.getByLabelText('Call stack').children].map(element => element.textContent)).toEqual(data.examples[0].steps[index].stack);
  expect(within(screen.getByRole('region', { name: 'Debugger variables' })).getByRole('region', { name: 'Return value' })).toBeTruthy();
});

it('does not carry a Python lock neighbor into the next dequeued state before it is generated', () => {
  const data = trace('752');
  const steps = data.examples[0].steps;
  const index = steps.findIndex((step, i) => i > 0 && step.label.includes('popleft()') && step.state.state !== steps[i - 1].state.state && 'new_state' in step.state);
  expect(index).toBeGreaterThan(0);
  render(<ExecutionPlayer trace={data}/>);
  fireEvent.change(screen.getByRole('slider'), { target: { value: index } });
  const graph = screen.getByRole('img', { name: 'Graph from Current lock state and generated neighbors' });
  expect(graph.querySelectorAll('[data-node-key]')).toHaveLength(1);
  expect(graph.querySelectorAll('[data-from]')).toHaveLength(0);
  expect(graph.textContent).toContain(String(steps[index].state.state));
  const generated = steps.findIndex((step, i) => i > index && step.label.trim().startsWith('new_state ='));
  fireEvent.change(screen.getByRole('slider'), { target: { value: generated } });
  expect(graph.querySelectorAll('[data-node-key]')).toHaveLength(2);
  fireEvent.change(screen.getByRole('slider'), { target: { value: index } });
  expect(graph.querySelectorAll('[data-node-key]')).toHaveLength(1);
});

it('refuses a recording when the displayed Python source does not match', async () => {
  render(<ExecutionWalkthrough id={1} code={`${solutionMap[1].code}\n# edited`} language="python"/>);
  expect(await screen.findByText('The walkthrough could not load.')).toBeTruthy();
  expect(screen.queryByRole('slider')).toBeNull();
  expect(codeText()).toContain('# edited');
});

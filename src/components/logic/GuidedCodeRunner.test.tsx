import React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GuidedCodeRunner from './GuidedCodeRunner';
import type { LogicProblem } from '../../data/logic/types';
import type { LogicRunResult } from './runtime/types';

const mocks = vi.hoisted(() => ({ create: vi.fn(), run: vi.fn(), stop: vi.fn(), dispose: vi.fn(), createJs: vi.fn(), runJs: vi.fn(), stopJs: vi.fn(), disposeJs: vi.fn() }));
vi.mock('./runtime/pythonRunner', () => ({ createPythonRunner: () => {
  mocks.create(); return { run: mocks.run, stop: mocks.stop, dispose: mocks.dispose };
} }));
vi.mock('./runtime/javascriptRunner', () => ({ createJavaScriptRunner: () => {
  mocks.createJs(); return { run: mocks.runJs, stop: mocks.stopJs, dispose: mocks.disposeJs };
} }));
vi.mock('../CodeBlock', () => ({ default: ({ code, language }: { code: string; language: string }) => <pre data-testid="highlighted-code" data-language={language}>{code}</pre> }));

const code = 'def twoSum(nums, target):\n    return [0, 1]';
const problem: LogicProblem = {
  id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays & Hashing', description: 'Return two distinct indices.',
  examples: [], parameters: [], interfaces: [], starter: 'def twoSum(nums, target):\n    pass',
  fixtures: [
    { name: 'First case', entry: 'twoSum', args: [[2, 7], 9], expected: [0, 1] },
    { name: 'Different indices', entry: 'twoSum', args: [[3, 2, 4], 6], expected: [1, 2] },
  ], validation: { kind: 'practice-cases', count: 2, adversarialCount: 1 },
};
const result: LogicRunResult = { passed: 1, total: 2, tests: problem.fixtures.map((fixture, index) => ({
  name: fixture.name, input: fixture.args, expected: fixture.expected, actual: [0, 1], passed: index === 0,
  trace: [{ line: 2, kind: 'return', functionName: 'twoSum', locals: { nums: index ? '[3, 2, 4]' : '[2, 7]', target: index ? '6' : '9' }, stack: ['twoSum'], value: '[0, 1]' }],
  traceTruncated: false, executionEvents: 2, stdout: '',
})) };
beforeEach(() => { vi.resetAllMocks(); mocks.run.mockResolvedValue(result); mocks.runJs.mockResolvedValue(result); });
afterEach(cleanup);

describe('completed guided code', () => {
  it('shows the completed source without creating or running Python until Run is pressed', async () => {
    render(<GuidedCodeRunner problem={problem} code={code} />);
    expect((await screen.findByTestId('highlighted-code')).textContent).toBe(code);
    expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.run).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    await screen.findByText('1 / 2 practice tests passed');
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.run.mock.calls[0][0]).toEqual({ problemId: 1, code, fixtures: problem.fixtures });
    expect(screen.getByRole('button', { name: 'Different indices — failed' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('pairs the actual source line and variables, resetting the debugger when the case changes', async () => {
    render(<GuidedCodeRunner problem={problem} code={code} />);
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Step through' }));
    expect(screen.getByLabelText('Current executed statement').textContent).toBe('return [0, 1]');
    expect(screen.getByLabelText('Python variables').textContent).toContain('nums[3, 2, 4]');
    fireEvent.click(screen.getByRole('button', { name: 'First case — passed' }));
    expect(screen.queryByLabelText('Current executed statement')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Step through' }));
    expect(screen.getByLabelText('Python variables').textContent).toContain('nums[2, 7]');
  });

  it('shows loading/running status, stops, and can retry', async () => {
    let rejectRun: (error: Error) => void = () => {};
    let onStatus: (status: 'loading' | 'running') => void = () => {};
    mocks.run.mockImplementationOnce((_request, status) => { onStatus = status; return new Promise((_resolve, reject) => { rejectRun = reject; }); });
    mocks.stop.mockImplementation(() => { const error = new Error('Stopped'); error.name = 'AbortError'; rejectRun(error); });
    render(<GuidedCodeRunner problem={problem} code={code} />);
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    expect(screen.getByText(/Starting Python/)).toBeTruthy();
    act(() => onStatus('running'));
    expect(screen.getByText('Running the completed code…')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Run stopped');
    expect(mocks.stop).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    await screen.findByText('1 / 2 practice tests passed');
    expect(mocks.create).toHaveBeenCalledOnce();
  });

  it('disposes a pending run on source changes and ignores its stale result', async () => {
    let resolveRun: (value: LogicRunResult) => void = () => {};
    mocks.run.mockImplementationOnce(() => new Promise(resolve => { resolveRun = resolve; }));
    const view = render(<GuidedCodeRunner problem={problem} code={code} />);
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    view.rerender(<GuidedCodeRunner problem={problem} code={code + '\n# revised'} />);
    expect(mocks.dispose).toHaveBeenCalledOnce();
    await act(async () => resolveRun(result));
    expect(screen.queryByRole('region', { name: 'Test results' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    await screen.findByText('1 / 2 practice tests passed');
    view.unmount();
    expect(mocks.dispose).toHaveBeenCalledTimes(2);
  });

  it('aligns design calls with expected and actual outputs and reports source errors', async () => {
    const design: LogicProblem = { ...problem, id: 155, fixtures: [{ name: 'Stack calls', entry: 'MinStack', args: [], operations: [['push', [5]], ['getMin', []]], expected: [null, null, 5] }] };
    mocks.run.mockResolvedValue({ passed: 0, total: 1, tests: [{ ...result.tests[0], name: 'Stack calls', input: [], expected: [null, null, 5], actual: [null, null, 7], passed: false, error: { type: 'ValueError', message: 'Bad value', line: 2 }, traceTruncated: true }] });
    render(<GuidedCodeRunner problem={design} code={code} />);
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    const table = await screen.findByRole('table', { name: 'Constructor and calls in order' });
    expect(within(table).getAllByRole('row').map(row => row.textContent)).toEqual(['CallExpectedActual', 'MinStack()nullnull', 'push(5)nullnull', 'getMin()57']);
    expect(screen.getByRole('alert').textContent).toBe('ValueError at line 2: Bad value');
    expect(screen.getByText(/The final frame jumps/)).toBeTruthy();
  });

  it('runs JavaScript through its own lazy worker with matching highlighted source and trace expressions', async () => {
    const jsCode = 'function twoSum(nums, target) { return [0, 1]; }';
    const execution = { code: 'prepared source', sites: [] };
    mocks.runJs.mockResolvedValue({ ...result, tests: result.tests.map(test => ({ ...test, trace: [{ ...test.trace[0], line: 1, statement: 'return [0, 1];' }] })) });
    const view = render(<GuidedCodeRunner problem={problem} code={jsCode} language="javascript" execution={execution} />);
    expect((await screen.findByTestId('highlighted-code')).getAttribute('data-language')).toBe('javascript');
    expect(mocks.createJs).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Step through' }));
    expect(mocks.runJs.mock.calls[0][0]).toEqual({ problemId: 1, code: jsCode, fixtures: problem.fixtures, execution });
    expect(mocks.run).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Current executed statement').textContent).toBe('return [0, 1];');
    expect(screen.getByLabelText('JavaScript variables')).toBeTruthy();
    view.unmount(); expect(mocks.disposeJs).toHaveBeenCalledOnce();
  });
});

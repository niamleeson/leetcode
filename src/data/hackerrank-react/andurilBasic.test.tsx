import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import ts from 'typescript';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { andurilBasicChallenges } from './andurilBasic';

function loadSolution(slug: string): React.ComponentType<any> {
  const challenge = andurilBasicChallenges.find(item => item.slug === slug);
  if (!challenge) throw new Error(`Missing solution: ${slug}`);
  const compiled = ts.transpileModule(challenge.code, {
    fileName: `${slug}.jsx`,
    reportDiagnostics: true,
    compilerOptions: {
      allowJs: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const errors = compiled.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) throw new Error(errors.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
  const exports: { default?: React.ComponentType<any> } = {};
  const require = (name: string) => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return jsxRuntime;
    throw new Error(`Unexpected solution dependency: ${name}`);
  };
  new Function('require', 'exports', compiled.outputText)(require, exports);
  if (!exports.default) throw new Error(`Missing default component: ${slug}`);
  return exports.default;
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Anduril file explorer snippet', () => {
  it('expands recursively, remembers hidden descendant state, and handles empty folders', () => {
    const Component = loadSolution('anduril-file-explorer');
    render(<Component />);
    expect(screen.queryByText('App.jsx')).not.toBeInTheDocument();
    const src = screen.getByRole('button', { name: 'src' });
    expect(src).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(src);
    expect(src).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('App.jsx')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'components' }));
    expect(screen.getByText('Button.jsx')).toBeInTheDocument();
    fireEvent.click(src);
    expect(screen.queryByText('Button.jsx')).not.toBeInTheDocument();
    fireEvent.click(src);
    expect(screen.getByText('Button.jsx')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'public' }));
    expect(screen.getByText('Empty folder')).toBeInTheDocument();
  });

  it('uses IDs to toggle equally named folders independently without mutating input', () => {
    const Component = loadSolution('anduril-file-explorer');
    const nodes = [
      { id: 'a', name: 'shared', type: 'folder', children: [{ id: 'a-file', name: 'A.jsx', type: 'file' }] },
      { id: 'b', name: 'shared', type: 'folder', children: [{ id: 'b-file', name: 'B.jsx', type: 'file' }] },
    ];
    const before = JSON.stringify(nodes);
    render(<Component nodes={nodes} />);
    const folders = screen.getAllByRole('button', { name: 'shared' });
    fireEvent.click(folders[0]);
    expect(screen.getByText('A.jsx')).toBeInTheDocument();
    expect(screen.queryByText('B.jsx')).not.toBeInTheDocument();
    fireEvent.click(folders[1]);
    fireEvent.click(folders[0]);
    expect(screen.queryByText('A.jsx')).not.toBeInTheDocument();
    expect(screen.getByText('B.jsx')).toBeInTheDocument();
    expect(JSON.stringify(nodes)).toBe(before);
  });
});

describe('Anduril timer snippet', () => {
  it('handles repeated start, pause/resume, reset, and cleanup under StrictMode', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] });
    const Component = loadSolution('anduril-timer');
    const page = render(<React.StrictMode><Component /></React.StrictMode>);
    const start = screen.getByRole('button', { name: 'Start / resume' });
    const pause = screen.getByRole('button', { name: 'Pause' });
    const stop = screen.getByRole('button', { name: 'Stop / reset' });
    fireEvent.click(start);
    fireEvent.click(start);
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText('Elapsed: 2.00 seconds')).toBeInTheDocument();
    fireEvent.click(pause);
    fireEvent.click(pause);
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Elapsed: 2.00 seconds')).toBeInTheDocument();
    fireEvent.click(start);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Elapsed: 3.00 seconds')).toBeInTheDocument();
    fireEvent.click(stop);
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByText('Elapsed: 0.00 seconds')).toBeInTheDocument();
    fireEvent.click(start);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByText('Elapsed: 0.50 seconds')).toBeInTheDocument();
    page.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('measures elapsed timestamps when a display callback is delayed', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    const Component = loadSolution('anduril-timer');
    render(<Component />);
    fireEvent.click(screen.getByRole('button', { name: 'Start / resume' }));
    now.mockReturnValue(2500);
    act(() => vi.advanceTimersByTime(50));
    expect(screen.getByText('Elapsed: 2.50 seconds')).toBeInTheDocument();
  });
});

it('filters the search table, reports empty results, and derives results from updated props', () => {
  const Component = loadSolution('anduril-search-table');
  const page = render(<Component />);
  const table = screen.getByRole('table', { name: 'People' });
  expect(within(table).getAllByRole('row')).toHaveLength(5);
  change('Search people', '  PLATFORM  ');
  expect(screen.getByRole('status')).toHaveTextContent('2 results');
  expect(within(table).getByText('Alex Kim')).toBeInTheDocument();
  expect(within(table).getByText('Sam Rivera')).toBeInTheDocument();
  change('Search people', 'jordan');
  expect(screen.getByRole('status')).toHaveTextContent('1 result');
  expect(within(table).getByText('Jordan Lee')).toBeInTheDocument();
  page.rerender(<Component rows={[{ id: 'new', name: 'Jordan Smith', team: 'Design' }]} />);
  expect(within(table).getByText('Jordan Smith')).toBeInTheDocument();
  expect(within(table).queryByText('Jordan Lee')).not.toBeInTheDocument();
  change('Search people', 'missing');
  expect(screen.getByRole('status')).toHaveTextContent('0 results');
  expect(within(table).getByText('No matching people.')).toBeInTheDocument();
  change('Search people', '');
  expect(screen.getByRole('status')).toHaveTextContent('1 result');
});

it('validates month/year input, pads months, clears invalid results, and accepts year boundaries', () => {
  const Component = loadSolution('anduril-month-year-form');
  render(<Component />);
  const submit = screen.getByRole('button', { name: 'Submit' });
  fireEvent.click(submit);
  expect(screen.getByRole('alert')).toHaveTextContent('1000 to 9999');
  change('Month', '3');
  change('Year', '2026');
  fireEvent.click(submit);
  expect(screen.getByRole('status')).toHaveTextContent('Submitted: 2026-03');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  for (const invalid of ['', '999', '0000', '2e03', '10000']) {
    change('Year', invalid);
    fireEvent.click(submit);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  }
  for (const year of ['1000', '9999']) {
    change('Year', year);
    fireEvent.click(submit);
    expect(screen.getByRole('status')).toHaveTextContent(`Submitted: ${year}-03`);
  }
});

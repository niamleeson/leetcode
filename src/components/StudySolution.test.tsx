import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { DailySavedSolution } from '../data/daily-questions/types';
import { useProgrammingLanguage } from '../hooks/useProgrammingLanguage';
import StudySolution from './StudySolution';

beforeEach(() => { localStorage.clear(); });
afterEach(cleanup);

const solution: DailySavedSolution = {
  title: 'Count items',
  code: 'function count(items) { return items.length; }',
  pythonCode: 'def count(items):\n    return len(items)',
  intuition: 'An array already keeps track of its length.',
  approach: 'Count the items in the input.',
  hints: ['Use the array metadata.', 'Read the length without a loop.'],
  pseudocode: { concept: 'Use the stored length.', steps: ['Read the input length.', 'Return that length.'] },
  explanation: 'Reading the stored length does not visit the items.',
  example: 'count([1, 2]) → 2',
  timeComplexity: 'O(1)',
  timeComplexityBreakdown: { variables: 'n is the number of input items.', phases: [{ label: 'Read length', cost: 'O(1)' }], simplifications: ['O(1)'], note: 'No item traversal is needed.' },
  spaceComplexity: 'O(1)',
  variables: { n: 'Number of input items.' },
  walkthrough: 'Read items.length = 2\nReturn 2',
  pythonWalkthrough: 'Read len(items) = 2\nReturn 2',
};

function PreferenceControl() {
  const [language, setLanguage] = useProgrammingLanguage();
  return <>
    <output aria-label="Shared preference">{language}</output>
    <button onClick={() => setLanguage('python')}>Use Python elsewhere</button>
  </>;
}

it('shares the selected language across solutions and pages while showing matching code and walkthroughs', () => {
  localStorage.setItem('lc-language', JSON.stringify('python'));
  render(<>
    <PreferenceControl />
    <StudySolution solution={solution} />
    <StudySolution solution={{ ...solution, title: 'Alternative count' }} index={1} />
  </>);

  const first = screen.getByRole('region', { name: 'Saved solution: Count items' });
  const alternative = screen.getByRole('region', { name: 'Saved solution: Alternative count' });
  expect(within(within(first).getByRole('group', { name: 'Implementation language' })).getAllByRole('button').map(button => button.textContent)).toEqual(['JavaScript', 'Python']);
  expect(first.querySelector('[data-solution-section="solution"] pre.code-block > code')?.textContent).toBe(solution.pythonCode);
  expect(first.querySelector('[data-solution-section="solution"] pre.code-block > code')?.className).toContain('language-python');
  expect(within(first).getByRole('region', { name: 'Count items walkthrough' }).textContent).toContain('len(items)');
  expect(within(first).getByRole('button', { name: 'Python' }).getAttribute('aria-pressed')).toBe('true');

  fireEvent.click(within(first).getByRole('button', { name: 'JavaScript' }));
  for (const section of [first, alternative]) {
    expect(section.querySelector('[data-solution-section="solution"] pre.code-block > code')?.textContent).toBe(solution.code);
    expect(within(section).getByRole('button', { name: 'JavaScript' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(section).getByRole('region').textContent).toContain('items.length');
    expect(within(section).getByRole('region').textContent).not.toContain('len(items)');
  }
  expect(screen.getByLabelText('Shared preference').textContent).toBe('javascript');
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('javascript');

  fireEvent.click(screen.getByRole('button', { name: 'Use Python elsewhere' }));
  expect(first.querySelector('[data-solution-section="solution"] pre.code-block > code')?.textContent).toBe(solution.pythonCode);
  expect(alternative.querySelector('[data-solution-section="solution"] pre.code-block > code')?.textContent).toBe(solution.pythonCode);
});

it('keeps saved JavaScript visible without changing a Python preference and retains the shared template', () => {
  localStorage.setItem('lc-language', JSON.stringify('python'));
  const javascriptOnly = { ...solution, pythonCode: undefined, pythonWalkthrough: undefined };
  const page = render(<><PreferenceControl /><StudySolution solution={javascriptOnly} /></>);
  const section = screen.getByRole('region', { name: 'Saved solution: Count items' });
  expect(section.querySelector('[data-solution-section="solution"] pre.code-block > code')?.textContent).toBe(solution.code);
  expect(section.querySelector('[data-solution-section="solution"] pre.code-block > code')?.className).toContain('language-javascript');
  expect(within(section).queryByRole('group', { name: 'Implementation language' })).toBeNull();
  expect(within(section).getByRole('heading', { name: 'JavaScript Solution' })).toBeTruthy();
  expect(screen.getByLabelText('Shared preference').textContent).toBe('python');
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('python');
  for (const name of ['Intuition', 'Approach', 'Hints', 'JavaScript Solution', 'Step-by-Step Walkthrough', 'Pseudocode (for memorization)', 'Explanation']) {
    expect(within(section).getByRole('heading', { name })).toBeTruthy();
  }
  expect(within(section).getByText('Number of input items.', { exact: true })).toBeTruthy();
  expect([...section.querySelectorAll('[data-solution-section]')].map(element => element.getAttribute('data-solution-section'))).toEqual(['intuition', 'approach', 'hints', 'solution', 'pseudocode', 'explanation', 'complexity']);
  expect(within(section).getByText('No item traversal is needed.')).toBeTruthy();
  expect(section.querySelector('details')).toBeNull();

  page.rerender(<><PreferenceControl /><StudySolution solution={solution} /></>);
  expect(section.querySelector('[data-solution-section="solution"] pre.code-block > code')?.textContent).toBe(solution.pythonCode);
});

it('does not substitute a JavaScript walkthrough when Python code has no matching walkthrough', () => {
  localStorage.setItem('lc-language', JSON.stringify('python'));
  render(<StudySolution solution={{ ...solution, pythonWalkthrough: undefined }} />);
  const section = screen.getByRole('region', { name: 'Saved solution: Count items' });
  expect(section.querySelector('[data-solution-section="solution"] pre.code-block > code')?.textContent).toBe(solution.pythonCode);
  expect(within(section).queryByRole('region', { name: 'Count items walkthrough' })).toBeNull();
  fireEvent.click(within(section).getByRole('button', { name: 'JavaScript' }));
  expect(within(section).getByRole('region', { name: 'Count items walkthrough' }).textContent).toContain('items.length');
});

it('uses the standard execution-trace template with language-specific traces and notes in Explanation', () => {
  const traceSolution = {
    ...solution,
    walkthrough: 'Input: items = [1, 2]\nRead items.length = 2\nReturn 2',
    pythonWalkthrough: 'Input: items = [1, 2]\nRead len(items) = 2\nReturn 2',
    notes: ['The input stays unchanged.'],
  };
  render(<StudySolution solution={traceSolution} />);
  const section = screen.getByRole('region', { name: 'Saved solution: Count items' });
  const trace = within(section).getByRole('region', { name: 'Count items walkthrough' });
  expect(trace.querySelector(':scope pre')?.textContent).toBe(traceSolution.walkthrough);
  expect(trace.querySelector('.catalog-prose')).toBeNull();
  expect(section.querySelector('[data-solution-section="approach"] pre')).toBeNull();
  expect(section.querySelector('[data-solution-section="explanation"]')?.textContent).toContain('The input stays unchanged.');
  fireEvent.click(within(section).getByRole('button', { name: 'Python' }));
  expect(trace.querySelector(':scope pre')?.textContent).toBe(traceSolution.pythonWalkthrough);
  expect(trace.querySelector(':scope pre')?.className).toContain('font-mono');
});


it('reveals hints in order for each alternative independently and keeps the solution open', () => {
  render(<><StudySolution solution={solution} /><StudySolution solution={{ ...solution, title: 'Alternative count' }} index={1} /></>);
  const first = screen.getByRole('region', { name: 'Saved solution: Count items' });
  const alternative = screen.getByRole('region', { name: 'Saved solution: Alternative count' });
  expect(within(first).queryByText(solution.hints[0])).toBeNull();
  fireEvent.click(within(first).getByRole('button', { name: 'Reveal Hint 1' }));
  expect(within(first).getByText(solution.hints[0], { exact: false })).toBeTruthy();
  expect(within(alternative).queryByText(solution.hints[0], { exact: false })).toBeNull();
  expect(within(first).getByRole('button', { name: 'Reveal Hint 2' })).toBeTruthy();
  fireEvent.click(within(first).getByRole('button', { name: 'Reveal Hint 2' }));
  expect(within(first).getByText(solution.hints[1], { exact: false })).toBeTruthy();
  expect(within(first).queryByRole('button', { name: /Reveal Hint/ })).toBeNull();
  expect(first.querySelector('[data-solution-section="solution"] pre.code-block > code')?.textContent).toBe(solution.code);
  expect(first.querySelector('details')).toBeNull();
});

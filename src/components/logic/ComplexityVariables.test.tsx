import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import SolutionComplexity from '../SolutionComplexity';
import SolutionReveal from './SolutionReveal';
import { loadSolution } from '../../data/solutions/lazy';
import type { ProblemSolution } from '../../data/solutions/types';

vi.mock('../../data/solutions/lazy', () => ({ hasSolution: () => true, loadSolution: vi.fn() }));
vi.mock('../CodeBlock', () => ({ default: ({ code }: { code: string }) => <pre>{code}</pre> }));

const estimates = {
  timeComplexity: 'O(N × L)',
  spaceComplexity: 'O(1)',
  complexityVariables: { N: 'Number of words', L: 'Maximum word length' },
  pythonTimeComplexity: 'O(w²)',
  pythonComplexityVariables: { w: 'Number of words compared' },
};
const solution: ProblemSolution = {
  ...estimates, id: 49, description: 'Group words.', examples: '', intuition: '',
  approach: 'Group words by their letters.', explanation: 'Use one key for each group.',
  code: 'def group(words):\n    return words', jsCode: 'function group(words) { return words; }', hints: [],
};
const legend = () => screen.getByRole('list', { name: 'Complexity variables' });

beforeEach(() => { vi.mocked(loadSolution).mockReset().mockResolvedValue(solution); });
afterEach(cleanup);

describe('complexity variable meanings beside the estimates', () => {
  it('shows visible N and L definitions without changing the time or space estimates', () => {
    render(<SolutionComplexity solution={estimates} />);
    expect(screen.getByText('O(N × L)')).toBeTruthy();
    expect(screen.getByText('O(1)')).toBeTruthy();
    expect(within(legend()).getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'N — Number of words', 'L — Maximum word length',
    ]);
    expect(legend().closest('details, [hidden]')).toBeNull();
  });

  it('uses the complete Python override and falls back only when no override exists', () => {
    const view = render(<SolutionComplexity solution={estimates} language="python" />);
    expect(screen.getByText('O(w²)')).toBeTruthy();
    expect(legend().textContent).toBe('w — Number of words compared');
    expect(screen.queryByText('Maximum word length')).toBeNull();
    view.rerender(<SolutionComplexity solution={{ ...estimates, pythonTimeComplexity: undefined, pythonComplexityVariables: undefined }} language="python" />);
    expect(screen.getByText('O(N × L)')).toBeTruthy();
    expect(legend().textContent).toContain('N — Number of words');
    expect(legend().textContent).toContain('L — Maximum word length');
  });

  it('keeps breakdown details and displays the same visible symbol legend', () => {
    render(<SolutionComplexity solution={{ ...estimates, timeComplexityBreakdown: {
      variables: 'N words, each with at most L characters.',
      phases: [{ label: 'Read the characters', cost: 'O(N × L)' }],
      simplifications: ['O(N × L)'], note: 'Every character is visited once.',
      operations: [{ title: 'Key lookup', phases: [{ label: 'Lookup', cost: 'O(1)' }], simplifications: [], note: 'Average lookup cost.' }],
    }}}/>);
    expect(legend().textContent).toContain('L — Maximum word length');
    expect(legend().closest('details, [hidden]')).toBeNull();
    expect(screen.getByText('N words, each with at most L characters.')).toBeTruthy();
    expect(screen.getByText(/Read the characters:/)).toBeTruthy();
    expect(screen.getByText('Every character is visited once.')).toBeTruthy();
    expect(screen.getByText('Key lookup')).toBeTruthy();
    expect(screen.getByText('Average lookup cost.')).toBeTruthy();
    expect(screen.getByText(/Space:/)).toBeTruthy();
  });

  it('does not invent a variable for constant complexity or fill an intentionally empty Python override', () => {
    const view = render(<SolutionComplexity solution={{ timeComplexity: 'O(1)', spaceComplexity: 'O(1)' }} />);
    expect(screen.queryByRole('list', { name: 'Complexity variables' })).toBeNull();
    expect(screen.getAllByText('O(1)')).toHaveLength(2);
    view.rerender(<SolutionComplexity solution={{ ...estimates, pythonTimeComplexity: 'O(1)', pythonComplexityVariables: {} }} language="python" />);
    expect(screen.queryByRole('list', { name: 'Complexity variables' })).toBeNull();
    expect(screen.getAllByText('O(1)')).toHaveLength(2);
  });

  it('shows definitions in the open Solution by default and switches their language with the solution', async () => {
    const view = render(<SolutionReveal id={49} language="javascript" />);
    expect(screen.getByRole('button', { name: 'Solution' }).getAttribute('aria-expanded')).toBe('true');
    await screen.findByRole('list', { name: 'Complexity variables' });
    expect(loadSolution).toHaveBeenCalledWith(49);
    expect(screen.getByText('O(N × L)')).toBeTruthy();
    expect(legend().textContent).toContain('N — Number of words');
    expect(legend().closest('[hidden]')).toBeNull();

    view.rerender(<SolutionReveal id={49} language="python" />);
    expect(screen.getByRole('button', { name: 'Solution' }).getAttribute('aria-expanded')).toBe('true');
    await screen.findByRole('heading', { name: 'Python solution' });
    await screen.findByText('O(w²)');
    expect(legend().textContent).toBe('w — Number of words compared');
    expect(screen.queryByText('Maximum word length')).toBeNull();
  });
});

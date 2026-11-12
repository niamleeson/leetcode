import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NeetCodeSolution from '../NeetCodeSolution';
import ProblemPage from '../ProblemPage';
import PracticeSolution from './PracticeSolution';
import type { ProblemSolution } from '../../data/solutions/types';

const mocks = vi.hoisted(() => ({ solution: undefined as ProblemSolution | undefined }));
vi.mock('../../hooks/useProblemSolution', () => ({ useProblemSolution: () => ({ solution: mocks.solution, loading: false, retry: vi.fn() }) }));
vi.mock('../../data/solutions/lazy', () => ({ hasSolution: () => true }));
vi.mock('../../data/logic', () => ({ hasLogicProblem: () => true }));
vi.mock('../../data/problems', () => ({ uniqueProblems: [{ id: 69, title: 'Sqrt(x)', difficulty: 'Easy', topics: ['Binary Search'], url: 'https://leetcode.com/problems/sqrtx/' }] }));
vi.mock('../CodeBlock', () => ({ default: ({ code }: { code: string }) => <pre>{code}</pre> }));
vi.mock('../GlossaryHighlighter', () => ({ default: ({ text }: { text: string }) => <span>{text}</span> }));
vi.mock('../FollowUpSolution', () => ({ default: () => null }));
vi.mock('../SolutionComplexity', () => ({ default: () => null }));
vi.mock('../walkthroughs/ExecutionWalkthrough', () => ({ default: () => null, hasExecutionWalkthrough: () => false }));

const solution: ProblemSolution = {
  id: 69, description: 'Find the integer square root.', examples: 'x = 8 → 2', hints: [],
  intuition: 'Locate the first square above x.',
  approach: 'Find the first candidate whose square is too large.',
  explanation: '1. Keep the first too-large candidate in range.\n2. Return the preceding integer.',
  jsIntuition: 'Keep the largest candidate that fits.',
  jsApproach: 'Search an inclusive range and save a valid answer.',
  jsExplanation: '1. Save each larger candidate whose square is below x.\n2. Return the saved answer after the range empties.',
  code: 'return lo - 1', jsCode: 'return answer;', timeComplexity: 'O(log x)', spaceComplexity: 'O(1)',
};

beforeEach(() => { mocks.solution = { ...solution }; localStorage.clear(); });
afterEach(cleanup);

describe('solution text follows the displayed language', () => {
  it('switches the NeetCode intuition, approach, explanation, and code together', () => {
    const view = render(<NeetCodeSolution id={69} language="javascript" />);
    for (const text of [solution.jsIntuition!, solution.jsApproach!, solution.jsExplanation!, solution.jsCode!]) expect(screen.getByText(text.replace(/\s+/g, ' '))).toBeTruthy();
    expect(screen.queryByText(solution.intuition)).toBeNull();
    view.rerender(<NeetCodeSolution id={69} language="python" />);
    for (const text of [solution.intuition, solution.approach, solution.code]) expect(screen.getByText(text)).toBeTruthy();
    expect(screen.queryByText(solution.jsIntuition!)).toBeNull();
    expect(screen.queryByText(solution.jsApproach!)).toBeNull();
    expect(screen.getByText(/Return the preceding integer/)).toBeTruthy();
  });

  it('falls back per prose field, and uses Python prose if JavaScript code is unavailable', () => {
    mocks.solution = { ...solution, jsApproach: undefined, jsExplanation: undefined };
    const view = render(<NeetCodeSolution id={69} language="javascript" />);
    expect(screen.getByText(solution.jsIntuition!)).toBeTruthy();
    expect(screen.getByText(solution.approach)).toBeTruthy();
    expect(screen.getByText(/Return the preceding integer/)).toBeTruthy();
    mocks.solution = { ...solution, jsCode: undefined };
    view.rerender(<NeetCodeSolution id={69} language="javascript" />);
    expect(screen.getByText(solution.intuition)).toBeTruthy();
    expect(screen.getByText(solution.approach)).toBeTruthy();
    expect(screen.getByText(solution.code)).toBeTruthy();
    expect(screen.queryByText(solution.jsIntuition!)).toBeNull();
    expect(screen.queryByText(solution.jsApproach!)).toBeNull();
  });

  it('updates the problem page explanation and memorization steps when its language toggle changes', () => {
    const progress = { problemId: 69, status: 'unseen' as const, confidence: 0, lastReviewed: null, nextReview: null, easeFactor: 2.5, interval: 0, repetitions: 0, notes: '' };
    render(<MemoryRouter initialEntries={['/problem/69']}><Routes><Route path="/problem/:id" element={<ProblemPage getProgress={() => progress} onRate={() => {}} onUpdateNotes={() => {}} onReset={() => {}} />} /></Routes></MemoryRouter>);
    const pseudocode = () => within(screen.getByRole('heading', {name:'Pseudocode (for memorization)'}).closest('section')!);
    expect(screen.getByText(solution.jsIntuition!)).toBeTruthy();
    expect(pseudocode().getByText('Search an inclusive range and save a valid answer')).toBeTruthy();
    expect(pseudocode().getByText('Return the saved answer after the range empties')).toBeTruthy();
    expect(screen.queryByText(solution.intuition)).toBeNull();
    fireEvent.click(screen.getByRole('button', {name:'Python'}));
    expect(screen.getByText(solution.intuition)).toBeTruthy();
    expect(pseudocode().getByText('Return the preceding integer')).toBeTruthy();
    expect(screen.queryByText(solution.jsIntuition!)).toBeNull();
    expect(pseudocode().queryByText('Return the saved answer after the range empties')).toBeNull();
  });

  it('uses matching practice prose while preserving an explicit guided lesson explanation', () => {
    const view = render(<PracticeSolution id={69} language="javascript" />);
    expect(screen.getByText(solution.jsApproach!)).toBeTruthy();
    expect(screen.getByText(/Return the saved answer/)).toBeTruthy();
    view.rerender(<PracticeSolution id={69} language="javascript" approach="Reviewed binary search pattern" explanation="The decisions from this guided lesson." />);
    expect(screen.getByText('Reviewed binary search pattern')).toBeTruthy();
    expect(screen.getByText('The decisions from this guided lesson.')).toBeTruthy();
    expect(screen.queryByText(solution.jsApproach!)).toBeNull();
    view.rerender(<PracticeSolution id={69} language="python" />);
    expect(screen.getByText(solution.approach)).toBeTruthy();
    expect(screen.getByText(/Return the preceding integer/)).toBeTruthy();
    expect(screen.queryByText(solution.jsApproach!)).toBeNull();
  });
});

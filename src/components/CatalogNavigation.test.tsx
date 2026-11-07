import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchView from './SearchView';
import AllProblems from './AllProblems';
import { uniqueProblems } from '../data/problems';
import type { ProblemProgress } from '../types';

afterEach(cleanup);
const getProgress = (id: number): ProblemProgress => ({ problemId: id, status: 'unseen', confidence: 0, lastReviewed: null, nextReview: null, easeFactor: 2.5, interval: 0, repetitions: 0, notes: '' });

it('keeps every catalog match reachable while rendering at most fifty rows', () => {
  render(<MemoryRouter><SearchView getProgress={getProgress}/></MemoryRouter>);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'Easy' } });
  expect(screen.getAllByRole('link')).toHaveLength(50);
  const first = screen.getAllByRole('link')[0].getAttribute('href');
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getAllByRole('link')).toHaveLength(50);
  expect(screen.getAllByRole('link')[0].getAttribute('href')).not.toBe(first);
  fireEvent.change(input, { target: { value: '4101' } });
  expect(screen.getByRole('link', { name: /4101/ }).getAttribute('href')).toBe('/problem/4101');
  expect(screen.queryByRole('navigation', { name: 'Search result pages' })).toBeNull();
});

it('shows complete catalog coverage without mutating its shared ordering', () => {
  const order = uniqueProblems.map(problem => problem.id);
  render(<MemoryRouter initialEntries={['/problems?page=82']}><AllProblems getProgress={getProgress} stats={{ total: uniqueProblems.length, solved: 0, attempted: 0 }}/></MemoryRouter>);
  expect(screen.getByText('4,101 LeetCode problems · 30 additional study problems')).toBeTruthy();
  expect(uniqueProblems.map(problem => problem.id)).toEqual(order);
  expect(screen.getAllByRole('link').length).toBeLessThanOrEqual(50);
});

import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AllProblems from './AllProblems';
import { uniqueProblems } from '../data/problems';
import type { ProblemProgress } from '../types';

afterEach(cleanup);
const getProgress = (id: number): ProblemProgress => ({ problemId: id, status: 'unseen', confidence: 0, lastReviewed: null, nextReview: null, easeFactor: 2.5, interval: 0, repetitions: 0, notes: '' });
const stats = { total: uniqueProblems.length, solved: 0, attempted: 0 };

function LocationProbe() {
  return <span data-testid="catalog-search-params">{useLocation().search}</span>;
}

function OpenedProblem() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Back to results</button>;
}

function renderAllProblems(url = '/problems', progress = getProgress) {
  return render(<MemoryRouter initialEntries={[url]}>
    <Routes>
      <Route path="/problems" element={<AllProblems getProgress={progress} stats={stats}/>} />
      <Route path="/problem/:id" element={<OpenedProblem/>} />
    </Routes>
    <LocationProbe/>
  </MemoryRouter>);
}

const params = () => new URLSearchParams(screen.getByTestId('catalog-search-params').textContent || '');
const searchAll = (value: string) => fireEvent.change(screen.getByRole('searchbox', { name: 'Search all problems' }), { target: { value } });
const rowLinks = () => screen.queryAllByRole('link').map(link => link.getAttribute('href'));

it('shows complete catalog coverage without mutating its shared ordering', () => {
  const order = uniqueProblems.map(problem => problem.id);
  render(<MemoryRouter initialEntries={['/problems?page=82']}><AllProblems getProgress={getProgress} stats={{ total: uniqueProblems.length, solved: 0, attempted: 0 }}/></MemoryRouter>);
  expect(screen.getByText('4,101 LeetCode problems · 30 additional study problems')).toBeTruthy();
  expect(uniqueProblems.map(problem => problem.id)).toEqual(order);
  expect(screen.getAllByRole('link').length).toBeLessThanOrEqual(50);
});

it('searches the full collection from its last page and resets pagination for each new query', () => {
  const order = uniqueProblems.map(problem => problem.id);
  renderAllProblems('/problems?page=82');
  expect(rowLinks()).not.toContain('/problem/1');
  expect(rowLinks()).not.toContain('/problem/3934');
  searchAll('  TWO   SUM  ');
  expect(rowLinks()).toContain('/problem/1');
  expect(params().has('page')).toBe(false);
  searchAll('#3934');
  expect(rowLinks()).toEqual(['/problem/3934']);
  expect(screen.getByRole('status').textContent).toBe('1 results');
  expect(screen.queryByRole('navigation', { name: 'Problem result pages' })).toBeNull();
  expect(params().get('q')).toBe('#3934');
  expect(uniqueProblems.map(problem => problem.id)).toEqual(order);
});

it('paginates all search matches and clears both the query and page when clearing search', () => {
  renderAllProblems('/problems?page=82');
  searchAll('Easy');
  const firstPage = rowLinks();
  expect(firstPage).toHaveLength(50);
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  const secondPage = rowLinks();
  expect(secondPage).toHaveLength(50);
  expect(secondPage.every(link => !firstPage.includes(link))).toBe(true);
  for (const link of screen.getAllByRole('link')) expect(link.textContent).toMatch(/Easy/);
  expect(params().get('q')).toBe('Easy');
  expect(params().get('page')).toBe('1');
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
  expect(params().has('q')).toBe(false);
  expect(params().has('page')).toBe(false);
  expect(rowLinks()[0]).toBe('/problem/1');
  expect(rowLinks()).toHaveLength(50);
});

it('restores a searched page from its URL and preserves it after opening a problem and going back', () => {
  renderAllProblems('/problems?q=Easy&page=1');
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('Easy');
  expect(screen.getByText(/^Page 2 of /)).toBeTruthy();
  const results = rowLinks();
  fireEvent.click(screen.getAllByRole('link')[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Back to results' }));
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('Easy');
  expect(params().get('q')).toBe('Easy');
  expect(params().get('page')).toBe('1');
  expect(rowLinks()).toEqual(results);
});

it('combines search with status and difficulty while retaining those filters when search is cleared', () => {
  const progress = (id: number): ProblemProgress => ({ ...getProgress(id), status: id === 3934 ? 'solved' : 'unseen' });
  renderAllProblems('/problems?q=unique&status=solved&difficulty=Hard&page=82', progress);
  expect(rowLinks()).toEqual(['/problem/3934']);
  searchAll('smallest unique');
  expect(params().has('page')).toBe(false);
  expect(params().get('status')).toBe('solved');
  expect(params().get('difficulty')).toBe('Hard');
  fireEvent.click(screen.getByRole('button', { name: 'Medium' }));
  expect(rowLinks()).toHaveLength(0);
  expect(screen.getByText(/No problems match/)).toBeTruthy();
  expect(params().get('q')).toBe('smallest unique');
  fireEvent.click(screen.getByRole('button', { name: 'Hard' }));
  expect(rowLinks()).toEqual(['/problem/3934']);
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(rowLinks()).toEqual(['/problem/3934']);
  expect(params().get('status')).toBe('solved');
  expect(params().get('difficulty')).toBe('Hard');
});

it('matches every case-insensitive search term across names, original topics, and difficulty', () => {
  renderAllProblems();
  searchAll('  hAsH   TABLE  ');
  expect(rowLinks()).toContain('/problem/1');
  searchAll(' BINARY  search HARD ');
  expect(rowLinks()).toContain('/problem/4');
  for (const link of screen.getAllByRole('link')) expect(link.textContent).toMatch(/Hard/);
  searchAll('smallest unique subarray');
  expect(rowLinks()).toEqual(['/problem/3934']);
  searchAll('no_such_problem_7e2c');
  expect(rowLinks()).toHaveLength(0);
  expect(screen.getByRole('status').textContent).toBe('0 results');
  expect(screen.getByText(/No problems match/)).toBeTruthy();
  searchAll('   ');
  expect(rowLinks()).toHaveLength(50);
  expect(rowLinks()[0]).toBe('/problem/1');
});

it('keeps consecutive filter resets when typing before the router finishes updating', () => {
  renderAllProblems('/problems?q=%233934&status=unseen&difficulty=Hard&page=82');
  const allButtons = screen.getAllByRole('button', { name: 'All' });
  act(() => {
    fireEvent.click(allButtons[1]);
    fireEvent.click(allButtons[0]);
    searchAll('easy');
  });
  expect(params().toString()).toBe('q=easy');
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('easy');
  expect(rowLinks()).toHaveLength(50);
  expect(rowLinks()[0]).toBe('/problem/1');
});

it.each(['not-a-page', 'Infinity', '-3'])('keeps search usable with an invalid page value: %s', page => {
  renderAllProblems(`/problems?q=%233934&page=${page}`);
  expect(rowLinks()).toEqual(['/problem/3934']);
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(rowLinks()).toHaveLength(50);
  expect(rowLinks()[0]).toBe('/problem/1');
});

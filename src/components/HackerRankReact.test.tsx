import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HackerRankReact from './HackerRankReact';
import { reactChallenges } from '../data/hackerrank-react';

function showPage(path = '/hackerrank-react') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/hackerrank-react/:slug?" element={<HackerRankReact />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    get: () => ({ writeText: vi.fn().mockResolvedValue(undefined) }),
  });
});
afterEach(cleanup);

it('lists all ten questions, searches concepts, and clears an empty result', () => {
  showPage();
  expect(screen.getByRole('heading', { name: 'HackerRank React' })).toBeTruthy();
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10);
  const search = screen.getByRole('searchbox', { name: 'Find a question or concept' });
  fireEvent.change(search, { target: { value: 'SLIDESHOW' } });
  expect(screen.getAllByRole('heading', { level: 2 }).map(node => node.textContent)).toEqual(['Slideshow']);
  fireEvent.change(search, { target: { value: 'no-such-question' } });
  expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10);
});

it.each(reactChallenges)('opens $title with its complete code and source', challenge => {
  showPage(`/hackerrank-react/${challenge.slug}`);
  expect(screen.getByRole('heading', { name: challenge.title, level: 1 })).toBeTruthy();
  const prompt = screen.getByRole('region', { name: 'Problem prompt' });
  expect(within(prompt).getByText(challenge.prompt)).toBeTruthy();
  expect(within(prompt).getByText(challenge.example.actions)).toBeTruthy();
  expect(within(prompt).getByText(challenge.example.result)).toBeTruthy();
  const solution = screen.getByRole('region', { name: 'JavaScript + React solution' });
  expect(prompt.compareDocumentPosition(solution) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(solution.querySelector('pre code')?.textContent).toBe(challenge.code);
  expect(screen.getByRole('link', { name: 'Original question on HackerRank ↗' }).getAttribute('href')).toBe(challenge.sourceUrl);
  expect(screen.getByRole('heading', { name: 'How it works' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Time and space' })).toBeTruthy();
  expect(screen.getAllByRole('row')).toHaveLength(challenge.testCases.length + 1);
  expect(screen.getByRole('combobox', { name: 'Jump to question' }).getAttribute('aria-label')).toBe('Jump to question');
});

it('shows three patient record samples above the solution and copies only the solution', async () => {
  const challenge = reactChallenges.find(item => item.slug === 'patient-medical-records')!;
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard);
  showPage(`/hackerrank-react/${challenge.slug}`);
  const samples = screen.getByRole('region', { name: 'medicalRecords.js — 3 sample records' });
  const solution = screen.getByRole('region', { name: 'JavaScript + React solution' });
  expect(samples.compareDocumentPosition(solution) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  const sampleCode = samples.querySelector('pre code')?.textContent ?? '';
  expect(sampleCode).toBe(challenge.sampleData?.code);
  expect(sampleCode.match(/userName/g)).toHaveLength(3);
  for (const name of ['John Oliver', 'Bob Martin', 'Helena Fernandez']) expect(sampleCode).toContain(name);
  for (const timestamp of ['1568550058964', '1565637002408', '1548036340751']) expect(sampleCode).toContain(timestamp);
  fireEvent.click(screen.getByRole('button', { name: 'Copy solution' }));
  await screen.findByRole('button', { name: 'Copied!' });
  expect(writeText).toHaveBeenCalledWith(challenge.code);
  expect(writeText).not.toHaveBeenCalledWith(sampleCode);
});

it('navigates from the index, between questions, and back to the catalog', () => {
  showPage();
  fireEvent.click(screen.getByRole('link', { name: /Item List Manager/ }));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Item List Manager');
  const nav = screen.getByRole('navigation', { name: 'React question navigation' });
  fireEvent.click(within(nav).getByRole('link', { name: 'Code Review Feedback →' }));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Code Review Feedback');
  fireEvent.change(screen.getByRole('combobox', { name: 'Jump to question' }), { target: { value: 'cryptorank-exchange' } });
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('CryptoRank Exchange');
  fireEvent.click(screen.getByRole('link', { name: 'Back to all questions →' }));
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(10);
});

it('copies the full displayed solution and resets its confirmation on navigation', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard);
  showPage(`/hackerrank-react/${reactChallenges[0].slug}`);
  fireEvent.click(screen.getByRole('button', { name: 'Copy solution' }));
  await screen.findByRole('button', { name: 'Copied!' });
  expect(writeText).toHaveBeenCalledWith(reactChallenges[0].code);
  fireEvent.change(screen.getByRole('combobox', { name: 'Jump to question' }), { target: { value: reactChallenges[1].slug } });
  expect(screen.getByRole('button', { name: 'Copy solution' })).toBeTruthy();
});

it('offers manual copying when clipboard access fails', async () => {
  const writeText = vi.fn().mockRejectedValue(new Error('Unavailable'));
  vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard);
  const page = showPage(`/hackerrank-react/${reactChallenges[0].slug}`);
  fireEvent.click(screen.getByRole('button', { name: 'Copy solution' }));
  expect((await screen.findByRole('status')).textContent).toContain('Select and copy the code below');
  expect(page.container.querySelector('pre code')?.textContent).toBe(reactChallenges[0].code);
});

it('recovers from an unknown question link', () => {
  showPage('/hackerrank-react/unknown-question');
  expect(screen.getByRole('heading', { name: 'React question not found' })).toBeTruthy();
  fireEvent.click(screen.getByRole('link', { name: 'View all React questions' }));
  expect(screen.getByRole('heading', { name: 'HackerRank React' })).toBeTruthy();
});

import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import HackerRankReact from './HackerRankReact';
import { reactChallenges } from '../data/hackerrank-react';

function HistoryControls() {
  const navigate = useNavigate();
  return <><button onClick={() => navigate(-1)}>History back</button><button onClick={() => navigate(1)}>History forward</button></>;
}

function showPage(path = '/hackerrank-react', options: { historyControls?: boolean; strict?: boolean } = {}) {
  const page = (
    <MemoryRouter initialEntries={[path]}>
      {options.historyControls && <HistoryControls />}
      <Routes>
        <Route path="/hackerrank-react/:slug?" element={<HackerRankReact />} />
      </Routes>
    </MemoryRouter>
  );
  return render(options.strict ? <StrictMode>{page}</StrictMode> : page);
}

let restoreScrollProperties: (() => void) | undefined;

function mockScrolling() {
  let top = 0;
  let left = 0;
  const originals = [
    [window, 'scrollY'], [window, 'scrollX'], [window.history, 'scrollRestoration'],
  ] as const;
  const descriptors = originals.map(([target, key]) => Object.getOwnPropertyDescriptor(target, key));
  restoreScrollProperties = () => originals.forEach(([target, key], index) => {
    const descriptor = descriptors[index];
    if (descriptor) Object.defineProperty(target, key, descriptor);
    else Reflect.deleteProperty(target, key);
  });
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => top });
  Object.defineProperty(window, 'scrollX', { configurable: true, get: () => left });
  window.history.scrollRestoration = 'auto';
  vi.mocked(window.scrollTo).mockImplementation((options?: ScrollToOptions | number, y?: number) => {
    left = typeof options === 'number' ? options : options?.left ?? left;
    top = typeof options === 'number' ? y ?? top : options?.top ?? top;
  });
  return (nextTop: number, nextLeft = 0, dispatchEvent = true) => {
    top = nextTop;
    left = nextLeft;
    if (dispatchEvent) fireEvent.scroll(window);
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    get: () => ({ writeText: vi.fn().mockResolvedValue(undefined) }),
  });
});
afterEach(() => {
  cleanup();
  restoreScrollProperties?.();
  restoreScrollProperties = undefined;
  vi.restoreAllMocks();
});

it('lists all collections in order, keeps only the requested GreatFrontEnd levels, and searches concepts', () => {
  showPage();
  expect(screen.getByRole('heading', { name: 'React questions', level: 1 })).toBeTruthy();
  const hackerRank = screen.getByRole('region', { name: 'HackerRank React' });
  const suno = screen.getByRole('region', { name: 'Another AI interview questions' });
  const anduril = screen.getByRole('region', { name: 'Other interview questions' });
  expect(hackerRank.compareDocumentPosition(suno) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(suno.compareDocumentPosition(anduril) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(within(hackerRank).getAllByRole('heading', { level: 3 })).toHaveLength(10);
  expect(within(suno).getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual([
    'Audio Player + Playlist',
    'Hooks-Style Media Feed',
    'Build a UI from a Design Brief',
    'Referral Credits',
    'Longest Path in a DAG',
    'Minimum Interval — Practice Variant',
    'Notification System Design',
  ]);
  expect(within(anduril).getAllByRole('heading', { level: 3 })).toHaveLength(6);
  const reference = screen.getByRole('region', { name: 'Interview reference' });
  const practice = screen.getByRole('region', { name: 'Additional practice' });
  const greatFrontend = screen.getByRole('region', { name: 'GreatFrontEnd React' });
  expect(anduril.compareDocumentPosition(greatFrontend) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(greatFrontend.compareDocumentPosition(practice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(within(greatFrontend).getAllByRole('heading', { level: 3 })).toHaveLength(71);
  expect(within(greatFrontend).getByRole('heading', { name: 'Accordion III' })).toBeTruthy();
  expect(within(greatFrontend).queryByRole('heading', { name: 'Accordion II' })).toBeNull();
  expect(within(greatFrontend).getByRole('heading', { name: 'Progress Bar' })).toBeTruthy();
  expect(within(greatFrontend).getByRole('heading', { name: 'Progress Bars IV' })).toBeTruthy();
  expect(practice.compareDocumentPosition(reference) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(within(practice).getByRole('heading', { name: 'Spreadsheet' })).toBeTruthy();
  expect(within(reference).getByRole('heading', { name: 'ARIA Interview Essentials' })).toBeTruthy();
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(96);
  const search = screen.getByRole('searchbox', { name: 'Find a question or concept' });
  fireEvent.change(search, { target: { value: 'SLIDESHOW' } });
  expect(screen.getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(['Slideshow']);
  fireEvent.change(search, { target: { value: 'anduril' } });
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
  expect(screen.queryByRole('region', { name: 'HackerRank React' })).toBeNull();
  fireEvent.change(search, { target: { value: 'Suno' } });
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(7);
  expect(screen.queryByRole('region', { name: 'Other interview questions' })).toBeNull();
  fireEvent.change(search, { target: { value: 'GreatFrontEnd' } });
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(71);
  fireEvent.change(search, { target: { value: 'useBoolean' } });
  expect(screen.getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(['useBoolean II']);
  fireEvent.change(search, { target: { value: 'no-such-question' } });
  expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(96);
});

it.each(reactChallenges)('opens $title with its complete solution and source', challenge => {
  showPage(`/hackerrank-react/${challenge.slug}`);
  expect(screen.getByRole('heading', { name: challenge.title, level: 1 })).toBeTruthy();
  const prompt = screen.getByRole('region', { name: 'Problem prompt' });
  expect(within(prompt).getByText(challenge.prompt)).toBeTruthy();
  expect(within(prompt).getByText(challenge.example.actions, { normalizer: text => text })).toBeTruthy();
  expect(within(prompt).getByText(challenge.example.result, { normalizer: text => text })).toBeTruthy();
  const solution = screen.getByRole('region', { name: challenge.solutionTitle ?? 'JavaScript + React solution' });
  expect(prompt.compareDocumentPosition(solution) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  if (challenge.code) expect(solution.querySelector('pre code')?.textContent).toBe(challenge.code);
  for (const section of challenge.solutionSections ?? []) {
    expect(within(solution).getByRole('heading', { name: section.title })).toBeTruthy();
    expect(solution.textContent).toContain(section.body);
  }
  if (challenge.collection === 'Anduril' || challenge.collection === 'Suno') {
    expect(challenge.report).toBeTruthy();
    expect(challenge.assumptions?.length).toBeGreaterThan(0);
    expect(within(prompt).getByText(challenge.report!)).toBeTruthy();
    expect(within(prompt).getByRole('heading', { name: 'Assumptions for this answer' })).toBeTruthy();
  }
  const sourceLabel = challenge.sourceLabel ?? (challenge.collection === 'Anduril' ? 'Public candidate report' : 'Original question on HackerRank');
  if (challenge.sourceUrl) {
    expect(screen.getByRole('link', { name: `${sourceLabel} ↗` }).getAttribute('href')).toBe(challenge.sourceUrl);
  } else {
    expect(screen.getByText(sourceLabel)).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Original question on HackerRank/ })).toBeNull();
  }
  expect(screen.getByRole('heading', { name: challenge.kind === 'discussion' ? 'How to answer' : 'How it works' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: challenge.kind === 'discussion' ? 'Answer guidance' : 'Time and space' })).toBeTruthy();
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
  fireEvent.click(within(screen.getByRole('navigation', { name: 'React question navigation' })).getByRole('link', { name: `${reactChallenges[10].title} →` }));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(reactChallenges[10].title);
  fireEvent.change(screen.getByRole('combobox', { name: 'Jump to question' }), { target: { value: reactChallenges[reactChallenges.length - 1].slug } });
  fireEvent.click(screen.getByRole('link', { name: 'Back to all questions →' }));
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(96);
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
  expect((await screen.findByRole('status')).textContent).toContain('Select and copy the solution below');
  expect(page.container.querySelector('pre code')?.textContent).toBe(reactChallenges[0].code);
});

it('copies a complete GreatFrontEnd solution and preserves navigation into the existing references', async () => {
  const challenge = reactChallenges.find(item => item.title === 'useQuery' && item.collection === 'GreatFrontEnd')!;
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard);
  showPage(`/hackerrank-react/${challenge.slug}`);
  fireEvent.click(screen.getByRole('button', { name: 'Copy solution' }));
  await screen.findByRole('button', { name: 'Copied!' });
  expect(writeText).toHaveBeenCalledWith(challenge.code);
  fireEvent.change(screen.getByRole('combobox', { name: 'Jump to question' }), { target: { value: 'spreadsheet' } });
  fireEvent.click(screen.getByRole('link', { name: 'ARIA Interview Essentials →' }));
  expect(screen.getByRole('heading', { name: 'ARIA Interview Essentials', level: 1 })).toBeTruthy();
});

it('recovers from an unknown question link', () => {
  showPage('/hackerrank-react/unknown-question');
  expect(screen.getByRole('heading', { name: 'React question not found' })).toBeTruthy();
  fireEvent.click(screen.getByRole('link', { name: 'View all React questions' }));
  expect(screen.getByRole('heading', { name: 'React questions', level: 1 })).toBeTruthy();
});

it('restores list position, search, and sorting through the All React questions link', () => {
  const scroll = mockScrolling();
  showPage();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'GreatFrontEnd' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Sort by' }), { target: { value: 'hard-first' } });
  const section = screen.getByRole('region', { name: 'GreatFrontEnd React' });
  const titles = within(section).getAllByRole('heading', { level: 3 }).map(node => node.textContent);
  // Capture the current position on click even before a scroll event is delivered.
  scroll(1920, 12, false);
  fireEvent.click(within(section).getAllByRole('link')[0]);
  expect(window.scrollY).toBe(0);
  expect(window.scrollX).toBe(0);
  fireEvent.click(screen.getByRole('link', { name: '← All React questions' }));
  expect(window.scrollY).toBe(1920);
  expect(window.scrollX).toBe(12);
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('GreatFrontEnd');
  expect((screen.getByRole('combobox', { name: 'Sort by' }) as HTMLSelectElement).value).toBe('hard-first');
  expect(within(screen.getByRole('region', { name: 'GreatFrontEnd React' })).getAllByRole('heading', { level: 3 }).map(node => node.textContent)).toEqual(titles);
});

it('keeps detail scrolling and next/previous navigation from replacing the list position', () => {
  const scroll = mockScrolling();
  showPage();
  scroll(3200);
  fireEvent.click(screen.getByRole('link', { name: /Item List Manager/ }));
  scroll(700);
  fireEvent.click(screen.getByRole('link', { name: 'Code Review Feedback →' }));
  expect(window.scrollY).toBe(0);
  scroll(1500);
  fireEvent.click(screen.getByRole('link', { name: '← Item List Manager' }));
  expect(window.scrollY).toBe(0);
  scroll(900);
  fireEvent.click(screen.getAllByRole('link', { name: '← All React questions' })[0]);
  expect(window.scrollY).toBe(3200);
});

it('restores the latest list position through browser history back and forward', () => {
  const scroll = mockScrolling();
  showPage('/hackerrank-react', { historyControls: true });
  scroll(2500);
  fireEvent.click(screen.getByRole('link', { name: /Referral Credits/ }));
  scroll(600);
  fireEvent.click(screen.getByRole('button', { name: 'History back' }));
  expect(screen.getByRole('heading', { name: 'React questions', level: 1 })).toBeTruthy();
  expect(window.scrollY).toBe(2500);
  // History navigation has no card click, so this position comes from the scroll listener.
  scroll(4100);
  fireEvent.click(screen.getByRole('button', { name: 'History forward' }));
  expect(screen.getByRole('heading', { name: 'Referral Credits', level: 1 })).toBeTruthy();
  expect(window.scrollY).toBe(0);
  scroll(1200);
  fireEvent.click(screen.getByRole('button', { name: 'History back' }));
  expect(window.scrollY).toBe(4100);
});

it('starts a directly opened detail and its list at the top and restores browser ownership on unmount', () => {
  const scroll = mockScrolling();
  scroll(900);
  const page = showPage('/hackerrank-react/suno-referral-credits', { strict: true });
  expect(window.history.scrollRestoration).toBe('manual');
  expect(window.scrollY).toBe(0);
  scroll(1600);
  fireEvent.click(screen.getByRole('link', { name: '← All React questions' }));
  expect(window.scrollY).toBe(0);
  page.unmount();
  expect(window.history.scrollRestoration).toBe('auto');
});

import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CatalogProblemContent from './CatalogProblemContent';
import type { CatalogDocument } from '../data/catalog';
import { useProgrammingLanguage } from '../hooks/useProgrammingLanguage';

vi.mock('../data/catalog', () => ({ catalogDocumentUrl: (id: number) => `/leetcode/catalog/test/${id}.json` }));
beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function document(id: number): CatalogDocument {
  return {
    id, title: `Problem ${id}`, originalUrl: `https://leetcode.com/problems/problem-${id}/`,
    descriptionHtml: `<p>Statement ${id}</p><table><tbody><tr><th>Input</th><td>123</td></tr></tbody></table><script>window.bad=true</script><img src="example.png" onerror="window.bad=true">`,
    approachTitle: 'Count and compare', explanationMarkdown: 'Count each item once. The total is $n + 1$.\n\n- Keep a running count.\n- Return the count.',
    implementationRelationship: 'matching',
    solutions: [
      { language: 'python', label: 'Python', code: 'def answer(items):\n    return len(items)', sourceId: 'source' },
      { language: 'sql', label: 'SQL', code: 'SELECT COUNT(*) FROM items;', sourceId: 'source' },
    ],
    sources: [{ id: 'source', name: 'Credited author', url: 'https://example.com/source', license: 'MIT', licenseUrl: 'https://example.com/license' }],
  };
}

function PreferenceControl() {
  const [language, setLanguage] = useProgrammingLanguage();
  return <div>
    <output aria-label="Shared preference">{language}</output>
    <button onClick={() => setLanguage('javascript')}>Use JavaScript elsewhere</button>
    <button onClick={() => setLanguage('python')}>Use Python elsewhere</button>
  </div>;
}

function multilingualDocument(id: number): CatalogDocument {
  const data = document(id);
  data.solutions.push(
    { language: 'javascript', label: 'JavaScript', code: 'function answer(items) { return items.length; }', sourceId: 'source' },
    { language: 'typescript', label: 'TypeScript', code: 'function answer(items: number[]): number { return items.length; }', sourceId: 'source' },
  );
  return data;
}

it('loads one complete document, renders tables/math/code, and retains safe attribution', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => document(4001) });
  vi.stubGlobal('fetch', fetcher);
  const page = render(<CatalogProblemContent id={4001}/>);
  await screen.findByText('Statement 4001');
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher).toHaveBeenCalledWith('/leetcode/catalog/test/4001.json');
  expect(screen.getByRole('cell', { name: '123' })).toBeTruthy();
  expect(page.container.querySelector('.katex')).toBeTruthy();
  expect(page.container.querySelector('script')).toBeNull();
  expect(page.container.querySelector('img')?.getAttribute('onerror')).toBeNull();
  expect(page.container.querySelector('img')?.getAttribute('loading')).toBe('lazy');
  expect(page.container.querySelector('pre code')?.textContent).toContain('def answer');
  fireEvent.change(screen.getByRole('combobox', { name: 'Solution language' }), { target: { value: '1' } });
  expect(page.container.querySelector('pre code')?.textContent).toContain('SELECT COUNT');
  fireEvent.click(screen.getByText('Sources and licenses'));
  expect(screen.getByRole('link', { name: 'Credited author' }).getAttribute('href')).toBe('https://example.com/source');
});

it('clears an old problem during navigation and ignores its late response', async () => {
  let resolveOld!: (value: unknown) => void;
  let resolveNew!: (value: unknown) => void;
  vi.stubGlobal('fetch', vi.fn()
    .mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
    .mockImplementationOnce(() => new Promise(resolve => { resolveNew = resolve; })));
  const page = render(<CatalogProblemContent id={4002}/>);
  page.rerender(<CatalogProblemContent id={4003}/>);
  resolveOld({ ok: true, json: async () => document(4002) });
  await waitFor(() => expect(screen.queryByText('Statement 4002')).toBeNull());
  resolveNew({ ok: true, json: async () => document(4003) });
  await screen.findByText('Statement 4003');
  expect(screen.queryByText('Statement 4002')).toBeNull();
});

it('provides a working retry after a failed document request', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => document(4004) });
  vi.stubGlobal('fetch', fetcher);
  render(<CatalogProblemContent id={4004}/>);
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await screen.findByText('Statement 4004');
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('loads the shared language, puts JavaScript before Python, and shares binary selections', async () => {
  localStorage.setItem('lc-language', JSON.stringify('javascript'));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => multilingualDocument(4010) }));
  const page = render(<><PreferenceControl/><CatalogProblemContent id={4010}/></>);
  await screen.findByText('Statement 4010');
  const selector = screen.getByRole('combobox', { name: 'Solution language' }) as HTMLSelectElement;
  expect(selector.value).toBe('2');
  expect([...selector.options].map(option => [option.label, option.value])).toEqual([
    ['JavaScript', '2'], ['Python', '0'], ['SQL', '1'], ['TypeScript', '3'],
  ]);
  expect(page.container.querySelector('pre code')?.className).toContain('language-javascript');
  fireEvent.change(selector, { target: { value: '0' } });
  expect(screen.getByLabelText('Shared preference').textContent).toBe('python');
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('python');
  expect(page.container.querySelector('pre code')?.className).toContain('language-python');
  fireEvent.change(selector, { target: { value: '2' } });
  expect(screen.getByLabelText('Shared preference').textContent).toBe('javascript');
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('javascript');
});

it('keeps other language choices local and follows later shared changes in both directions', async () => {
  localStorage.setItem('lc-language', JSON.stringify('python'));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => multilingualDocument(4011) }));
  const page = render(<><PreferenceControl/><CatalogProblemContent id={4011}/></>);
  await screen.findByText('Statement 4011');
  const selector = screen.getByRole('combobox', { name: 'Solution language' }) as HTMLSelectElement;
  expect(selector.value).toBe('0');
  fireEvent.change(selector, { target: { value: '1' } });
  expect(page.container.querySelector('pre code')?.className).toContain('language-sql');
  expect(screen.getByLabelText('Shared preference').textContent).toBe('python');
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('python');
  fireEvent.click(screen.getByRole('button', { name: 'Use JavaScript elsewhere' }));
  expect(selector.value).toBe('2');
  fireEvent.click(screen.getByRole('button', { name: 'Use Python elsewhere' }));
  expect(selector.value).toBe('0');
  fireEvent.change(selector, { target: { value: '3' } });
  expect(page.container.querySelector('pre code')?.className).toContain('language-typescript');
  expect(screen.getByLabelText('Shared preference').textContent).toBe('python');
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('python');
});

it('falls back honestly when a language is unavailable without changing the shared preference', async () => {
  localStorage.setItem('lc-language', JSON.stringify('javascript'));
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => document(4012) })
    .mockResolvedValueOnce({ ok: true, json: async () => multilingualDocument(4013) }));
  const page = render(<><PreferenceControl/><CatalogProblemContent id={4012}/></>);
  await screen.findByRole('heading', { name: 'Solution · Python' });
  expect(screen.getByLabelText('Shared preference').textContent).toBe('javascript');
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('javascript');
  fireEvent.change(screen.getByRole('combobox', { name: 'Solution language' }), { target: { value: '1' } });
  await screen.findByRole('heading', { name: 'Solution · SQL' });
  page.rerender(<><PreferenceControl/><CatalogProblemContent id={4013}/></>);
  await screen.findByRole('heading', { name: 'Solution · JavaScript' });
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('javascript');
});

it('retains all choices and exact labels in a catalog document with neither shared language', async () => {
  localStorage.setItem('lc-language', JSON.stringify('javascript'));
  const data = document(4014);
  data.solutions = [
    { language: 'cpp', label: 'GNU C++20', code: 'int answer() { return 1; }', sourceId: 'source' },
    { language: 'bash', label: 'Bash', code: 'echo 1', sourceId: 'source' },
  ];
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data }));
  render(<><PreferenceControl/><CatalogProblemContent id={4014}/></>);
  await screen.findByRole('heading', { name: 'Solution · GNU C++20' });
  const selector = screen.getByRole('combobox', { name: 'Solution language' }) as HTMLSelectElement;
  expect([...selector.options].map(option => option.label)).toEqual(['GNU C++20', 'Bash']);
  fireEvent.click(screen.getByRole('button', { name: 'Use Python elsewhere' }));
  expect(selector.value).toBe('0');
  fireEvent.change(selector, { target: { value: '1' } });
  await screen.findByRole('heading', { name: 'Solution · Bash' });
  expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('python');
});

it('uses the latest preference when it changes during the document request', async () => {
  localStorage.setItem('lc-language', JSON.stringify('python'));
  let resolveDocument!: (value: unknown) => void;
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(resolve => { resolveDocument = resolve; })));
  render(<><PreferenceControl/><CatalogProblemContent id={4015}/></>);
  fireEvent.click(screen.getByRole('button', { name: 'Use JavaScript elsewhere' }));
  resolveDocument({ ok: true, json: async () => multilingualDocument(4015) });
  await screen.findByRole('heading', { name: 'Solution · JavaScript' });
  expect((screen.getByRole('combobox', { name: 'Solution language' }) as HTMLSelectElement).value).toBe('2');
});

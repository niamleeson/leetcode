import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CatalogProblemContent from './CatalogProblemContent';
import type { CatalogDocument } from '../data/catalog';

vi.mock('../data/catalog', () => ({ catalogDocumentUrl: (id: number) => `/leetcode/catalog/test/${id}.json` }));
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

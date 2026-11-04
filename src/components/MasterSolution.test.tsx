import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MasterSolution from './MasterSolution';
import { masterCatalog } from '../data/master-solution/generated/catalog';
import { solutionMap } from '../data/solutions';

beforeEach(() => localStorage.clear());
afterEach(cleanup);
function show(query = '') {
  return render(<MemoryRouter initialEntries={[`/master-solution${query}`]}><MasterSolution /></MemoryRouter>);
}

it('links every audited implementation to its required rule and unit', () => {
  expect(masterCatalog.units).toHaveLength(96);
  expect(masterCatalog.problems).toHaveLength(180);
  const implementations = masterCatalog.problems.flatMap(problem => problem.variants);
  expect(implementations).toHaveLength(193);
  for (const unit of masterCatalog.units) {
    const options = implementations.filter(variant => variant.units.includes(unit.id));
    expect(options.map(variant => variant.key)).toEqual(unit.variantKeys);
    for (const variant of options) {
      const source = variant.variant ? solutionMap[variant.problemId].followUp : solutionMap[variant.problemId];
      expect(source?.jsCode).toBeTruthy();
      expect(variant.rule).toBeTruthy();
    }
  }
});

it('searches by problem number, selects its actual unit, and remembers the unit on a fresh visit', async () => {
  const view = show();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Find a pattern or problem' }), { target: { value: '#435' } });
  const results = screen.getByLabelText('Pattern search results');
  fireEvent.click(within(results).getByRole('button', { name: /I02/ }));
  expect(screen.getByRole('heading', { name: 'Overlap detection and conflict removal' })).toBeTruthy();
  expect((screen.getByRole('combobox', { name: 'Implementation and variation' }) as HTMLSelectElement).value).toBe('435');
  await screen.findByRole('slider', { name: 'Non Overlapping Intervals step' });
  expect(localStorage.getItem('master-solution-last-unit')).toBe(JSON.stringify('I02'));
  view.unmount();
  show();
  expect(screen.getByRole('heading', { name: 'Overlap detection and conflict removal' })).toBeTruthy();
});

it('loads both queue-stack recordings independently and shares the highlight preference', async () => {
  show('?unit=S04&implementation=225-one-queue');
  await screen.findByRole('slider', { name: 'Implement Stack Using Queues · One queue step' });
  expect([...document.querySelectorAll('.traversal-line-content')].map(line => line.textContent).join('\n')).toBe(solutionMap[225].followUp!.jsCode);
  expect(screen.getByText(/Rotate the n previous values/)).toBeTruthy();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Highlight code' }));
  fireEvent.change(screen.getByRole('combobox', { name: 'Implementation and variation' }), { target: { value: '225' } });
  await screen.findByRole('slider', { name: 'Implement Stack Using Queues step' });
  expect([...document.querySelectorAll('.traversal-line-content')].map(line => line.textContent).join('\n')).toBe(solutionMap[225].jsCode);
  expect((screen.getByRole('checkbox', { name: 'Highlight code' }) as HTMLInputElement).checked).toBe(false);
  expect([...document.querySelectorAll('.complexity-equation')].map(item => item.textContent).join('\n')).toContain('O(n)');
});

it('follows a direct link and exposes runnable downloads, scope overlaps, and expanded complexity', async () => {
  show('?unit=TR04&implementation=2707');
  expect(screen.getByRole('heading', { name: 'Dictionary segmentation dynamic programming' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Download complete JavaScript' }).getAttribute('download')).toBe('delivery-control.mjs');
  await screen.findByRole('slider', { name: 'Extra Characters in a String step' });
  expect(screen.getByText(/Dynamic programming: prefix segmentation table/)).toBeTruthy();
  expect(document.querySelector('.complexity-equation')?.textContent).toContain('=');
  expect(screen.getByRole('link', { name: 'LeetCode ↗' }).getAttribute('href')).toContain('/extra-characters-in-a-string/');
});

it('recovers from stale unit and implementation links without showing an unrelated alternative', async () => {
  show('?unit=missing&implementation=225-one-queue');
  expect(screen.getByRole('heading', { name: 'Sequential scanning and compaction' })).toBeTruthy();
  await screen.findByRole('slider', { name: 'Concatenation of Array step' });
  expect((screen.getByRole('combobox', { name: 'Implementation and variation' }) as HTMLSelectElement).value).toBe('1929');
});

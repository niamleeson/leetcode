import * as React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  cleanup();
  localStorage.clear();
  vi.resetModules();
  // Reload the preference module to model a fresh page without loading a
  // second React instance alongside Testing Library's renderer.
  vi.doMock('react', () => React);
});
afterEach(() => { cleanup(); vi.doUnmock('react'); });

async function show(names = ['Page A', 'Page B']) {
  const api = await import('./useProgrammingLanguage');
  function Consumer({ name }: { name: string }) {
    const [language, setLanguage] = api.useProgrammingLanguage();
    return <section aria-label={name}>
      <output aria-label={name + ' language'}>{language}</output>
      <button onClick={() => setLanguage('javascript')}>JavaScript on {name}</button>
      <button onClick={() => setLanguage('python')}>Python on {name}</button>
    </section>;
  }
  return { ...render(<>{names.map(name => <Consumer key={name} name={name} />)}</>), api };
}

function expectLanguage(language: 'javascript' | 'python', names = ['Page A', 'Page B']) {
  for (const name of names) expect(screen.getByLabelText(name + ' language').textContent).toBe(language);
}

describe('the shared programming language preference', () => {
  it('defaults to JavaScript and updates every mounted consumer from either page', async () => {
    await show();
    expectLanguage('javascript');
    fireEvent.click(screen.getByRole('button', { name: 'Python on Page A' }));
    expectLanguage('python');
    expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('python');
    fireEvent.click(screen.getByRole('button', { name: 'JavaScript on Page B' }));
    expectLanguage('javascript');
    expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('javascript');
  });

  it('retains the selected language when one page unmounts and another page opens', async () => {
    const first = await show(['Page A']);
    fireEvent.click(screen.getByRole('button', { name: 'Python on Page A' }));
    first.unmount();
    await show(['Page C']);
    expectLanguage('python', ['Page C']);
  });

  it('supports the named setter outside a consumer and persists its change', async () => {
    const { api } = await show();
    act(() => api.setProgrammingLanguage('python'));
    expectLanguage('python');
    expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('python');
  });

  it('observes another tab changing or clearing the shared preference', async () => {
    await show();
    act(() => {
      localStorage.setItem('lc-language', JSON.stringify('python'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'lc-language', newValue: JSON.stringify('python'), storageArea: localStorage }));
    });
    expectLanguage('python');
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }));
    });
    expectLanguage('javascript');
  });

  it('restores the older NeetCode 250 preference when no global preference exists', async () => {
    localStorage.setItem('nc250-language', JSON.stringify('python'));
    await show();
    expectLanguage('python');
  });

  it.each(['python', 'javascript'] as const)('gives the global %s preference precedence over old page preferences', async language => {
    localStorage.setItem('lc-language', JSON.stringify(language));
    localStorage.setItem('nc250-language', JSON.stringify(language === 'python' ? 'javascript' : 'python'));
    localStorage.setItem('nc150-language', JSON.stringify(language === 'python' ? 'javascript' : 'python'));
    await show();
    expectLanguage(language);
  });

  it('uses one fixed priority for older NeetCode preferences on every page', async () => {
    localStorage.setItem('nc250-language', JSON.stringify('javascript'));
    localStorage.setItem('nc150-language', JSON.stringify('python'));
    localStorage.setItem('nc75-language', JSON.stringify('python'));
    await show();
    expectLanguage('javascript');
  });

  it('falls back to the next valid old preference when the global and 250 values are invalid', async () => {
    localStorage.setItem('lc-language', '{invalid');
    localStorage.setItem('nc250-language', JSON.stringify('unsupported'));
    localStorage.setItem('nc150-language', JSON.stringify('python'));
    localStorage.setItem('nc75-language', JSON.stringify('javascript'));
    await show();
    expectLanguage('python');
  });

  it('uses the NeetCode 75 preference when newer preference keys are absent', async () => {
    localStorage.setItem('nc75-language', JSON.stringify('python'));
    await show();
    expectLanguage('python');
  });
});

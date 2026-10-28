import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NeetCodeTopic } from '../data/neetcode250';
import NeetCodeView from './NeetCodeView';

const topics: NeetCodeTopic[] = ['Arrays', 'Trees'].map(name => ({
  name,
  problems: [],
  templates: [{
    id: name.toLowerCase(),
    name: `${name} template`,
    mnemonic: `${name} pattern`,
    pseudocode: `${name} pseudocode`,
    python: `${name} Python code`,
    javascript: `${name} JavaScript code`,
    problemIds: [],
  }],
}));

function showPage(storagePrefix = 'nc250') {
  return render(
    <MemoryRouter>
      <NeetCodeView topics={topics} storagePrefix={storagePrefix} title="NeetCode" description="Templates" />
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('shared template tab preference', () => {
  it('syncs open and newly opened topics, survives remounting, and follows the chosen language', () => {
    let page = showPage();
    fireEvent.click(screen.getByRole('button', { name: /^Arrays 1 template/ }));
    fireEvent.click(screen.getByRole('button', { name: 'JavaScript', pressed: false }));
    expect(JSON.parse(localStorage.getItem('nc250-template-tab')!)).toBe('code');

    fireEvent.click(screen.getByRole('button', { name: /^Trees 1 template/ }));
    expect(screen.getAllByRole('button', { name: 'JavaScript', pressed: true })).toHaveLength(2);

    page.unmount();
    page = showPage();
    expect(screen.getAllByRole('button', { name: 'JavaScript', pressed: true })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Python' }));
    expect(screen.getAllByRole('button', { name: 'Python', pressed: true })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Pseudocode (memorize)' })[1]);
    expect(screen.getAllByRole('button', { name: 'Pseudocode (memorize)', pressed: true })).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem('nc250-template-tab')!)).toBe('pseudocode');
    page.unmount();
    showPage();
    expect(screen.getAllByRole('button', { name: 'Pseudocode (memorize)', pressed: true })).toHaveLength(2);
  });

  it('keeps the preference scoped to its page', () => {
    localStorage.setItem('nc250-template-tab', JSON.stringify('code'));
    showPage('nc150');
    fireEvent.click(screen.getByRole('button', { name: /^Arrays 1 template/ }));
    expect(screen.getByRole('button', { name: 'Pseudocode (memorize)', pressed: true })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('nc250-template-tab')!)).toBe('code');
  });
});

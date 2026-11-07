import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../data/logic', () => {
  const problem = {
    id: 1, title: 'Two Sum', topic: 'Arrays', difficulty: 'Easy',
    description: 'Find two indices.', examples: [], starter: 'def twoSum(nums, target):\n    pass',
    parameters: [], interfaces: [], fixtures: [],
    validation: { kind: 'practice-cases', count: 0, adversarialCount: 0 },
  };
  return { logicManifest: [problem], hasLogicProblem: (id: number) => id === 1, loadLogicProblem: async () => problem };
});
vi.mock('./GuidedPractice', () => {
  function Toggle({ language, onChange }: { language: string; onChange: (value: 'javascript' | 'python') => void }) {
    return <div><output aria-label="Practice language">{language}</output>
      <button onClick={() => onChange('javascript')}>Use JavaScript in practice</button>
      <button onClick={() => onChange('python')}>Use Python in practice</button>
    </div>;
  }
  return {
    LanguageToggle: Toggle,
    default: ({ language, onLanguageChange }: { language: string; onLanguageChange: (value: 'javascript' | 'python') => void }) => <Toggle language={language} onChange={onLanguageChange} />,
  };
});

beforeEach(() => {
  cleanup();
  localStorage.clear();
  vi.resetModules();
  vi.doMock('react', () => React);
});
afterEach(() => { cleanup(); vi.doUnmock('react'); });

async function show(entries: string[]) {
  const { default: LogicPractice } = await import('./LogicPractice');
  const { useProgrammingLanguage } = await import('../../hooks/useProgrammingLanguage');
  const { MemoryRouter, Routes, Route, useLocation, useNavigate } = await import('react-router-dom');
  function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const [language, setLanguage] = useProgrammingLanguage();
    return <>
      <output aria-label="Shared language">{language}</output>
      <output aria-label="Current URL">{location.pathname + location.search}</output>
      <button onClick={() => setLanguage('javascript')}>Use JavaScript elsewhere</button>
      <button onClick={() => setLanguage('python')}>Use Python elsewhere</button>
      <button onClick={() => navigate('/other')}>Open another page</button>
      <button onClick={() => navigate(-1)}>Go back</button>
      <Routes>
        <Route path="/practice" element={<LogicPractice />} />
        <Route path="/practice/:id" element={<LogicPractice />} />
        <Route path="/other" element={<p>Another page</p>} />
      </Routes>
    </>;
  }
  return render(<MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}><App /></MemoryRouter>);
}

describe('practice routes use the shared programming language', () => {
  it('consumes an old language URL once, preserves other parameters, and cannot restore it through Back', async () => {
    localStorage.setItem('lc-language', JSON.stringify('javascript'));
    await show(['/other', '/practice/1?language=python&section=example']);
    await waitFor(() => expect(screen.getByLabelText('Practice language').textContent).toBe('python'));
    expect(screen.getByLabelText('Shared language').textContent).toBe('python');
    expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('python');
    expect(screen.getByLabelText('Current URL').textContent).toBe('/practice/1?section=example');

    fireEvent.click(screen.getByRole('button', { name: 'Use JavaScript elsewhere' }));
    expect(screen.getByLabelText('Practice language').textContent).toBe('javascript');
    fireEvent.click(screen.getByRole('button', { name: 'Open another page' }));
    await screen.findByText('Another page');
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    await waitFor(() => expect(screen.getByLabelText('Practice language').textContent).toBe('javascript'));
    expect(screen.getByLabelText('Current URL').textContent).toBe('/practice/1?section=example');
    expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('javascript');
  });

  it('keeps the global preference for an invalid URL value and shares later practice changes', async () => {
    localStorage.setItem('lc-language', JSON.stringify('python'));
    await show(['/practice/1?language=unknown&section=example']);
    await waitFor(() => expect(screen.getByLabelText('Practice language').textContent).toBe('python'));
    expect(screen.getByLabelText('Current URL').textContent).toBe('/practice/1?section=example');
    fireEvent.click(screen.getByRole('button', { name: 'Use JavaScript in practice' }));
    expect(screen.getByLabelText('Shared language').textContent).toBe('javascript');
    expect(JSON.parse(localStorage.getItem('lc-language')!)).toBe('javascript');
    expect(screen.getByLabelText('Current URL').textContent).not.toContain('language=');
  });

  it('uses the shared language in the library without freezing it into new problem links', async () => {
    localStorage.setItem('lc-language', JSON.stringify('python'));
    await show(['/practice']);
    expect(screen.getByLabelText('Practice language').textContent).toBe('python');
    const problemLinks = screen.getAllByRole('link').filter(link => link.getAttribute('href')?.startsWith('/practice/1'));
    expect(problemLinks.length).toBeGreaterThan(0);
    for (const link of problemLinks) expect(link.getAttribute('href')).toBe('/practice/1');
    fireEvent.click(screen.getByRole('button', { name: 'Use JavaScript elsewhere' }));
    expect(screen.getByLabelText('Practice language').textContent).toBe('javascript');
  });
});

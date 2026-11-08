import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProblemNavigation from './ProblemNavigation';
import { orderedLogicProblems } from '../../data/logic/order';

afterEach(cleanup);
function show(id: number, language: 'python' | 'javascript' = 'javascript') {
  return render(<MemoryRouter><ProblemNavigation id={id} language={language}/></MemoryRouter>);
}

describe('neighboring practice problems use the library order', () => {
  it('keeps all 250 unique problems and starts with the common Easy problems', () => {
    expect(orderedLogicProblems).toHaveLength(250);
    expect(new Set(orderedLogicProblems.map(problem => problem.id)).size).toBe(250);
    expect(orderedLogicProblems.slice(0, 6).map(problem => problem.id)).toEqual([1, 14, 20, 21, 26, 27]);
    show(1);
    expect((screen.getByRole('button', { name: 'Previous problem' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('link', { name: /Next problem.*#14/ }).getAttribute('href')).toBe('/practice/14?language=javascript');
  });

  it.each(['python', 'javascript'] as const)('crosses into the four later topics in %s while keeping the language', language => {
    const view = show(2709, language);
    expect(screen.getByRole('link', { name: /Next problem.*#13/ }).getAttribute('href')).toBe(`/practice/13?language=${language}`);
    view.rerender(<MemoryRouter><ProblemNavigation id={13} language={language}/></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Previous problem.*#2709/ }).getAttribute('href')).toBe(`/practice/2709?language=${language}`);
    expect(screen.getByRole('link', { name: /Next problem.*#66/ }).getAttribute('href')).toBe(`/practice/66?language=${language}`);
  });

  it('does not wrap past the final problem or navigate from an unknown ID', () => {
    expect(orderedLogicProblems[orderedLogicProblems.length - 1].id).toBe(1406);
    const view = show(1406);
    expect((screen.getByRole('button', { name: 'Next problem' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('link', { name: /Previous problem.*#329/ })).toBeTruthy();
    view.rerender(<MemoryRouter><ProblemNavigation id={-1} language="python"/></MemoryRouter>);
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});

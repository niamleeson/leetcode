import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useProblemSolution } from '../../hooks/useProblemSolution';
import { loadSolution } from '../../data/solutions/lazy';
import type { ProblemSolution } from '../../data/solutions/types';

vi.mock('../../data/solutions/lazy', () => ({
  hasSolution: (id: number) => id === 1 || id === 2,
  loadSolution: vi.fn(),
}));

function Probe({ id }: { id?: number }) {
  const { solution, loading, error, retry } = useProblemSolution(id);
  return <div>
    {loading && <p>Loading</p>}
    {solution && <p>{solution.code}</p>}
    {error && <button onClick={retry}>Retry</button>}
  </div>;
}

const solution = (id: number) => ({ id, code: `Solution ${id}` } as ProblemSolution);
beforeEach(() => { vi.mocked(loadSolution).mockReset(); });
afterEach(cleanup);

it('does not request missing IDs and ignores old responses after navigating to another problem', async () => {
  let first!: (value: ProblemSolution) => void;
  let second!: (value: ProblemSolution) => void;
  vi.mocked(loadSolution).mockImplementation(id => new Promise(resolve => {
    if (id === 1) first = resolve;
    else second = resolve;
  }));
  const page = render(<Probe/>);
  expect(loadSolution).not.toHaveBeenCalled();
  page.rerender(<Probe id={99}/>);
  expect(loadSolution).not.toHaveBeenCalled();
  page.rerender(<Probe id={1}/>);
  expect(loadSolution).toHaveBeenCalledWith(1);
  page.rerender(<Probe id={2}/>);
  expect(loadSolution).toHaveBeenCalledWith(2);
  await act(async () => second(solution(2)));
  expect(screen.getByText('Solution 2')).toBeTruthy();
  await act(async () => first(solution(1)));
  expect(screen.queryByText('Solution 1')).toBeNull();
  expect(screen.getByText('Solution 2')).toBeTruthy();
});

it('clears the old solution immediately and can retry a failed request', async () => {
  vi.mocked(loadSolution).mockResolvedValueOnce(solution(1)).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(solution(2));
  const page = render(<Probe id={1}/>);
  await screen.findByText('Solution 1');
  page.rerender(<Probe id={2}/>);
  expect(screen.queryByText('Solution 1')).toBeNull();
  fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Solution 2')).toBeTruthy();
  expect(loadSolution).toHaveBeenCalledTimes(3);
});

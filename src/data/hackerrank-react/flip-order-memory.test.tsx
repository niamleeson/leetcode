import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import source from './games/flip-order-memory.jsx?raw';
import { loadSolution } from './greatfrontend/testUtils';

const { default: Game, createSequence } = loadSolution(source);
const cell = (index: number) => screen.getByRole('button', {
  name: `Row ${Math.floor(index / 4) + 1} column ${index % 4 + 1}`,
});
const cells = () => screen.getAllByRole('button', { name: /^Row / });
const advance = (milliseconds: number) => act(() => vi.advanceTimersByTime(milliseconds));
function randomFor(...positions: number[]) {
  let cursor = 0;
  return () => positions[cursor++ % positions.length] / 16;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Flip Order Memory', () => {
  it('generates four valid positions and permits repeated flips', () => {
    expect(createSequence(() => 0)).toEqual([0, 0, 0, 0]);
    expect(createSequence(() => 1 - Number.EPSILON)).toEqual([15, 15, 15, 15]);
    expect(createSequence(randomFor(0, 5, 5, 15))).toEqual([0, 5, 5, 15]);
  });

  it('shows the flip order with blank gaps, including a repeated cell, before accepting input', () => {
    vi.useFakeTimers();
    render(<Game random={randomFor(0, 5, 5, 15)} />);
    expect(cells()).toHaveLength(16);
    for (const button of cells()) expect(button).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    advance(0);
    expect(cell(0)).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(cell(0));
    expect(screen.getByRole('status')).toHaveTextContent('Watch the four flips.');
    advance(500);
    for (const button of cells()) expect(button).toHaveAttribute('aria-pressed', 'false');
    advance(300);
    expect(cell(5)).toHaveAttribute('aria-pressed', 'true');
    advance(500);
    expect(cell(5)).toHaveAttribute('aria-pressed', 'false');
    advance(300);
    expect(cell(5)).toHaveAttribute('aria-pressed', 'true');
    advance(800);
    expect(cell(15)).toHaveAttribute('aria-pressed', 'true');
    advance(799);
    expect(cell(15)).toBeDisabled();
    advance(1);
    expect(screen.getByRole('status')).toHaveTextContent('Your turn: choose flip 1 of 4.');
    for (const button of cells()) {
      expect(button).toBeEnabled();
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('checks each chosen position, accepts repeats, and completes after four correct flips', () => {
    vi.useFakeTimers();
    render(<Game random={randomFor(0, 5, 5, 15)} />);
    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    advance(3200);
    for (const [step, position] of [0, 5, 5, 15].entries()) {
      fireEvent.click(cell(position));
      expect(screen.getByRole('status')).toHaveTextContent(step === 3
        ? 'Correct order! All four flips remembered.'
        : `Correct! Choose flip ${step + 2} of 4.`);
    }
    for (const button of cells()) expect(button).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    expect(screen.getByRole('status')).toHaveTextContent('Watch the four flips.');
    advance(3200);
    expect(screen.getByRole('status')).toHaveTextContent('Your turn: choose flip 1 of 4.');
    fireEvent.click(cell(0));
    expect(screen.getByRole('status')).toHaveTextContent('Correct! Choose flip 2 of 4.');
  });

  it('stops at the first wrong choice and resets partial progress for a new round', () => {
    vi.useFakeTimers();
    render(<Game random={randomFor(0, 5, 5, 15)} />);
    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    advance(3200);
    fireEvent.click(cell(0));
    fireEvent.click(cell(1));
    expect(screen.getByRole('status')).toHaveTextContent('Wrong order at flip 2. Start a new round.');
    for (const button of cells()) expect(button).toBeDisabled();
    fireEvent.click(cell(5));
    expect(screen.getByRole('status')).toHaveTextContent('Wrong order at flip 2.');

    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    advance(3200);
    fireEvent.click(cell(0));
    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    advance(3200);
    expect(screen.getByRole('status')).toHaveTextContent('Your turn: choose flip 1 of 4.');
  });

  it('cancels the old playback when a new round starts halfway through it', () => {
    vi.useFakeTimers();
    render(<Game random={randomFor(0, 1, 2, 3, 12, 13, 14, 15)} />);
    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    advance(400);
    expect(cell(0)).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    advance(0);
    expect(cell(12)).toHaveAttribute('aria-pressed', 'true');
    advance(100); // The old round would hide its first flip now.
    expect(cell(12)).toHaveAttribute('aria-pressed', 'true');
    advance(300); // The old round would reveal its second cell now.
    expect(cell(12)).toHaveAttribute('aria-pressed', 'true');
    expect(cell(1)).toHaveAttribute('aria-pressed', 'false');
    advance(2400); // The old round would enable input now, 400 ms too soon.
    expect(screen.getByRole('status')).toHaveTextContent('Watch the four flips.');
    for (const button of cells()) expect(button).toBeDisabled();
    advance(400);
    expect(screen.getByRole('status')).toHaveTextContent('Your turn: choose flip 1 of 4.');
    for (const position of [12, 13, 14, 15]) fireEvent.click(cell(position));
    expect(screen.getByRole('status')).toHaveTextContent('Correct order!');
  });

  it('clears pending playback timers when unmounted', () => {
    vi.useFakeTimers();
    const { unmount } = render(<Game random={() => 0} />);
    fireEvent.click(screen.getByRole('button', { name: 'New round' }));
    advance(300);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

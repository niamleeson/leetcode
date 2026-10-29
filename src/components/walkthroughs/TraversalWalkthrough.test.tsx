import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { orangeTraceExamples, treeTraceExamples } from '../../data/walkthroughs/traversals';
import TreeWalkthrough from './TreeWalkthrough';
import OrangesWalkthrough from './OrangesWalkthrough';

afterEach(cleanup);

describe('interactive traversal walkthroughs', () => {
  it('renders a missing child without changing the queue, supports Back and Next, and resets', () => {
    render(<TreeWalkthrough />);
    const noopIndex = treeTraceExamples[0].steps.findIndex(step => step.noop);
    const slider = screen.getByRole('slider', { name: 'Level order traversal step' });
    fireEvent.change(slider, { target: { value: String(noopIndex) } });
    const queue = screen.getByRole('list', { name: 'Queue, front to back' }).textContent;
    expect(screen.getByRole('status').textContent).toContain('NOOP');
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Checking left child: null');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('status').textContent).toContain('Append 2');
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(screen.getByRole('list', { name: 'Queue, front to back' }).textContent).toBe(queue);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect((slider as HTMLInputElement).value).toBe('0');
    expect((screen.getByRole('button', { name: 'Back' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows out-of-bounds checks, then resets when changing the graph example', () => {
    render(<OrangesWalkthrough />);
    const outsideIndex = orangeTraceExamples[0].steps.findIndex(step => step.title.includes('outside grid'));
    const slider = screen.getByRole('slider', { name: 'Rotting oranges step' });
    fireEvent.change(slider, { target: { value: String(outsideIndex) } });
    expect(screen.getByRole('status').textContent).toContain('NOOP');
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Checking (-1,0), outside grid');
    expect(screen.getByLabelText('Fresh oranges: 2')).toBeTruthy();

    fireEvent.change(screen.getByRole('combobox', { name: 'Rotting oranges example' }), { target: { value: '2' } });
    expect((slider as HTMLInputElement).value).toBe('0');
    fireEvent.change(slider, { target: { value: String(orangeTraceExamples[2].steps.length - 1) } });
    expect(screen.getByLabelText('Answer: -1')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Next →' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

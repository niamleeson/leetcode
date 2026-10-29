import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { orangeTraceExamples, treeTraceExamples } from '../../data/walkthroughs/traversals';
import TreeWalkthrough from './TreeWalkthrough';
import OrangesWalkthrough from './OrangesWalkthrough';

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function activeCode(region: HTMLElement) {
  return Array.from(region.querySelectorAll('.traversal-source-line[aria-current="step"] .traversal-line-content')).map(line => line.textContent?.trim());
}

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

  it('updates code with the step, Back, Reset, and example selection', () => {
    render(<TreeWalkthrough />);
    const region = screen.getByRole('region', { name: 'Level order traversal walkthrough' });
    expect(activeCode(region)).toEqual(['if (!root) {']);
    const noopIndex = treeTraceExamples[0].steps.findIndex(step => step.noop);
    fireEvent.change(screen.getByRole('slider'), { target: { value: String(noopIndex) } });
    expect(activeCode(region)).toEqual(['if (node.left) {']);
    expect(region.querySelector('.traversal-source-line.is-noop')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(activeCode(region)).toEqual(['currentLevel.push(node.val);']);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(activeCode(region)).toEqual(['if (!root) {']);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(activeCode(region)).toEqual(['if (!root) {', 'return [];']);
  });

  it('shares the highlight toggle, keeps steps independent, and remembers the setting on remount', () => {
    const page = render(<><TreeWalkthrough /><OrangesWalkthrough /></>);
    const tree = screen.getByRole('region', { name: 'Level order traversal walkthrough' });
    const graph = screen.getByRole('region', { name: 'Rotting oranges walkthrough' });
    fireEvent.click(within(tree).getByRole('checkbox', { name: 'Highlight code' }));
    expect(screen.getAllByRole('checkbox').every(toggle => !(toggle as HTMLInputElement).checked)).toBe(true);
    fireEvent.click(within(tree).getByRole('button', { name: 'Next →' }));
    expect(activeCode(tree)).toEqual([]);
    expect(activeCode(graph)).toEqual([]);
    expect(within(tree).getByRole('status').textContent).toContain('Enqueue 1');

    fireEvent.click(within(graph).getByRole('checkbox', { name: 'Highlight code' }));
    expect(activeCode(tree)).toEqual(['const result = [];', 'const queue = [root];']);
    expect(activeCode(graph)).toContain('let freshCount = 0;');
    fireEvent.click(within(graph).getByRole('checkbox', { name: 'Highlight code' }));
    page.unmount();
    render(<><TreeWalkthrough /><OrangesWalkthrough /></>);
    expect(screen.getAllByRole('checkbox').every(toggle => !(toggle as HTMLInputElement).checked)).toBe(true);
    expect(document.querySelectorAll('.traversal-source-line[aria-current="step"]')).toHaveLength(0);
  });

  it('syncs the preference from another browser tab', () => {
    render(<TreeWalkthrough />);
    act(() => {
      localStorage.setItem('neetcode-walkthrough-highlight-code', 'false');
      window.dispatchEvent(new StorageEvent('storage', { key: 'neetcode-walkthrough-highlight-code', newValue: 'false' }));
    });
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  });

  it('still lets highlighting be turned off when storage cannot be written', () => {
    render(<TreeWalkthrough />);
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
    fireEvent.click(screen.getByRole('checkbox'));
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
    write.mockRestore();
    fireEvent.click(screen.getByRole('checkbox'));
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  });
});

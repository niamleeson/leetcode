import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { greatFrontendAdvanced } from './uiAdvanced';
import { loadSolution } from './testUtils';

function exportsFor(slug: string) {
  const challenge = greatFrontendAdvanced.find(item => item.slug === 'gfe-' + slug);
  if (!challenge) throw new Error('Missing challenge ' + slug);
  return loadSolution(challenge.code);
}
function mount(slug: string, props: Record<string, unknown> = {}) {
  const Component = exportsFor(slug).default;
  return render(<Component {...props} />);
}
function click(name: string | RegExp) { fireEvent.click(screen.getByRole('button', { name })); }
function change(label: string, value: string) { fireEvent.change(screen.getByLabelText(label), { target: { value } }); }
function advance(ms: number) { act(() => { vi.advanceTimersByTime(ms); }); }

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('published advanced UI solutions', () => {
  it('contains exactly twenty unique runnable JSX modules', () => {
    expect(greatFrontendAdvanced).toHaveLength(20);
    expect(new Set(greatFrontendAdvanced.map(item => item.slug)).size).toBe(20);
    for (const challenge of greatFrontendAdvanced) {
      expect(challenge.codeLanguage).toBe('jsx');
      expect(loadSolution(challenge.code).default).toBeTypeOf('function');
    }
  });

  it.each(greatFrontendAdvanced.map(item => [item.title, item.code]))('mounts the complete %s demo', (_title, code) => {
    const Component = loadSolution(code).default;
    const page = render(<Component />);
    expect(page.container.textContent?.length).toBeGreaterThan(0);
    page.unmount();
  });

  it('Accordion III keeps panels independent and navigates headers with valid ARIA relationships', () => {
    mount('accordion-iii');
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowUp' });
    expect(buttons[2]).toHaveFocus();
    fireEvent.keyDown(buttons[2], { key: 'Home' });
    expect(buttons[0]).toHaveFocus();
    fireEvent.click(buttons[0]); fireEvent.click(buttons[2]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[2]).toHaveAttribute('aria-expanded', 'true');
    for (const button of [buttons[0], buttons[2]]) {
      const panel = document.getElementById(button.getAttribute('aria-controls')!);
      expect(panel).toBeVisible(); expect(panel).toHaveAttribute('aria-labelledby', button.id);
    }
    expect(screen.queryByRole('region', { name: /Billing/ })).not.toBeInTheDocument();
  });

  it('Auth Code Input distributes pasted digits, preserves zeros and handles corrections', () => {
    const onComplete = vi.fn(); mount('auth-code-input', { onComplete });
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], { clipboardData: { getData: () => '01 23x45' } });
    expect(inputs.map(input => (input as HTMLInputElement).value)).toEqual(['0', '1', '2', '3', '4', '5']);
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('012345');
    expect(inputs[5]).toHaveFocus();
    fireEvent.keyDown(inputs[5], { key: 'Backspace' });
    fireEvent.keyDown(inputs[5], { key: 'Backspace' });
    expect(inputs[4]).toHaveFocus(); expect(inputs[4]).toHaveValue('');
    fireEvent.change(inputs[4], { target: { value: '98' } });
    expect(onComplete).toHaveBeenLastCalledWith('012398');
    fireEvent.keyDown(inputs[5], { key: 'Home' }); expect(inputs[0]).toHaveFocus();
  });

  it('Data Table IV sorts custom accessor values before pagination and combines filters', () => {
    const rows = Object.freeze([{ id: 'a', title: 'Alpha', metrics: { score: 3 } }, { id: 'b', title: 'Beta', metrics: { score: 20 } },
      { id: 'c', title: 'Gamma', metrics: { score: 8 } }, { id: 'd', title: 'Delta', metrics: { score: 1 } }]);
    mount('data-table-iv', { rows, columns: [{ key: 'title', label: 'Title' }, { key: 'score', label: 'Score', accessor: (row: any) => row.metrics.score }] });
    change('Rows per page', '2'); click('Score');
    const names = () => screen.getAllByRole('row').slice(1).map(row => within(row).getAllByRole('cell')[0].textContent);
    expect(names()).toEqual(['Delta', 'Alpha']); click('Next'); expect(names()).toEqual(['Gamma', 'Beta']);
    change('Filter Title', 'beta'); expect(names()).toEqual(['Beta']); expect(screen.getByText('Page 1 of 1')).toBeVisible();
    change('Search all columns', 'missing'); expect(screen.getByText('No matching rows')).toBeVisible();
    expect(rows.map(row => row.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('File Explorer III exposes a flat DOM and supports expand, descend, parent and collapse keys', () => {
    const onOpen = vi.fn(); mount('file-explorer-iii', { onOpen });
    const root = screen.getByRole('treeitem', { name: 'src' }); root.focus();
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(root).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    const app = screen.getByRole('treeitem', { name: 'App.jsx' }); expect(app).toHaveFocus();
    fireEvent.keyDown(app, { key: 'Enter' }); expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'app' }));
    fireEvent.keyDown(app, { key: 'ArrowDown' });
    const assets = screen.getByRole('treeitem', { name: 'assets' }); expect(assets).toHaveFocus();
    fireEvent.keyDown(assets, { key: 'ArrowRight' });
    const tree = screen.getByRole('tree');
    for (const row of screen.getAllByRole('treeitem')) expect(row.parentElement).toBe(tree);
    expect(screen.getByRole('treeitem', { name: 'logo.svg' })).toHaveAttribute('aria-level', '3');
    fireEvent.keyDown(assets, { key: 'ArrowLeft' }); expect(screen.queryByRole('treeitem', { name: 'logo.svg' })).toBeNull();
    fireEvent.keyDown(assets, { key: 'ArrowLeft' }); expect(root).toHaveFocus();
  });

  it('Image Carousel III wraps smoothly with three images and one completion per transition', () => {
    vi.useFakeTimers(); mount('image-carousel-iii');
    expect(document.querySelectorAll('img')).toHaveLength(3);
    click('Previous image'); expect(screen.getByTestId('carousel-track')).toHaveStyle({ transform: 'translateX(0%)' });
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled();
    fireEvent.transitionEnd(screen.getByTestId('carousel-track')); expect(screen.getByText('Image 3 of 3')).toBeVisible();
    advance(500); expect(screen.getByText('Image 3 of 3')).toBeVisible();
    click('Next image'); advance(380); expect(screen.getByText('Image 1 of 3')).toBeVisible();
    expect(document.querySelectorAll('img')).toHaveLength(3);
  });

  it('Modal Dialog IV traps focus and restores the launcher on Escape and backdrop dismissal', () => {
    const page = mount('modal-dialog-iv');
    const dialog = page.container.querySelector('dialog')!;
    dialog.showModal = vi.fn(() => { dialog.open = true; });
    dialog.close = vi.fn(() => { dialog.open = false; });
    const launcher = screen.getByRole('button', { name: 'Edit profile' }); launcher.focus(); fireEvent.click(launcher);
    const first = screen.getByRole('button', { name: 'Close dialog' }); const last = screen.getByRole('button', { name: 'Save' });
    expect(first).toHaveFocus(); expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true }); expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Tab' }); expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'Escape' }); expect(dialog.open).toBe(false); expect(launcher).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
    fireEvent.click(launcher); fireEvent.click(screen.getByLabelText('Display name')); expect(dialog.open).toBe(true);
    fireEvent.click(dialog); expect(dialog.open).toBe(false); expect(launcher).toHaveFocus();
  });

  it('Nested Checkboxes propagates to all descendants and derives mixed ancestor states', () => {
    mount('nested-checkboxes');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Apples' }));
    for (const name of ['Fruit', 'Grocery']) {
      const input = screen.getByRole('checkbox', { name }) as HTMLInputElement;
      expect(input.indeterminate).toBe(true); expect(input).toHaveAttribute('aria-checked', 'mixed');
    }
    fireEvent.click(screen.getByRole('checkbox', { name: 'Grocery' }));
    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fruit' }));
    expect(screen.getByRole('checkbox', { name: 'Bread' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Pears' })).not.toBeChecked();
  });

  it('Pixel Art paints a stroke, ends it outside the grid, erases and clears', () => {
    vi.stubGlobal('PointerEvent', MouseEvent); mount('pixel-art', { size: 3 });
    click('Color #3b82f6'); const first = screen.getByRole('button', { name: 'Pixel 1' });
    fireEvent.pointerDown(first, { button: 0 });
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Pixel 2' }));
    fireEvent.pointerUp(window); fireEvent.pointerEnter(screen.getByRole('button', { name: 'Pixel 3' }));
    expect(first).toHaveStyle({ background: '#3b82f6' });
    expect(screen.getByRole('button', { name: 'Pixel 2' })).toHaveStyle({ background: '#3b82f6' });
    expect(screen.getByRole('button', { name: 'Pixel 3' })).toHaveStyle({ background: '#ffffff' });
    click('Eraser'); fireEvent.click(first); expect(first).toHaveStyle({ background: '#ffffff' });
    click('Clear'); expect(screen.getByRole('button', { name: 'Pixel 2' })).toHaveStyle({ background: '#ffffff' });
  });

  it('Progress Bars IV enforces three slots, promotes queued jobs and preserves paused work', () => {
    vi.useFakeTimers(); mount('progress-bars-iv');
    for (let i = 0; i < 5; i++) click('Add progress bar');
    const progress = () => screen.getAllByRole('progressbar').map(element => Number(element.getAttribute('value')));
    advance(500); expect(progress()).toEqual([25, 25, 25, 0, 0]);
    click('Pause job 1'); advance(500); expect(progress()).toEqual([25, 50, 50, 25, 0]);
    click('Resume job 1'); advance(500); expect(progress()).toEqual([25, 75, 75, 50, 0]);
    click('Pause all'); const frozen = progress(); advance(5000); expect(progress()).toEqual(frozen);
    click('Resume all'); advance(500); expect(progress()).toEqual([25, 100, 100, 75, 0]);
    expect(screen.getByRole('status')).toHaveTextContent('3 running');
    advance(500); expect(progress()).toEqual([50, 100, 100, 100, 25]);
  });

  it('Selectable Cells extends rectangles with the keyboard and supports reverse pointer drag', () => {
    vi.stubGlobal('PointerEvent', MouseEvent); mount('selectable-cells', { rows: 3, columns: 3 });
    const cells = screen.getAllByRole('gridcell'); cells[0].focus();
    fireEvent.keyDown(cells[0], { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(cells[1], { key: 'ArrowDown', shiftKey: true });
    expect(cells.filter(cell => cell.getAttribute('aria-selected') === 'true')).toHaveLength(4);
    const grid = screen.getByRole('grid');
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: 126, bottom: 108, width: 126, height: 108, toJSON() {} });
    fireEvent.pointerDown(cells[8], { button: 0 }); fireEvent.pointerMove(grid, { clientX: 1, clientY: 1 }); fireEvent.pointerUp(grid);
    expect(cells.filter(cell => cell.getAttribute('aria-selected') === 'true')).toHaveLength(9);
    fireEvent.keyDown(cells[8], { key: 'Escape' }); expect(cells.every(cell => cell.getAttribute('aria-selected') === 'false')).toBe(true);
  });

  it('Tabs III separates manual activation, skips disabled tabs and supports vertical navigation', () => {
    mount('tabs-iii', { activation: 'manual', orientation: 'vertical', items: [
      { id: 'a', label: 'Alpha', content: 'Alpha panel' }, { id: 'b', label: 'Beta', content: 'Beta panel', disabled: true },
      { id: 'c', label: 'Gamma', content: 'Gamma panel' },
    ] });
    const first = screen.getByRole('tab', { name: 'Alpha' }), last = screen.getByRole('tab', { name: 'Gamma' });
    first.focus(); fireEvent.keyDown(first, { key: 'ArrowDown' }); expect(last).toHaveFocus();
    expect(first).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(last, { key: 'Enter' }); expect(last).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Gamma panel');
    fireEvent.keyDown(last, { key: 'ArrowDown' }); expect(first).toHaveFocus();
    expect(first).toHaveAttribute('tabindex', '0'); expect(last).toHaveAttribute('tabindex', '-1');
  });

  it('Tic-tac-toe II wins with an off-center M-length diagonal on an N×N board', () => {
    mount('tic-tac-toe-ii', { initialSize: 5, initialTarget: 3 });
    function move(row: number, column: number) { click('Row ' + row + ', column ' + column + ': empty'); }
    move(2, 2); move(1, 1); move(3, 3); move(1, 2); move(4, 4);
    expect(screen.getByRole('status')).toHaveTextContent('X wins');
    for (const cell of within(screen.getByRole('group', { name: 'Game board' })).getAllByRole('button')) expect(cell).toBeDisabled();
    click('Restart'); expect(screen.getByRole('status')).toHaveTextContent('Next player: X');
    expect(within(screen.getByRole('group')).getAllByRole('button')).toHaveLength(25);
  });

  it('Todo List rejects blank tasks and deletes only one duplicate', () => {
    mount('todo-list', { initialTasks: [] }); change('New task', '  '); click('Add task'); expect(screen.getByText('No tasks yet')).toBeVisible();
    for (let i = 0; i < 2; i++) { change('New task', ' Read '); click('Add task'); }
    expect(screen.getByLabelText('New task')).toHaveValue('');
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Read' })[0]); expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('Traffic Light uses each phase duration and clears its timer on unmount', () => {
    vi.useFakeTimers(); const page = mount('traffic-light');
    expect(screen.getByRole('status')).toHaveTextContent('green'); advance(2999); expect(screen.getByRole('status')).toHaveTextContent('green');
    advance(1); expect(screen.getByRole('status')).toHaveTextContent('yellow'); advance(500); expect(screen.getByRole('status')).toHaveTextContent('red');
    advance(4000); expect(screen.getByRole('status')).toHaveTextContent('green'); page.unmount(); expect(vi.getTimerCount()).toBe(0);
  });

  it('Transfer List II derives bulk states, transfers in order and adds a duplicate safely', () => {
    mount('transfer-list-ii'); const left = screen.getByRole('group', { name: 'Left list' }); const right = screen.getByRole('group', { name: 'Right list' });
    fireEvent.click(within(left).getByRole('checkbox', { name: 'Apple' }));
    expect((screen.getByRole('checkbox', { name: 'Select all left' }) as HTMLInputElement).indeterminate).toBe(true);
    fireEvent.click(within(left).getByRole('checkbox', { name: 'Banana' })); click('Move right →');
    expect(within(right).getAllByRole('listitem').map(item => item.textContent?.trim())).toEqual(['Date', 'Apple', 'Banana']);
    expect(within(right).getByRole('checkbox', { name: 'Apple' })).not.toBeChecked();
    change('New left item', 'Apple'); click('Add to left');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all left' })); click('Move right →');
    expect(within(left).queryAllByRole('listitem')).toHaveLength(0); expect(within(right).getAllByRole('checkbox', { name: 'Apple' })).toHaveLength(2);
  });

  it('Tweet reverses engagement toggles and sends a trimmed reply', () => {
    const onReply = vi.fn(); mount('tweet', { onReply }); const like = screen.getByRole('button', { name: 'Like' });
    expect(like).toHaveTextContent('8'); fireEvent.click(like); expect(like).toHaveAttribute('aria-pressed', 'true'); expect(like).toHaveTextContent('9');
    fireEvent.click(like); expect(like).toHaveTextContent('8'); click('Reply'); change('Reply text', ' Nice work! '); click('Send reply');
    expect(onReply).toHaveBeenCalledWith('Nice work!'); expect(screen.getByRole('button', { name: 'Reply' })).toHaveTextContent('2');
  });

  it('Undoable Counter preserves redo until a new action creates a branch', () => {
    mount('undoable-counter'); click('+10'); click('+1'); click('Undo');
    expect(screen.getByLabelText('Counter value')).toHaveTextContent('10'); click('Redo'); expect(screen.getByLabelText('Counter value')).toHaveTextContent('11');
    click('Undo'); click('-1'); expect(screen.getByLabelText('Counter value')).toHaveTextContent('9'); expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
    expect(screen.getByRole('list')).not.toHaveTextContent('+1:'); click('Reset'); expect(screen.getByLabelText('Counter value')).toHaveTextContent('0');
  });

  it('Users Database validates unique emails, creates, filters, edits, cancels and deletes', () => {
    mount('users-database'); change('Name', 'Duplicate'); change('Email', 'MORGAN@example.com'); click('Create user');
    expect(screen.getByRole('alert')).toHaveTextContent('already exists');
    change('Name', 'Taylor'); change('Email', 'taylor@example.com'); click('Create user');
    change('Filter users', 'taylor'); expect(screen.getAllByRole('row')).toHaveLength(2);
    click('Edit Taylor'); change('Name', 'Discard me'); click('Cancel'); expect(screen.getByText('Taylor')).toBeVisible();
    click('Edit Taylor'); change('Name', 'Taylor New'); click('Save user'); expect(screen.getByText('Taylor New')).toBeVisible();
    click('Delete Taylor New'); expect(screen.getByText('No matching users')).toBeVisible();
  });

  it('Whack-A-Mole scores once per appearance and stops at the deadline', () => {
    vi.useFakeTimers(); mount('whack-a-mole', { duration: 2, random: () => 0 }); click('Start round');
    const mole = screen.getByRole('button', { name: 'Hole 1: mole' }); fireEvent.click(mole); fireEvent.click(mole);
    expect(screen.getByRole('status')).toHaveTextContent('Score: 1'); advance(750); click('Hole 2: mole');
    expect(screen.getByRole('status')).toHaveTextContent('Score: 2'); advance(1250);
    expect(screen.getByRole('status')).toHaveTextContent('Round finished'); expect(screen.getByRole('button', { name: 'Hole 1: empty' })).toBeDisabled();
    expect(vi.getTimerCount()).toBe(0); click('Start round'); expect(screen.getByRole('status')).toHaveTextContent('Score: 0');
  });

  it('Wordle allocates duplicate hints correctly, validates guesses and wins through the keyboard', () => {
    const { evaluate } = exportsFor('wordle');
    expect(evaluate('ALLEY', 'APPLE')).toEqual(['correct', 'present', 'absent', 'present', 'absent']);
    mount('wordle'); fireEvent.keyDown(window, { key: 'Enter' }); expect(screen.getByRole('status')).toHaveTextContent('five letters');
    for (const key of 'ALLEY') fireEvent.keyDown(window, { key }); fireEvent.keyDown(window, { key: 'Enter' });
    const row = screen.getByLabelText('Guess 1'); expect(within(row).getByLabelText('L: present')).toBeVisible(); expect(within(row).getByLabelText('L: absent')).toBeVisible();
    const restart = screen.getByRole('button', { name: 'Restart' });
    restart.focus();
    // jsdom does not synthesize a click from keydown: assert the native action is
    // not cancelled, then dispatch the click that a browser would produce.
    expect(fireEvent.keyDown(restart, { key: 'Enter' })).toBe(true);
    fireEvent.click(restart); expect(screen.getByRole('status')).toHaveTextContent('Attempt 1 of 6');
    for (const key of 'APPLE') fireEvent.keyDown(window, { key }); fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByRole('status')).toHaveTextContent('You won!'); expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
    click('Restart'); expect(screen.getByRole('status')).toHaveTextContent('Attempt 1 of 6');
  });

  it('Wordle rejects dictionary misses without consuming a turn and ends after six valid misses', () => {
    mount('wordle');
    for (const key of 'ZZZZZ') fireEvent.keyDown(window, { key }); fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByRole('status')).toHaveTextContent('not in the demo dictionary');
    for (let i = 0; i < 5; i++) fireEvent.keyDown(window, { key: 'Backspace' });
    for (let attempt = 0; attempt < 6; attempt++) {
      for (const key of 'CRANE') fireEvent.keyDown(window, { key }); fireEvent.keyDown(window, { key: 'Enter' });
    }
    expect(screen.getByRole('status')).toHaveTextContent('Answer: APPLE');
    expect(screen.getByRole('button', { name: 'Enter' })).toBeDisabled();
  });
});

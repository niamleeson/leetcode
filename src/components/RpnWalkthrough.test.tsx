import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import RpnWalkthrough from './RpnWalkthrough';

afterEach(cleanup);

function visibleStack() {
  return within(screen.getByRole('list', { name: 'Stack, bottom to top' }))
    .queryAllByRole('listitem').map(item => item.getAttribute('aria-label'));
}

describe('RPN walkthrough controls', () => {
  it('lets the reader inspect a token, move back and forth, and reset', () => {
    render(<RpnWalkthrough />);
    expect((screen.getByRole('button', { name: 'Back' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Jump to token 3: +' }));
    expect(visibleStack()).toEqual(['2, top']);
    expect(screen.getByLabelText('Right operand: 1')).toBeTruthy();
    expect(screen.getByLabelText('Left operand: empty')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Jump to token 3: +' }).getAttribute('aria-current')).toBe('step');

    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(visibleStack()).toEqual([]);
    expect(screen.getByLabelText('Left operand: 2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(visibleStack()).toEqual(['3, top']);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(visibleStack()).toEqual([]);
    expect(screen.getByLabelText('Left operand: 2')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(visibleStack()).toEqual([]);
    expect(screen.getByRole('status').textContent).toContain('Start with an empty stack');
    expect((screen.getByRole('button', { name: 'Reset' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('resets on an example change and stops at the final answer', () => {
    render(<RpnWalkthrough />);
    fireEvent.click(screen.getByRole('button', { name: 'Jump to token 5: *' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Walkthrough example' }), { target: { value: '2' } });
    expect(visibleStack()).toEqual([]);
    expect(screen.getByRole('status').textContent).toContain('Start with an empty stack');

    fireEvent.click(screen.getByRole('button', { name: 'Jump to token 5: -' }));
    for (let remainingStep = 0; remainingStep < 3; remainingStep++) {
      fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    }
    expect(visibleStack()).toEqual(['-4, top']);
    expect(screen.getByRole('status').textContent).toContain('Return -4');
    expect((screen.getByRole('button', { name: 'Next →' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

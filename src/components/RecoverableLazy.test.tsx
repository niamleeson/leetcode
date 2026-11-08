import React, { lazy, Suspense, useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import RecoverableLazy from './RecoverableLazy';

// jsdom reports React's deliberate test throws through window.error as well.
const suppressExpectedError = (event: ErrorEvent) => {
  if (['Failed to fetch dynamically imported module', 'offline'].includes(event.error?.message)) event.preventDefault();
};
beforeEach(() => window.addEventListener('error', suppressExpectedError));
afterEach(() => { cleanup(); window.removeEventListener('error', suppressExpectedError); vi.restoreAllMocks(); });

describe('lazy module recovery', () => {
  it('keeps the final answer and surrounding lesson mounted when a lazy import rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const unmount = vi.fn();
    const moduleLoad = vi.fn(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module')));
    const Runner = lazy(moduleLoad);
    function Lesson() {
      const [complete, setComplete] = useState(false);
      useEffect(() => unmount, []);
      return <>
        <button onClick={() => setComplete(true)}>Final answer</button>
        <p>{complete ? 'Decisions complete' : 'Last question'}</p>
        {complete && <RecoverableLazy errorTitle="The code runner couldn't open.">
          <Suspense fallback={<p>Loading runner</p>}><Runner /></Suspense>
        </RecoverableLazy>}
      </>;
    }
    render(<Lesson />);
    expect(moduleLoad).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name:'Final answer'}));
    await screen.findByRole('alert');
    expect(screen.getByText('Decisions complete')).toBeTruthy();
    expect(unmount).not.toHaveBeenCalled();
    expect(moduleLoad).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', {name:'Reload page'})).toBeTruthy();
  });

  it.each(['returns false', 'throws'])('does not reload or discard the lesson when saving a checkpoint %s', async mode => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const beforeReload = vi.fn(() => {
      if (mode === 'throws') throw new Error('Storage unavailable');
      return false;
    });
    function Failed(): React.ReactNode { throw new Error('offline'); }
    render(<RecoverableLazy errorTitle="The code runner couldn't open." onBeforeReload={beforeReload}><Failed /></RecoverableLazy>);
    await screen.findByRole('alert');
    expect(beforeReload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name:'Reload page'}));
    expect(beforeReload).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toContain('could not keep your place');
    expect(screen.getByRole('button', {name:'Reload page'})).toBeTruthy();
  });
});

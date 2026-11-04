import * as React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { greatFrontendBasic } from './uiBasic';
import { loadSolution } from './testUtils';

function solution(slug: string) {
  const challenge = greatFrontendBasic.find(item => item.slug === 'gfe-' + slug);
  if (!challenge) throw new Error('Missing challenge: ' + slug);
  return loadSolution(challenge.code);
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function response(data: unknown, ok = true) {
  return { ok, json: async () => data };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('GreatFrontEnd basic UI displayed solutions', () => {
  it('has 20 executable standalone default exports', () => {
    expect(greatFrontendBasic).toHaveLength(20);
    expect(new Set(greatFrontendBasic.map(item => item.slug)).size).toBe(20);
    for (const challenge of greatFrontendBasic) {
      expect(loadSolution(challenge.code).default, challenge.slug).toBeTypeOf('function');
    }
  });

  it('increments counters independently', () => {
    const Component = solution('counter').default;
    render(<><Component /><Component initialValue={10} /></>);
    const button = screen.getByRole('button', { name: 'Count: 0' });
    fireEvent.click(button); fireEvent.click(button); fireEvent.click(button);
    expect(button).toHaveTextContent('Count: 3');
    expect(screen.getByRole('button', { name: 'Count: 10' })).toBeInTheDocument();
  });

  it('submits contact fields through the configured native HTML contract', () => {
    const Component = solution('contact-form').default;
    render(<Component endpoint="/contact" />);
    change('Name', 'Ada'); change('Email', 'ada@example.com'); change('Message', 'Hello\nworld');
    const form = screen.getByRole('button', { name: 'Send' }).closest('form')!;
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveAttribute('action', '/contact');
    expect(Object.fromEntries(new FormData(form))).toEqual({ name: 'Ada', email: 'ada@example.com', message: 'Hello\nworld' });
    // Navigation itself belongs to the browser; observe the real submit event without navigating jsdom.
    const submitted = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', submitted);
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(submitted).toHaveBeenCalledOnce();
  });

  it('renders all Holy Grail landmarks and keeps the center fluid', () => {
    const Component = solution('holy-grail').default;
    const { container } = render(<Component><p>Article content</p></Component>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Article content');
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({ gridTemplateRows: '60px 1fr 100px', minHeight: '100vh' });
    expect(screen.getByRole('main').parentElement).toHaveStyle({ gridTemplateColumns: '100px minmax(0, 1fr) 100px' });
  });

  it('rolls bounded dice and preserves results on invalid input', () => {
    const Component = solution('dice-roller').default;
    const random = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.999999).mockReturnValue(0.5);
    render(<Component random={random} />);
    change('Number of dice', '2'); fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(screen.getByRole('img', { name: 'Die 1: 1' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Die 2: 6' })).toBeInTheDocument();
    expect(random).toHaveBeenCalledTimes(2);
    change('Number of dice', '2.5'); fireEvent.click(screen.getByRole('button', { name: 'Roll' }));
    expect(screen.getByRole('alert')).toHaveTextContent('whole number');
    expect(random).toHaveBeenCalledTimes(2);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('validates return itineraries and clears stale confirmations on editing', () => {
    const Component = solution('flight-booker').default;
    render(<Component />);
    expect(screen.getByLabelText('Return date')).toBeDisabled();
    change('Departure date', '2027-06-10');
    change('Trip type', 'return'); change('Return date', '2027-06-09');
    expect(screen.getByRole('button', { name: 'Book' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('on or after');
    change('Return date', '2027-06-10');
    fireEvent.click(screen.getByRole('button', { name: 'Book' }));
    expect(screen.getByRole('status')).toHaveTextContent('returning 2027-06-10');
    change('Trip type', 'one-way');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Return date')).toBeDisabled();
    change('Departure date', '');
    expect(screen.getByRole('button', { name: 'Book' })).toBeDisabled();
  });

  it('generates the snake table only on valid submission', () => {
    const Component = solution('generate-table').default;
    render(<Component />);
    change('Rows', '3'); change('Columns', '2');
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(screen.getAllByRole('row').map(row => within(row).getAllByRole('cell').map(cell => cell.textContent)))
      .toEqual([['1', '6'], ['2', '5'], ['3', '4']]);
    change('Rows', '0'); fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect(screen.getByRole('alert')).toHaveTextContent('1 to 50');
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('converts both ways and preserves incomplete source text', () => {
    const Component = solution('temperature-converter').default;
    render(<Component />);
    change('Celsius', '100'); expect(screen.getByLabelText('Fahrenheit')).toHaveValue('212');
    change('Fahrenheit', '32'); expect(screen.getByLabelText('Celsius')).toHaveValue('0');
    change('Celsius', '-40'); expect(screen.getByLabelText('Fahrenheit')).toHaveValue('-40');
    change('Celsius', '-');
    expect(screen.getByLabelText('Celsius')).toHaveValue('-');
    expect(screen.getByLabelText('Fahrenheit')).toHaveValue('');
    change('Celsius', ''); expect(screen.getByLabelText('Fahrenheit')).toHaveValue('');
  });

  it('normalizes progress values and updates the demonstration control', () => {
    const { default: Demo, ProgressBar } = solution('progress-bar');
    const view = render(<ProgressBar value={125} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
    view.rerender(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    view.rerender(<ProgressBar value={NaN} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    view.rerender(<Demo />); change('Progress percentage', '67');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
  });

  it('calculates amortization and handles the zero-rate case and bad inputs', () => {
    const { default: Component, calculateMortgage } = solution('mortgage-calculator');
    expect(calculateMortgage(300000, 6, 30).monthly).toBeCloseTo(1798.651575, 5);
    expect(calculateMortgage(120000, 0, 10)).toEqual({ monthly: 1000, total: 120000, interest: 0 });
    expect(() => calculateMortgage(100, -1, 10)).toThrow();
    expect(() => calculateMortgage(100, 1, 0)).toThrow();
    render(<Component />);
    change('Loan amount ($)', '120000'); change('Annual interest rate (%)', '0'); change('Loan term (years)', '10');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    change('Loan amount ($)', 'oops'); fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('$1,000.00')).not.toBeInTheDocument();
  });

  it('keeps hover previews separate from rating selection and supports controlled values', () => {
    const Component = solution('star-rating').default;
    const onChange = vi.fn();
    const view = render(<Component defaultValue={2} onChange={onChange} />);
    const filled = () => view.container.querySelectorAll('[data-filled="true"]').length;
    expect(filled()).toBe(2);
    const fourth = screen.getByRole('radio', { name: '4 stars' });
    fireEvent.mouseEnter(fourth.closest('label')!); expect(filled()).toBe(4);
    fireEvent.mouseLeave(screen.getByRole('group')); expect(filled()).toBe(2);
    fireEvent.click(fourth);
    expect(fourth).toBeChecked(); expect(onChange).toHaveBeenLastCalledWith(4);
    view.rerender(<Component value={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '3 stars' }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole('radio', { name: '1 star' })).toBeChecked();
  });
});

describe('GreatFrontEnd game and timer snippets', () => {
  it('positions clock hands fractionally and removes the interval', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2027, 0, 1, 3, 30, 0));
    const Component = solution('analog-clock').default;
    const view = render(<React.StrictMode><Component /></React.StrictMode>);
    expect(view.container.querySelector('[data-hand="hour"]')).toHaveAttribute('transform', 'rotate(105 100 100)');
    expect(screen.getByRole('img')).toHaveAccessibleName('Analog time 03:30:00');
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('img')).toHaveAccessibleName('Analog time 03:30:01');
    view.unmount(); expect(vi.getTimerCount()).toBe(0);
  });

  it('renders six seven-segment digits and carries into the next minute', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2027, 0, 1, 9, 59, 59));
    const Component = solution('digital-clock').default;
    const view = render(<Component />);
    expect(screen.getByLabelText('09:59:59')).toBeInTheDocument();
    expect(view.container.querySelectorAll('svg')).toHaveLength(6);
    expect(view.container.querySelectorAll('line')).toHaveLength(42);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByLabelText('10:00:00')).toBeInTheDocument();
    view.unmount(); expect(vi.getTimerCount()).toBe(0);
  });

  it('runs, pauses, resumes, resets, and cleans the stopwatch without counting paused time', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] });
    const { default: Component, formatElapsed } = solution('stopwatch');
    expect(formatElapsed(3661230)).toBe('01:01:01.23');
    const view = render(<React.StrictMode><Component /></React.StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(2100));
    expect(screen.getByRole('button', { name: 'Elapsed 00:00:02.10' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(5000));
    fireEvent.click(screen.getByRole('button', { name: 'Elapsed 00:00:02.10' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('button', { name: 'Elapsed 00:00:03.10' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('button', { name: 'Elapsed 00:00:00.00' })).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    view.unmount(); expect(vi.getTimerCount()).toBe(0);
  });

  it('deactivates grid lights in reverse order and unlocks after the final light', () => {
    vi.useFakeTimers();
    const Component = solution('grid-lights').default;
    const view = render(<Component delay={300} />);
    const lights = screen.getAllByRole('button', { name: /^Light / });
    const order = [2, 5, 1, 7, 3, 0, 6, 4];
    for (const index of order) fireEvent.click(lights[index]);
    expect(lights.every(light => light.hasAttribute('disabled'))).toBe(true);
    for (const index of [...order].reverse()) {
      expect(lights[index]).toHaveAttribute('aria-pressed', 'true');
      act(() => vi.advanceTimersByTime(300));
      expect(lights[index]).toHaveAttribute('aria-pressed', 'false');
    }
    expect(lights.every(light => !light.hasAttribute('disabled'))).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    lights.forEach(light => fireEvent.click(light));
    expect(vi.getTimerCount()).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(vi.getTimerCount()).toBe(0);
    lights.forEach(light => fireEvent.click(light));
    view.unmount(); expect(vi.getTimerCount()).toBe(0);
  });

  it('handles Connect Four gravity, a win, and restart', () => {
    const Component = solution('connect-four').default;
    const view = render(<Component />);
    const first = screen.getByRole('button', { name: 'Drop in column 1' });
    const second = screen.getByRole('button', { name: 'Drop in column 2' });
    fireEvent.click(first);
    expect(view.container.querySelector('[aria-label="Row 6, column 1: Red"]')).toBeInTheDocument();
    for (let index = 0; index < 3; index++) { fireEvent.click(second); fireEvent.click(first); }
    expect(screen.getByRole('status')).toHaveTextContent('Red wins!');
    expect(screen.getAllByRole('button', { name: /^Drop/ }).every(button => button.hasAttribute('disabled'))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    expect(screen.getByRole('status')).toHaveTextContent("Red's turn");
    expect(view.container.querySelectorAll('[aria-label$=": empty"]')).toHaveLength(42);
  });

  it('detects all four Connect Four winning axes and rejects full-column moves', () => {
    const { default: Component, hasWon } = solution('connect-four');
    for (const [dr, dc, row, column] of [[0, 1, 4, 1], [1, 0, 1, 2], [1, 1, 1, 1], [1, -1, 1, 5]]) {
      const board = Array.from({ length: 6 }, () => Array(7).fill(null));
      for (let offset = 0; offset < 4; offset++) board[row + dr * offset][column + dc * offset] = 'Red';
      expect(hasWon(board, row + dr, column + dc, 'Red')).toBe(true);
      board[row][column] = 'Yellow';
      expect(hasWon(board, row + dr, column + dc, 'Red')).toBe(false);
    }
    render(<Component />);
    const column = screen.getByRole('button', { name: 'Drop in column 1' });
    for (let index = 0; index < 6; index++) fireEvent.click(column);
    expect(column).toBeDisabled();
    fireEvent.click(column);
    expect(screen.getByRole('status')).toHaveTextContent("Red's turn");
  });

  it('locks mismatched memory turns, keeps matches, and cancels an old game timeout', () => {
    vi.useFakeTimers();
    const Component = solution('memory-game').default;
    const view = render(<Component random={() => 0.999999} delay={1000} />);
    const card = (index: number) => screen.getByRole('button', { name: new RegExp('^Card ' + index + ':') });
    fireEvent.click(card(1)); fireEvent.click(card(2));
    expect(card(3)).toBeDisabled();
    fireEvent.click(card(3)); expect(card(3)).toHaveAccessibleName('Card 3: hidden');
    act(() => vi.advanceTimersByTime(1000));
    expect(card(1)).toHaveAccessibleName('Card 1: hidden');
    fireEvent.click(card(1)); fireEvent.click(card(7));
    expect(card(1)).toHaveAccessibleName('Card 1: 🍎');
    expect(card(7)).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Attempts: 2');
    fireEvent.click(card(2)); fireEvent.click(card(3));
    expect(vi.getTimerCount()).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'New game' }));
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByRole('status')).toHaveTextContent('Attempts: 0');
    for (let index = 1; index <= 6; index++) { fireEvent.click(card(index)); fireEvent.click(card(index + 6)); }
    expect(screen.getByRole('status')).toHaveTextContent('All pairs matched! Attempts: 6');
    fireEvent.click(screen.getByRole('button', { name: 'New game' }));
    fireEvent.click(card(1)); fireEvent.click(card(2));
    view.unmount(); expect(vi.getTimerCount()).toBe(0);
  });
});

describe('GreatFrontEnd network snippets', () => {
  it('aggregates birth years, ignores bad rows, and sorts numerically', async () => {
    const Component = solution('birth-year-histogram').default;
    const fetcher = vi.fn().mockResolvedValue(response([1992, 1990, 1990, null, '1990', 0, 3000]));
    render(<Component fetcher={fetcher} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    await screen.findByRole('listitem', { name: '1990: 2' });
    expect(screen.getAllByRole('listitem').map(item => item.getAttribute('aria-label'))).toEqual(['1990: 2', '1992: 1']);
  });

  it('retries histogram failures, handles empty data, and ignores obsolete responses', async () => {
    const Component = solution('birth-year-histogram').default;
    const old = deferred<any>();
    const fetcher = vi.fn().mockReturnValueOnce(old.promise).mockResolvedValueOnce(response([], false)).mockResolvedValueOnce(response([]));
    const view = render(<Component endpoint="/old" fetcher={fetcher} />);
    const oldSignal = fetcher.mock.calls[0][1].signal;
    view.rerender(<Component endpoint="/new" fetcher={fetcher} />);
    expect(oldSignal.aborted).toBe(true);
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText('No valid birth years.');
    await act(async () => { old.resolve(response([1999])); });
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    view.unmount(); expect(fetcher.mock.calls[fetcher.mock.calls.length - 1][1].signal.aborted).toBe(true);
  });

  it('loads ordered job pages, uses link fallbacks, and retries a failed page without duplication', async () => {
    const Component = solution('job-board').default;
    let failThird = true;
    const fetcher = vi.fn(async (url: string) => {
      if (url.endsWith('jobstories.json')) return response([1, 2, 3]);
      const id = Number(url.match(/item\/(\d+)/)![1]);
      if (id === 3 && failThird) return response({}, false);
      return response({ id, title: 'Job ' + id, by: 'author', time: 1700000000, ...(id === 1 ? { url: 'https://example.com/job' } : {}) });
    });
    render(<Component pageSize={2} fetcher={fetcher} />);
    await screen.findByRole('link', { name: 'Job 1' });
    expect(screen.getAllByRole('link').map(link => link.textContent)).toEqual(['Job 1', 'Job 2']);
    expect(screen.getByRole('link', { name: 'Job 2' })).toHaveAttribute('href', 'https://news.ycombinator.com/item?id=2');
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    await screen.findByRole('alert');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    failThird = false; fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('link', { name: 'Job 3' });
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    expect(fetcher.mock.calls.filter(([url]) => url.endsWith('jobstories.json'))).toHaveLength(1);
  });

  it('ignores late job IDs after an endpoint change and cancels requests on unmount', async () => {
    const Component = solution('job-board').default;
    const old = deferred<any>();
    const fetcher = vi.fn().mockReturnValueOnce(old.promise).mockResolvedValueOnce(response([]));
    const view = render(<Component apiBase="/old" fetcher={fetcher} />);
    view.rerender(<Component apiBase="/new" fetcher={fetcher} />);
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    await screen.findByText('No jobs available.');
    await act(async () => { old.resolve(response([1])); });
    expect(fetcher).toHaveBeenCalledTimes(2);
    view.unmount(); expect(fetcher.mock.calls[1][1].signal.aborted).toBe(true);
  });

  it('commits like success, prevents duplicate requests, and preserves a like after unlike failure', async () => {
    const Component = solution('like-button').default;
    const pending = deferred<any>();
    const fetcher = vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValueOnce(response({ message: 'Try again later.' }, false));
    render(<Component fetcher={fetcher} />);
    const button = screen.getByRole('button', { name: 'Like' });
    fireEvent.click(button); fireEvent.click(button);
    expect(button).toBeDisabled(); expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ action: 'like' });
    await act(async () => { pending.resolve(response({ message: 'Success' })); });
    expect(button).toHaveAttribute('aria-pressed', 'true'); expect(button).toHaveTextContent('Like');
    fireEvent.click(button);
    await screen.findByRole('alert');
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ action: 'unlike' });
    expect(button).toHaveAttribute('aria-pressed', 'true'); expect(button).toBeEnabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Try again later.');
  });

  it('does not commit an obsolete like request', async () => {
    const Component = solution('like-button').default;
    const pending = deferred<any>();
    const fetcher = vi.fn().mockReturnValue(pending.promise);
    const view = render(<Component endpoint="/old" fetcher={fetcher} />);
    fireEvent.click(screen.getByRole('button', { name: 'Like' }));
    view.rerender(<Component endpoint="/new" fetcher={fetcher} />);
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    await act(async () => { pending.resolve(response({ message: 'Success' })); });
    expect(screen.getByRole('button', { name: 'Like' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('validates signup, posts only the contracted fields, and clears secrets after success', async () => {
    const Component = solution('signup-form').default;
    const pending = deferred<any>();
    const fetcher = vi.fn().mockReturnValue(pending.promise);
    render(<Component fetcher={fetcher} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(fetcher).not.toHaveBeenCalled(); expect(screen.getAllByRole('alert')).toHaveLength(4);
    expect(screen.getByLabelText('Name')).toHaveFocus();
    change('Name', ' Ada '); change('Email', 'ada@example.com'); change('Password', 'long-secret'); change('Confirm password', 'different');
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(fetcher).not.toHaveBeenCalled(); expect(screen.getByRole('alert')).toHaveTextContent('match');
    change('Confirm password', 'long-secret'); fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(screen.getByRole('button', { name: 'Creating account…' })).toBeDisabled();
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ name: 'Ada', email: 'ada@example.com', password: 'long-secret' });
    await act(async () => { pending.resolve(response({ message: 'Welcome, Ada!' })); });
    expect(screen.getByRole('status')).toHaveTextContent('Welcome, Ada!');
    expect(screen.getByLabelText('Password')).toHaveValue(''); expect(screen.getByLabelText('Confirm password')).toHaveValue('');
  });

  it.each([
    ['JSON null', () => response(null)],
    ['empty response body', () => ({ ok: true, json: async () => { throw new SyntaxError('Empty body'); } })],
    ['non-string message', () => response({ message: 123 })],
  ])('accepts successful signup with %s', async (_name, makeResponse) => {
    const Component = solution('signup-form').default;
    const fetcher = vi.fn().mockResolvedValue(makeResponse());
    render(<Component fetcher={fetcher} />);
    change('Name', 'Ada'); change('Email', 'ada@example.com'); change('Password', 'long-secret'); change('Confirm password', 'long-secret');
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Account created.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('preserves signup input on failure and aborts an unmounted retry', async () => {
    const Component = solution('signup-form').default;
    const pending = deferred<any>();
    const fetcher = vi.fn().mockResolvedValueOnce(response({ message: 'Email already registered.' }, false)).mockReturnValueOnce(pending.promise);
    const view = render(<Component fetcher={fetcher} />);
    change('Name', 'Ada'); change('Email', 'ada@example.com'); change('Password', 'long-secret'); change('Confirm password', 'long-secret');
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    await screen.findByText('Email already registered.');
    expect(screen.getByLabelText('Password')).toHaveValue('long-secret');
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    view.unmount(); expect(fetcher.mock.calls[1][1].signal.aborted).toBe(true);
    await act(async () => { pending.resolve(response({ message: 'Too late' })); });
  });
});

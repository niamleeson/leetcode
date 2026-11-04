import { StrictMode, type ReactNode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { greatFrontendHooks } from './hooks';
import { loadSolution } from './testUtils';

function hook(slug: string): (...args: any[]) => any {
  const challenge = greatFrontendHooks.find(item => item.slug === 'gfe-' + slug);
  if (!challenge) throw new Error('Missing hook: ' + slug);
  return loadSolution(challenge.code).default;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function resize(width: number, height = 720) {
  vi.stubGlobal('innerWidth', width);
  vi.stubGlobal('innerHeight', height);
  fireEvent(window, new Event('resize'));
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('GreatFrontEnd original hook snippets', () => {
  it('includes 31 independently loadable hook modules', () => {
    expect(greatFrontendHooks).toHaveLength(31);
    for (const challenge of greatFrontendHooks) {
      expect(loadSolution(challenge.code).default).toBeTypeOf('function');
      expect(challenge.integrationNotes?.length).toBeGreaterThan(1);
    }
  });

  it('useArray composes queued updates and leaves old arrays untouched', () => {
    const useArray = hook('use-array');
    const initial = ['a'];
    const { result } = renderHook(() => useArray(initial));
    const first = result.current;
    act(() => {
      result.current.push('b');
      result.current.push('c');
      result.current.update(0, 'A');
      result.current.remove(1);
      result.current.set((items: string[]) => [...items, 'd']);
    });
    expect(result.current.array).toEqual(['A', 'c', 'd']);
    expect(initial).toEqual(['a']);
    expect(first.array).toEqual(['a']);
    expect(result.current.push).toBe(first.push);
    act(() => result.current.filter((item: string) => item !== 'c'));
    expect(result.current.array).toEqual(['A', 'd']);
    act(() => { result.current.update(30, 'x'); result.current.remove(-1); });
    expect(result.current.array).toEqual(['A', 'd']);
    act(() => result.current.clear());
    expect(result.current.array).toEqual([]);
  });

  it('useBoolean II keeps commands stable across changes', () => {
    const useBoolean = hook('use-boolean-ii');
    const { result, rerender } = renderHook(() => useBoolean());
    const first = result.current;
    expect(first.value).toBe(false);
    act(() => { result.current.setTrue(); result.current.setTrue(); });
    expect(result.current.value).toBe(true);
    rerender();
    expect(result.current.setTrue).toBe(first.setTrue);
    expect(result.current.setFalse).toBe(first.setFalse);
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
  });

  it('useBreakpoint sorts thresholds and includes boundary widths', () => {
    const useBreakpoint = hook('use-breakpoint');
    vi.stubGlobal('innerWidth', 767);
    const { result, rerender, unmount } = renderHook(({ points }) => useBreakpoint(points), {
      initialProps: { points: { desktop: 1024, mobile: 0, tablet: 768 } as Record<string, number> },
    });
    expect(result.current).toBe('mobile');
    act(() => resize(768));
    expect(result.current).toBe('tablet');
    act(() => resize(1300));
    expect(result.current).toBe('desktop');
    rerender({ points: { huge: 2000 } });
    expect(result.current).toBeUndefined();
    const remove = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('useClickAnywhere uses the new callback and unsubscribes', () => {
    const useClickAnywhere = hook('use-click-anywhere');
    const first = vi.fn();
    const next = vi.fn();
    const { rerender, unmount } = renderHook(({ callback }) => useClickAnywhere(callback), {
      initialProps: { callback: first },
    });
    fireEvent.click(document.body);
    expect(first).toHaveBeenCalledOnce();
    rerender({ callback: next });
    fireEvent.click(document.body);
    expect(first).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(expect.any(MouseEvent));
    unmount();
    fireEvent.click(document.body);
    expect(next).toHaveBeenCalledOnce();
  });

  it('useClickOutside ignores descendants, follows its ref, and cleans up', () => {
    const useClickOutside = hook('use-click-outside');
    const ref = { current: null as HTMLDivElement | null };
    render(<div ref={ref}><button>Inside</button></div>);
    const first = vi.fn();
    const next = vi.fn();
    const { rerender, unmount } = renderHook(({ callback }) => useClickOutside(ref, callback), {
      initialProps: { callback: first },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Inside' }));
    expect(first).not.toHaveBeenCalled();
    rerender({ callback: next });
    fireEvent.click(document.body);
    expect(next).toHaveBeenCalledOnce();
    ref.current = null;
    fireEvent.click(document.body);
    expect(next).toHaveBeenCalledOnce();
    unmount();
    fireEvent.click(document.body);
    expect(next).toHaveBeenCalledOnce();
  });

  it('useCountdown starts once, pauses, resets, and stops at zero', () => {
    vi.useFakeTimers();
    const useCountdown = hook('use-countdown');
    const { result, unmount } = renderHook(() => useCountdown(3, 100));
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.count).toBe(3);
    act(() => { result.current.start(); result.current.start(); });
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.count).toBe(2);
    act(() => result.current.stop());
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.count).toBe(2);
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(700));
    expect(result.current.count).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    act(() => result.current.reset());
    expect(result.current.count).toBe(3);
    expect(result.current.isRunning).toBe(false);
    act(() => result.current.start());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('useCounter II preserves method identity and follows changed reset targets', () => {
    const useCounter = hook('use-counter-ii');
    const { result, rerender } = renderHook(({ initial }) => useCounter(initial), { initialProps: { initial: 5 } });
    const first = result.current;
    act(() => { result.current.increment(); result.current.increment(); result.current.decrement(); });
    expect(result.current.count).toBe(6);
    for (const key of ['increment', 'decrement', 'setCount', 'reset']) expect(result.current[key]).toBe(first[key]);
    rerender({ initial: 20 });
    expect(result.current.count).toBe(6);
    expect(result.current.reset).not.toBe(first.reset);
    act(() => result.current.reset());
    expect(result.current.count).toBe(20);
    act(() => result.current.setCount((n: number) => n * 2));
    expect(result.current.count).toBe(40);
  });

  it('useCycle handles duplicate values, wrapping, empty sequences, and queued calls', () => {
    const useCycle = hook('use-cycle');
    const { result, rerender } = renderHook(({ values }) => useCycle(...values), {
      initialProps: { values: ['a', 'a', 'b'] },
    });
    expect(result.current[0]).toBe('a');
    act(() => result.current[1]());
    expect(result.current[0]).toBe('a');
    act(() => result.current[1]());
    expect(result.current[0]).toBe('b');
    act(() => { result.current[1](); result.current[1](); });
    expect(result.current[0]).toBe('a');
    rerender({ values: [] });
    act(() => result.current[1]());
    expect(result.current[0]).toBeUndefined();
  });

  it('useDebounce publishes only after the final quiet period and cancels on unmount', () => {
    vi.useFakeTimers();
    const useDebounce = hook('use-debounce');
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(80));
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(20));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(80));
    expect(result.current).toBe('c');
    rerender({ value: 'd' });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('useDefault preserves falsy values and passes raw state to functional updates', () => {
    const useDefault = hook('use-default');
    const { result, rerender } = renderHook(({ fallback }) => useDefault(fallback, null), {
      initialProps: { fallback: 'fallback' },
    });
    expect(result.current[0]).toBe('fallback');
    for (const value of [false, 0, '']) {
      act(() => result.current[1](value));
      expect(result.current[0]).toBe(value);
    }
    act(() => result.current[1](null));
    rerender({ fallback: 'new fallback' });
    expect(result.current[0]).toBe('new fallback');
    act(() => result.current[1]((raw: unknown) => raw === null ? 'raw null' : 'wrong'));
    expect(result.current[0]).toBe('raw null');
  });

  it('useEffectOnce preserves Strict Mode setup/cleanup replay', () => {
    const useEffectOnce = hook('use-effect-once');
    const dispose = vi.fn();
    const setup = vi.fn(() => dispose);
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;
    const { rerender, unmount } = renderHook(() => useEffectOnce(setup), { wrapper });
    expect(setup).toHaveBeenCalledTimes(2);
    expect(dispose).toHaveBeenCalledOnce();
    rerender();
    expect(setup).toHaveBeenCalledTimes(2);
    unmount();
    expect(dispose).toHaveBeenCalledTimes(2);
  });

  it('useEventListener updates callbacks and detaches from replaced ref targets', () => {
    const useEventListener = hook('use-event-listener');
    const firstTarget = new EventTarget();
    const nextTarget = new EventTarget();
    const ref = { current: firstTarget };
    const first = vi.fn();
    const next = vi.fn();
    const { rerender, unmount } = renderHook(({ callback }) => useEventListener('message', callback, ref), {
      initialProps: { callback: first },
    });
    firstTarget.dispatchEvent(new Event('message'));
    expect(first).toHaveBeenCalledOnce();
    ref.current = nextTarget;
    rerender({ callback: next });
    firstTarget.dispatchEvent(new Event('message'));
    expect(first).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
    nextTarget.dispatchEvent(new Event('message'));
    expect(next).toHaveBeenCalledOnce();
    unmount();
    nextTarget.dispatchEvent(new Event('message'));
    expect(next).toHaveBeenCalledOnce();
  });

  it('useFocus safely handles null and focuses the current element with a stable command', () => {
    const useFocus = hook('use-focus');
    const { result, rerender } = renderHook(() => useFocus());
    const focus = result.current[1];
    expect(() => focus()).not.toThrow();
    render(<input aria-label="Target" ref={result.current[0]} />);
    act(() => focus());
    expect(document.activeElement).toBe(screen.getByLabelText('Target'));
    rerender();
    expect(result.current[1]).toBe(focus);
  });

  it('useHover resets when its callback ref receives a replacement element', () => {
    const useHover = hook('use-hover');
    const { result, unmount } = renderHook(() => useHover());
    const first = document.createElement('div');
    const next = document.createElement('div');
    act(() => result.current[0](first));
    act(() => first.dispatchEvent(new MouseEvent('mouseenter')));
    expect(result.current[1]).toBe(true);
    act(() => result.current[0](next));
    expect(result.current[1]).toBe(false);
    act(() => first.dispatchEvent(new MouseEvent('mouseenter')));
    expect(result.current[1]).toBe(false);
    act(() => next.dispatchEvent(new MouseEvent('mouseenter')));
    expect(result.current[1]).toBe(true);
    act(() => next.dispatchEvent(new MouseEvent('mouseleave')));
    expect(result.current[1]).toBe(false);
    const remove = vi.spyOn(next, 'removeEventListener');
    unmount();
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it('useIdle restarts its deadline on activity and releases every timer', () => {
    vi.useFakeTimers();
    const useIdle = hook('use-idle');
    const { result, unmount } = renderHook(() => useIdle(100));
    act(() => vi.advanceTimersByTime(80));
    fireEvent(window, new Event('pointermove'));
    act(() => vi.advanceTimersByTime(80));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(20));
    expect(result.current).toBe(true);
    fireEvent.keyDown(window, { key: 'a' });
    expect(result.current).toBe(false);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.keyDown(window, { key: 'a' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('useInputControl separates dirty, touched, and different and resets the original value', () => {
    const useInputControl = hook('use-input-control');
    const { result, rerender } = renderHook(({ initial }) => useInputControl(initial), { initialProps: { initial: 'Ada' } });
    act(() => result.current.handleChange({ target: { value: 'Grace' } }));
    expect(result.current).toMatchObject({ value: 'Grace', dirty: true, different: true, touched: false });
    act(() => result.current.handleChange({ target: { value: 'Ada' } }));
    act(() => result.current.handleBlur());
    expect(result.current).toMatchObject({ dirty: true, different: false, touched: true });
    rerender({ initial: 'Changed prop' });
    act(() => result.current.reset());
    expect(result.current).toMatchObject({ value: 'Ada', dirty: false, different: false, touched: false });
  });

  it('useInterval uses fresh callbacks without restarting, pauses with null, and cleans up', () => {
    vi.useFakeTimers();
    const useInterval = hook('use-interval');
    const first = vi.fn();
    const next = vi.fn();
    const { rerender, unmount } = renderHook(({ callback, delay }) => useInterval(callback, delay), {
      initialProps: { callback: first, delay: 100 as number | null },
    });
    act(() => vi.advanceTimersByTime(60));
    rerender({ callback: next, delay: 100 });
    act(() => vi.advanceTimersByTime(40));
    expect(first).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
    rerender({ callback: next, delay: null });
    act(() => vi.advanceTimersByTime(300));
    expect(next).toHaveBeenCalledOnce();
    rerender({ callback: next, delay: 50 });
    act(() => vi.advanceTimersByTime(100));
    expect(next).toHaveBeenCalledTimes(3);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('useKeyPress ignores other keys and clears held keys on blur or target changes', () => {
    const useKeyPress = hook('use-key-press');
    const { result, rerender, unmount } = renderHook(({ key }) => useKeyPress(key), { initialProps: { key: 'Escape' } });
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(result.current).toBe(false);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(result.current).toBe(true);
    fireEvent.keyDown(window, { key: 'Escape', repeat: true });
    expect(result.current).toBe(true);
    fireEvent.blur(window);
    expect(result.current).toBe(false);
    fireEvent.keyDown(window, { key: 'Escape' });
    rerender({ key: 'Enter' });
    expect(result.current).toBe(false);
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyUp(window, { key: 'Enter' });
    expect(result.current).toBe(false);
    const remove = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(remove).toHaveBeenCalledTimes(3);
  });

  it('useMap composes queued writes with object keys and restores its initial snapshot', () => {
    const useMap = hook('use-map');
    const key = {};
    const initial = new Map<unknown, number>([[key, 1]]);
    const { result } = renderHook(() => useMap(initial));
    const old = result.current.map;
    const setter = result.current.set;
    act(() => { result.current.set(key, 2); result.current.set('b', 3); });
    expect(result.current.map.get(key)).toBe(2);
    expect(result.current.map.get('b')).toBe(3);
    expect(old.get(key)).toBe(1);
    expect(initial.get(key)).toBe(1);
    expect(result.current.set).toBe(setter);
    act(() => result.current.remove(key));
    expect(result.current.map.has(key)).toBe(false);
    act(() => result.current.reset());
    expect([...result.current.map]).toEqual([[key, 1]]);
    act(() => result.current.clear());
    expect(result.current.map.size).toBe(0);
  });

  it('useMediaQuery reads the initial match, subscribes, and detaches from old queries', () => {
    const useMediaQuery = hook('use-media-query');
    const wide = Object.assign(new EventTarget(), { matches: true });
    const dark = Object.assign(new EventTarget(), { matches: false });
    const oldRemove = vi.spyOn(wide, 'removeEventListener');
    const nextRemove = vi.spyOn(dark, 'removeEventListener');
    vi.stubGlobal('matchMedia', vi.fn((query: string) => query === 'wide' ? wide : dark));
    const { result, rerender, unmount } = renderHook(({ query }) => useMediaQuery(query), { initialProps: { query: 'wide' } });
    expect(result.current).toBe(true);
    act(() => { wide.matches = false; wide.dispatchEvent(new Event('change')); });
    expect(result.current).toBe(false);
    rerender({ query: 'dark' });
    expect(oldRemove).toHaveBeenCalledWith('change', expect.any(Function));
    act(() => { wide.matches = true; wide.dispatchEvent(new Event('change')); });
    expect(result.current).toBe(false);
    act(() => { dark.matches = true; dark.dispatchEvent(new Event('change')); });
    expect(result.current).toBe(true);
    unmount();
    expect(nextRemove).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('useMediatedState keeps the original mediator and composes functional proposals', () => {
    const useMediatedState = hook('use-mediated-state');
    const original = (value: number) => Math.min(value, 10);
    const replacement = vi.fn((value: number) => value * 100);
    const { result, rerender } = renderHook(({ mediator }) => useMediatedState(mediator, 0), {
      initialProps: { mediator: original },
    });
    const setter = result.current[1];
    act(() => { setter((n: number) => n + 6); setter((n: number) => n + 6); });
    expect(result.current[0]).toBe(10);
    rerender({ mediator: replacement });
    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);
    expect(replacement).not.toHaveBeenCalled();
    expect(result.current[1]).toBe(setter);
  });

  it('useMediatedState supports interception and deferred dispatch without duplicate effects', () => {
    const useMediatedState = hook('use-mediated-state');
    let dispatchLater: ((value: number) => void) | undefined;
    const mediator = vi.fn((value: number, dispatch: (value: number) => void) => {
      if (value >= 0) dispatchLater = dispatch;
    });
    const { result, unmount } = renderHook(() => useMediatedState(mediator, 1), {
      wrapper: ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>,
    });
    act(() => result.current[1](-1));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](4));
    expect(mediator).toHaveBeenCalledTimes(2);
    expect(result.current[0]).toBe(1);
    act(() => dispatchLater?.(4));
    expect(result.current[0]).toBe(4);
    unmount();
    act(() => dispatchLater?.(9));
    expect(result.current[0]).toBe(4);
  });

  it('useObject composes patches and removes keys without mutating older snapshots', () => {
    const useObject = hook('use-object');
    const initial = { name: 'Ada' };
    const { result } = renderHook(() => useObject(initial));
    const old = result.current.object;
    act(() => { result.current.set('age', 30); result.current.merge({ active: true }); result.current.remove('name'); });
    expect(result.current.object).toEqual({ age: 30, active: true });
    expect(old).toEqual({ name: 'Ada' });
    expect(initial).toEqual({ name: 'Ada' });
    act(() => result.current.reset());
    expect(result.current.object).toEqual(initial);
    act(() => result.current.clear());
    expect(result.current.object).toEqual({});
  });

  it('usePrevious retains the previous distinct committed value across repeated renders', () => {
    const usePrevious = hook('use-previous');
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), { initialProps: { value: 1 } });
    expect(result.current).toBeUndefined();
    rerender({ value: 1 });
    expect(result.current).toBeUndefined();
    rerender({ value: 2 });
    expect(result.current).toBe(1);
    rerender({ value: 2 });
    expect(result.current).toBe(1);
    rerender({ value: 3 });
    expect(result.current).toBe(2);
    rerender({ value: NaN });
    expect(result.current).toBe(3);
    rerender({ value: NaN });
    expect(result.current).toBe(3);
  });

  it('useQuery rejects stale fulfillment and rejection after dependency changes', async () => {
    const useQuery = hook('use-query');
    const first = deferred<string>();
    const second = deferred<string>();
    const third = deferred<string>();
    const requests = [first, second, third];
    const { result, rerender } = renderHook(({ index }) => useQuery(() => requests[index].promise, [index]), {
      initialProps: { index: 0 },
    });
    expect(result.current).toEqual({ status: 'loading' });
    rerender({ index: 1 });
    await act(async () => second.resolve('second'));
    expect(result.current).toEqual({ status: 'success', data: 'second' });
    await act(async () => first.reject(new Error('stale error')));
    expect(result.current).toEqual({ status: 'success', data: 'second' });
    rerender({ index: 2 });
    expect(result.current).toEqual({ status: 'loading' });
    await act(async () => third.reject('current error'));
    expect(result.current).toEqual({ status: 'error', error: 'current error' });
  });

  it('useQuery ignores old successful results, defaults to once, and stops after unmount', async () => {
    const useQuery = hook('use-query');
    const first = deferred<string>();
    const second = deferred<string>();
    const { result, rerender, unmount } = renderHook(({ id }) => useQuery(() => id === 1 ? first.promise : second.promise, [id]), {
      initialProps: { id: 1 },
    });
    rerender({ id: 2 });
    await act(async () => first.resolve('old'));
    expect(result.current).toEqual({ status: 'loading' });
    unmount();
    await act(async () => second.resolve('late'));
    expect(result.current).toEqual({ status: 'loading' });
    const fn = vi.fn(async () => 'once');
    const once = renderHook(() => useQuery(() => fn()));
    await act(async () => {});
    once.rerender();
    expect(fn).toHaveBeenCalledOnce();
    expect(once.result.current).toEqual({ status: 'success', data: 'once' });
  });

  it('useQuery turns synchronous throws into error state', () => {
    const useQuery = hook('use-query');
    const failure = new Error('sync');
    const { result } = renderHook(() => useQuery(() => { throw failure; }));
    expect(result.current).toEqual({ status: 'error', error: failure });
  });

  it('useSet publishes immutable membership changes and resets to the supplied object', () => {
    const useSet = hook('use-set');
    const initial = new Set(['a']);
    const { result, rerender } = renderHook(({ initialSet }) => useSet(initialSet), { initialProps: { initialSet: initial } });
    const old = result.current.set;
    act(() => { result.current.add('b'); result.current.add('b'); result.current.toggle('a'); result.current.toggle('c'); });
    expect([...result.current.set]).toEqual(['b', 'c']);
    expect([...old]).toEqual(['a']);
    act(() => result.current.remove('b'));
    expect([...result.current.set]).toEqual(['c']);
    act(() => result.current.reset());
    expect(result.current.set).toBe(initial);
    const replacement = new Set(['z']);
    rerender({ initialSet: replacement });
    act(() => result.current.reset());
    expect(result.current.set).toBe(replacement);
    act(() => result.current.clear());
    expect(result.current.set.size).toBe(0);
    expect(result.current.set).not.toBe(replacement);
  });

  it('useStateWithReset preserves lazy initialization and original reset state', () => {
    const useStateWithReset = hook('use-state-with-reset');
    const initialize = vi.fn(() => 10);
    const { result, rerender } = renderHook(({ initial }) => useStateWithReset(initial), {
      initialProps: { initial: initialize as number | (() => number) },
    });
    const reset = result.current[2];
    act(() => result.current[1]((n: number) => n + 20));
    expect(result.current[0]).toBe(30);
    rerender({ initial: 99 });
    act(() => result.current[2]());
    expect(result.current[0]).toBe(10);
    expect(result.current[2]).toBe(reset);
    expect(initialize).toHaveBeenCalledOnce();
  });

  it('useStep enforces bounds even for queued commands and smaller maxima', () => {
    const useStep = hook('use-step');
    const { result, rerender } = renderHook(({ max }) => useStep(max), { initialProps: { max: 3 } });
    expect(result.current).toMatchObject({ step: 1, canGoToPrevStep: false, canGoToNextStep: true });
    act(() => { result.current.goToNextStep(); result.current.goToNextStep(); result.current.goToNextStep(); });
    expect(result.current).toMatchObject({ step: 3, canGoToNextStep: false });
    act(() => result.current.setStep(-10));
    expect(result.current.step).toBe(1);
    act(() => result.current.setStep((value: number) => value + 10));
    expect(result.current.step).toBe(3);
    rerender({ max: 2 });
    expect(result.current.step).toBe(2);
    act(() => result.current.goToPrevStep());
    expect(result.current.step).toBe(1);
    act(() => { result.current.goToNextStep(); result.current.reset(); });
    expect(result.current.step).toBe(1);
  });

  it('useThrottle keeps the original trailing deadline and publishes immediately after idle', () => {
    vi.useFakeTimers();
    const useThrottle = hook('use-throttle');
    const { result, rerender, unmount } = renderHook(({ value }) => useThrottle(value, 100), { initialProps: { value: 'a' } });
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(20));
    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(60));
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(19));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('c');
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'd' });
    expect(result.current).toBe('d');
    rerender({ value: 'e' });
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('useThrottle cancels a pending change if the input returns to its published value', () => {
    vi.useFakeTimers();
    const useThrottle = hook('use-throttle');
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 100), { initialProps: { value: 'a' } });
    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(50));
    rerender({ value: 'a' });
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(60));
    rerender({ value: 'c' });
    expect(result.current).toBe('c');
  });

  it('useTimeout preserves the deadline on callback changes and cancels on delay changes', () => {
    vi.useFakeTimers();
    const useTimeout = hook('use-timeout');
    const first = vi.fn();
    const next = vi.fn();
    const { rerender, unmount } = renderHook(({ callback, delay }) => useTimeout(callback, delay), {
      initialProps: { callback: first, delay: 100 as number | null },
    });
    act(() => vi.advanceTimersByTime(70));
    rerender({ callback: next, delay: 100 });
    act(() => vi.advanceTimersByTime(30));
    expect(next).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(next).toHaveBeenCalledOnce();
    rerender({ callback: next, delay: 200 });
    rerender({ callback: next, delay: null });
    act(() => vi.advanceTimersByTime(500));
    expect(next).toHaveBeenCalledOnce();
    rerender({ callback: next, delay: 50 });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('useToggle composes inversions and accepts direct booleans without confusing events', () => {
    const useToggle = hook('use-toggle');
    const { result } = renderHook(() => useToggle());
    const toggle = result.current[1];
    act(() => { toggle(); toggle(); });
    expect(result.current[0]).toBe(false);
    act(() => toggle(new MouseEvent('click')));
    expect(result.current[0]).toBe(true);
    act(() => toggle(true));
    expect(result.current[0]).toBe(true);
    act(() => toggle(false));
    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBe(toggle);
  });

  it('useWindowSize reads both initial dimensions, updates them together, and unsubscribes', () => {
    const useWindowSize = hook('use-window-size');
    vi.stubGlobal('innerWidth', 800);
    vi.stubGlobal('innerHeight', 600);
    const { result, unmount } = renderHook(() => useWindowSize());
    expect(result.current).toEqual({ width: 800, height: 600 });
    act(() => resize(1280, 720));
    expect(result.current).toEqual({ width: 1280, height: 720 });
    const previous = result.current;
    act(() => resize(1280, 720));
    expect(result.current).toBe(previous);
    const remove = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});

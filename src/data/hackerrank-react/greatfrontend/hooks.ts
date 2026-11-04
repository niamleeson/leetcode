import type { ReactChallenge } from '../types';
import { defineChallenge } from './shared';

// Original implementations. Where the full prompt is private, the public
// catalog supplies the topic and the assumptions below define our practice API.
export const greatFrontendHooks: ReactChallenge[] = [
  defineChallenge({
    slug: 'gfe-use-array', title: 'useArray', difficulty: 'Medium',
    summary: 'Manage an array with immutable, composable update commands.',
    prompt: 'Write useArray(initialArray), returning the array and methods that add, replace, remove, filter, replace all, or clear its items.',
    topics: ['Custom hooks', 'Arrays', 'Immutable state'],
    requirements: ['Return { array, push, update, remove, filter, set, clear }.', 'Support functional updates in set and preserve queued updates.', 'Never mutate the previous array or its items.'],
    example: { actions: 'Start with ["tea"], push("coffee"), then update(0, "water").', result: 'array is ["water", "coffee"].' },
    steps: ['Keep one array in useState.', 'Use functional updates for operations that depend on current items.', 'Memoize commands and delegate whole-array replacement to the React setter.'],
    pitfalls: ['Calling push on the existing state array hides changes from React.', 'A closure over array can lose back-to-back updates.'],
    complexity: 'O(n) time and additional space for copying, filtering, replacing, or deleting items; clear is O(1).',
    testCases: [{ action: 'Push two items in the same event.', expected: 'Both items are appended in order.' }, { action: 'Remove an invalid index.', expected: 'The contents remain unchanged.' }],
    assumptions: ['Indices are zero-based; invalid update/remove indices leave the contents unchanged.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-array',
    integrationNotes: ['Inside a component: const { array, push, remove } = useArray(["tea"]); render array and call push("coffee") from a button.'],
    code: String.raw`import { useCallback, useState } from 'react';

export default function useArray(initialArray = []) {
  const [array, set] = useState(() => [...initialArray]);
  const push = useCallback(item => set(items => [...items, item]), []);
  const update = useCallback((index, item) => {
    set(items => items.map((old, i) => i === index ? item : old));
  }, []);
  const remove = useCallback(index => {
    set(items => items.filter((_, i) => i !== index));
  }, []);
  const filter = useCallback(predicate => set(items => items.filter(predicate)), []);
  const clear = useCallback(() => set([]), []);
  return { array, push, update, remove, filter, set, clear };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-boolean-ii', title: 'useBoolean II', difficulty: 'Easy',
    summary: 'Expose stable commands for turning boolean state on and off.',
    prompt: 'Implement an optimized boolean hook whose setTrue and setFalse functions retain their identity across renders.',
    topics: ['Custom hooks', 'useCallback', 'Boolean state'],
    requirements: ['Default to false.', 'Return { value, setTrue, setFalse }.', 'Memoize both commands without capturing the current value.'],
    example: { actions: 'Call setTrue() twice, then setFalse().', result: 'The value changes to true, stays true, and then becomes false.' },
    steps: ['Initialize boolean state.', 'Wrap constant-value setters in useCallback with empty dependencies.', 'Return the current value alongside the stable commands.'],
    pitfalls: ['Returning freshly created functions defeats the optimization.', 'A toggle is different from an explicit setTrue command.'],
    complexity: 'O(1) time and space per operation.',
    testCases: [{ action: 'Rerender after setTrue().', expected: 'Both method references remain unchanged.' }],
    assumptions: ['The premium follow-up is modeled on the public useBoolean API: initialValue, value, setTrue, and setFalse, with stable methods.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-boolean-ii',
    integrationNotes: ['const { value: open, setTrue: show, setFalse: hide } = useBoolean(); use show and hide as button handlers.'],
    code: String.raw`import { useCallback, useState } from 'react';

export default function useBoolean(initialValue = false) {
  const [value, setValue] = useState(Boolean(initialValue));
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return { value, setTrue, setFalse };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-breakpoint', title: 'useBreakpoint', difficulty: 'Medium',
    summary: 'Find the largest named minimum width that fits the viewport.',
    prompt: 'Create a hook that accepts named minimum widths and reports the active breakpoint as the browser is resized.',
    topics: ['Custom hooks', 'Responsive design', 'Event cleanup'],
    requirements: ['Accept a map such as { mobile: 0, tablet: 768, desktop: 1024 }.', 'Pick the highest threshold less than or equal to innerWidth, regardless of input order.', 'Remove the resize listener on unmount.'],
    example: { actions: 'Use the map above and resize the window from 800px to 1100px.', result: 'The return value changes from "tablet" to "desktop".' },
    steps: ['Store the current viewport width.', 'Subscribe once to resize events.', 'Sort thresholds numerically and find the last matching name.'],
    pitfalls: ['Object key order does not establish numerical threshold order.', 'A width equal to a threshold must include that breakpoint.'],
    complexity: 'O(b log b) time and O(b) space per render for b breakpoints.',
    testCases: [{ action: 'Resize to exactly 768px.', expected: 'Return tablet.' }, { action: 'Use a width below every minimum.', expected: 'Return undefined.' }],
    assumptions: ['Practice API: useBreakpoint(breakpoints) returns a name or undefined; thresholds are finite nonnegative minimum widths.', 'On the server, return undefined; ties follow the supplied object order.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-breakpoint',
    integrationNotes: ['const breakpoint = useBreakpoint({ small: 0, large: 960 }); render breakpoint or use it to select a layout.'],
    code: String.raw`import { useEffect, useState } from 'react';

export default function useBreakpoint(breakpoints) {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? undefined : window.innerWidth
  );
  useEffect(() => {
    const measure = () => setWidth(window.innerWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  let active;
  const entries = Object.entries(breakpoints).sort((a, b) => a[1] - b[1]);
  for (const [name, minimum] of entries) {
    if (width !== undefined && width >= minimum) active = name;
  }
  return active;
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-click-anywhere', title: 'useClickAnywhere', difficulty: 'Easy',
    summary: 'Call the latest handler for window click events.',
    prompt: 'Subscribe to browser-window clicks from a hook, keeping the listener current when the component receives a new callback.',
    topics: ['Custom hooks', 'DOM events', 'Stale closures'],
    requirements: ['Pass the MouseEvent to the handler.', 'Call the most recently committed handler.', 'Remove the listener when the component unmounts.'],
    example: { actions: 'Install a click counter, then click two different page elements.', result: 'The counter increases twice.' },
    steps: ['Store the committed handler in a ref.', 'Install one window listener that reads that ref.', 'Return the matching removeEventListener call as cleanup.'],
    pitfalls: ['An effect with empty dependencies and a captured handler keeps its first callback forever.', 'Removing a different function does not remove the listener.'],
    complexity: 'O(1) time and space per event, excluding the callback.',
    testCases: [{ action: 'Replace the callback and click.', expected: 'Only the replacement callback runs.' }, { action: 'Click after unmount.', expected: 'The hook callback does not run.' }],
    assumptions: ['Uses the normal bubbling phase on window; clicks stopped before reaching window do not reach this listener.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-click-anywhere',
    integrationNotes: ['useClickAnywhere(() => setClicks(count => count + 1)); call the hook at the top level of your component.'],
    code: String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useClickAnywhere(handler) {
  const latest = useRef(handler);
  useCommitEffect(() => { latest.current = handler; }, [handler]);
  useEffect(() => {
    const onClick = event => latest.current(event);
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-click-outside', title: 'useClickOutside', difficulty: 'Medium',
    summary: 'Detect a click beyond a referenced element and its descendants.',
    prompt: 'Implement a reusable outside-click hook for dismissing a popup while leaving clicks inside the popup alone.',
    topics: ['Custom hooks', 'Refs', 'DOM events'],
    requirements: ['Accept an element ref and a callback.', 'Ignore clicks within the element, including descendants.', 'Read the current ref and latest callback, and clean up the document listener.'],
    example: { actions: 'Attach the ref to a menu; click its child button, then the document body.', result: 'Only the body click invokes the outside handler.' },
    steps: ['Listen for document clicks in capture phase.', 'Check the event path or DOM containment against ref.current.', 'Invoke the latest callback only for clicks outside a mounted element.'],
    pitfalls: ['A null ref is not an outside click target.', 'Checking event.target === element misclassifies descendants.'],
    complexity: 'O(h) containment/path lookup for DOM depth h; O(1) hook storage.',
    testCases: [{ action: 'Click an element nested inside the ref target.', expected: 'No callback.' }, { action: 'Click body after removing the target.', expected: 'No callback while ref.current is null.' }],
    assumptions: ['Practice API: useClickOutside(ref, handler) returns nothing and listens for click, including events whose bubbling is stopped.', 'Portals outside the referenced DOM subtree count as outside.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-click-outside',
    integrationNotes: ['const menuRef = useRef(null); useClickOutside(menuRef, () => setOpen(false)); attach menuRef to the popup.'],
    code: String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useClickOutside(ref, handler) {
  const latest = useRef(handler);
  useCommitEffect(() => { latest.current = handler; }, [handler]);
  useEffect(() => {
    const onClick = event => {
      const element = ref.current;
      if (!element) return;
      const path = event.composedPath ? event.composedPath() : [];
      if (path.includes(element) || element.contains(event.target)) return;
      latest.current(event);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [ref]);
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-countdown', title: 'useCountdown', difficulty: 'Medium',
    summary: 'Start, pause, and reset a countdown that stops at zero.',
    prompt: 'Build a countdown hook that begins paused, decrements at a configurable interval, and exposes controls for starting, stopping, and resetting it.',
    topics: ['Custom hooks', 'Timers', 'State machines'],
    requirements: ['Return { count, isRunning, start, stop, reset }.', 'Never decrement below zero or install duplicate intervals.', 'Clear the interval on pause, reset, interval changes, and unmount.'],
    example: { actions: 'Initialize with 3 and a 1000ms interval, then start and wait 4 seconds.', result: 'count is 0 and isRunning is false.' },
    steps: ['Store count and running status together.', 'Use an interval only while running.', 'Apply each tick to the latest count and stop on the tick that reaches zero.'],
    pitfalls: ['Calling start twice should not double the speed.', 'Reset must pause the countdown as well as restore its value.'],
    complexity: 'O(1) work per tick and O(1) space.',
    testCases: [{ action: 'Pause at 2 and advance the clock.', expected: 'The value remains 2.' }, { action: 'Reset after reaching 0.', expected: 'The initial count is restored and the timer is stopped.' }],
    assumptions: ['Practice API: useCountdown(initialCount, intervalMs = 1000). The initial count is a nonnegative integer; reset restores the first-render count.', 'Ticks represent interval firings; this is not a wall-clock deadline timer.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-countdown',
    integrationNotes: ['const timer = useCountdown(30); render timer.count and connect timer.start, timer.stop, and timer.reset to buttons.'],
    code: String.raw`import { useCallback, useEffect, useRef, useState } from 'react';

export default function useCountdown(initialCount, intervalMs = 1000) {
  const initial = useRef(initialCount);
  const [state, setState] = useState({ count: initial.current, isRunning: false });
  const start = useCallback(() => setState(current =>
    current.count > 0 ? { ...current, isRunning: true } : current
  ), []);
  const stop = useCallback(() => setState(current => ({ ...current, isRunning: false })), []);
  const reset = useCallback(() => {
    setState({ count: initial.current, isRunning: false });
  }, []);
  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => {
      setState(current => {
        if (!current.isRunning) return current;
        const count = Math.max(0, current.count - 1);
        return { count, isRunning: count > 0 };
      });
    }, Math.max(1, intervalMs));
    return () => clearInterval(id);
  }, [state.isRunning, intervalMs]);
  return { ...state, start, stop, reset };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-counter-ii', title: 'useCounter II', difficulty: 'Easy',
    summary: 'Provide stable increment/decrement commands and a configurable reset target.',
    prompt: 'Implement the optimized counter hook: expose a count, React-compatible setter, and memoized increment, decrement, and reset methods.',
    topics: ['Custom hooks', 'useCallback', 'Functional updates'],
    requirements: ['Default the initial count to 0.', 'Keep increment, decrement, and setCount references stable.', 'Reset to the current initialValue argument; reset is stable while that argument is unchanged.'],
    example: { actions: 'Initialize at 5, increment twice, decrement, and reset.', result: 'The values are 5, 7, 6, and 5.' },
    steps: ['Initialize useState from initialValue.', 'Express relative changes as functional updates.', 'Include only initialValue in reset dependencies.'],
    pitfalls: ['Depending on count recreates relative commands unnecessarily.', 'Using a first-render ref for reset would ignore changes to the specified reset target.'],
    complexity: 'O(1) time and space per operation.',
    testCases: [{ action: 'Queue increment twice before rendering.', expected: 'The count increases by 2.' }, { action: 'Change initialValue and invoke reset.', expected: 'Reset uses the new initialValue.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-counter-ii',
    integrationNotes: ['const { count, increment, reset } = useCounter(10); display count and pass the commands directly as onClick handlers.'],
    code: String.raw`import { useCallback, useState } from 'react';

export default function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount(value => value + 1), []);
  const decrement = useCallback(() => setCount(value => value - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  return { count, increment, decrement, reset, setCount };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-cycle', title: 'useCycle', difficulty: 'Easy',
    summary: 'Cycle through positional values and wrap around after the last.',
    prompt: 'Implement useCycle(...values), returning the current value and a function that advances one position in the sequence.',
    topics: ['Custom hooks', 'Modulo arithmetic', 'State'],
    requirements: ['Start at the first supplied value.', 'Wrap the last position back to the first.', 'Preserve multiple advances queued within one event.'],
    example: { actions: 'Call useCycle("red", "green", "blue"), then cycle three times.', result: 'The value returns to "red".' },
    steps: ['Store a position rather than the value itself.', 'Increment the position through a functional state update.', 'Use modulo to map the position to the current sequence length.'],
    pitfalls: ['Searching for the current value breaks sequences containing duplicates.', 'An empty sequence needs a defined result.'],
    complexity: 'O(1) work per advance; O(n) argument storage for n values.',
    testCases: [{ action: 'Cycle through ["a", "a", "b"].', expected: 'Both a positions are visited before b.' }],
    assumptions: ['An empty sequence returns undefined and cycle does nothing. If the supplied sequence changes, retain the position modulo its new length.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-cycle',
    integrationNotes: ['const [mode, cycle] = useCycle("list", "grid"); show mode and assign cycle to a view-switching button.'],
    code: String.raw`import { useCallback, useState } from 'react';

export default function useCycle(...values) {
  const [index, setIndex] = useState(0);
  const length = values.length;
  const cycle = useCallback(() => {
    if (length > 0) setIndex(current => (current + 1) % length);
  }, [length]);
  return [length ? values[index % length] : undefined, cycle];
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-debounce', title: 'useDebounce', difficulty: 'Medium',
    summary: 'Publish a value after changes stop for the requested delay.',
    prompt: 'Implement a value-debouncing hook suitable for waiting until a user pauses typing before processing a search term.',
    topics: ['Custom hooks', 'Debouncing', 'Timers'],
    requirements: ['Return the initial value immediately.', 'Restart the waiting period whenever the input value or delay changes.', 'Cancel pending work on unmount.'],
    example: { actions: 'Change a value from "r" to "re" to "react" within 300ms.', result: 'With a 300ms delay, only "react" is published after the final pause.' },
    steps: ['Store the published value separately from the input.', 'Schedule publication in an effect.', 'Clear the previous timeout before scheduling another.'],
    pitfalls: ['Leaving older timeouts active publishes stale values.', 'Passing a function value directly to setState would execute it.'],
    complexity: 'O(1) work and storage per change.',
    testCases: [{ action: 'Change the input again before the delay expires.', expected: 'The original deadline does not publish the stale input.' }],
    assumptions: ['Practice API: useDebounce(value, delayMs); negative delays are treated as zero.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-debounce',
    integrationNotes: ['const debouncedTerm = useDebounce(term, 300); use debouncedTerm as a search effect dependency.'],
    code: String.raw`import { useEffect, useState } from 'react';

export default function useDebounce(value, delayMs) {
  const [debounced, setDebounced] = useState(() => value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(() => value), Math.max(0, delayMs));
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-default', title: 'useDefault', difficulty: 'Easy',
    summary: 'Substitute a fallback only for null or undefined state.',
    prompt: 'Build a state hook that exposes a fallback value when its internal state is nullish, while retaining the normal state setter contract.',
    topics: ['Custom hooks', 'Nullish values', 'State'],
    requirements: ['Return [displayValue, setValue].', 'Use the fallback only for null and undefined.', 'Allow direct values and functional updates.'],
    example: { actions: 'Use fallback "Guest", then set the value to "", null, and "Sam".', result: 'The displayed values are "", "Guest", and "Sam".' },
    steps: ['Keep raw state in useState.', 'Apply the nullish-coalescing operator only at the return boundary.', 'Expose the original setter so updater functions receive raw state.'],
    pitfalls: ['The || operator incorrectly replaces 0, false, and empty strings.', 'Replacing raw state with the fallback changes updater semantics.'],
    complexity: 'O(1) time and space.',
    testCases: [{ action: 'Set false, 0, and an empty string.', expected: 'Each value is returned unchanged.' }],
    assumptions: ['Practice API: useDefault(defaultValue, initialValue). Updater functions receive stored state, which may be nullish.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-default',
    integrationNotes: ['const [name, setName] = useDefault("Guest", null); display name and call setName(null) to show the fallback again.'],
    code: String.raw`import { useState } from 'react';

export default function useDefault(defaultValue, initialValue) {
  const [value, setValue] = useState(initialValue);
  return [value ?? defaultValue, setValue];
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-effect-once', title: 'useEffectOnce', difficulty: 'Easy',
    summary: 'Wrap a mount effect while preserving normal React cleanup semantics.',
    prompt: 'Write a hook for effects that do not rerun because of ordinary component rerenders and that may return an unmount cleanup function.',
    topics: ['Custom hooks', 'Effects', 'Strict Mode'],
    requirements: ['Accept an effect callback with optional cleanup.', 'Use an empty dependency array.', 'Preserve React Strict Mode setup-cleanup-setup behavior.'],
    example: { actions: 'Register a subscription, rerender the component, then unmount.', result: 'Ordinary rerenders do not resubscribe; unmount releases the subscription.' },
    steps: ['Forward the callback to useEffect.', 'Use an empty dependency array.', 'Let React invoke cleanup rather than adding a hasRun guard.'],
    pitfalls: ['A ref that skips the second Strict Mode setup can leave the component unsubscribed.', 'Captured props remain the initial props by design.'],
    complexity: 'O(1) hook overhead, excluding the effect and its cleanup.',
    testCases: [{ action: 'Mount inside StrictMode and unmount.', expected: 'Every executed setup has a corresponding cleanup.' }],
    assumptions: ['Once means once per production mount, not once across development Strict Mode checks or actual remounts.', 'Effect callbacks are synchronous; start asynchronous work inside them and return synchronous cleanup.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-effect-once',
    integrationNotes: ['useEffectOnce(() => { const unsubscribe = subscribe(); return unsubscribe; }); use only when initial captured values are sufficient.'],
    code: String.raw`import { useEffect } from 'react';

export default function useEffectOnce(effect) {
  useEffect(effect, []);
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-event-listener', title: 'useEventListener', difficulty: 'Medium',
    summary: 'Subscribe to a DOM event with current callbacks and reliable cleanup.',
    prompt: 'Create a generic event-listener hook that supports an EventTarget or element ref, customizable listener options, and changing callbacks.',
    topics: ['Custom hooks', 'DOM events', 'Refs'],
    requirements: ['Accept type, handler, optional target, and listener options.', 'Default the target to window.', 'Detach from the exact old target before subscribing to a new target.'],
    example: { actions: 'Listen for keydown on window and replace the handler after a rerender.', result: 'The next keydown reaches the replacement handler.' },
    steps: ['Update a handler ref after commit.', 'Resolve a ref target inside the subscription effect.', 'Use a matching target, event name, function, and capture option for cleanup.'],
    pitfalls: ['Reading ref.current during the first render usually yields null.', 'A ref object can stay stable while the DOM node it points to changes.'],
    complexity: 'O(1) subscription work per render and O(1) hook storage.',
    testCases: [{ action: 'Replace the target element and rerender.', expected: 'Events on the old target no longer call the handler.' }],
    assumptions: ['Practice API: useEventListener(type, handler, target?, options?). A target may be an EventTarget or { current: EventTarget | null }.', 'The subscription effect reconciles after each commit so ref target replacements are observed.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-event-listener',
    integrationNotes: ['useEventListener("keydown", event => setLastKey(event.key)); pass a ref as the third argument to scope the listener to an element.'],
    code: String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useEventListener(type, handler, target, options) {
  const latest = useRef(handler);
  useCommitEffect(() => { latest.current = handler; }, [handler]);
  useEffect(() => {
    const resolved = target === undefined
      ? (typeof window === 'undefined' ? null : window)
      : target && 'current' in target ? target.current : target;
    if (!resolved) return;
    const listener = event => latest.current(event);
    resolved.addEventListener(type, listener, options);
    return () => resolved.removeEventListener(type, listener, options);
  });
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-focus', title: 'useFocus', difficulty: 'Easy',
    summary: 'Pair an element ref with a stable programmatic focus command.',
    prompt: 'Implement a hook that lets a component attach a ref to an input and focus it from another control.',
    topics: ['Custom hooks', 'Refs', 'Focus'],
    requirements: ['Return [ref, focus].', 'Keep the focus function stable across renders.', 'Ignore focus calls when no element is mounted.'],
    example: { actions: 'Attach the ref to an input and invoke focus from a button.', result: 'The input becomes document.activeElement.' },
    steps: ['Create a persistent object ref.', 'Memoize a function that calls focus on ref.current.', 'Forward optional focus options to the DOM API.'],
    pitfalls: ['Capturing ref.current during render captures null on mount.', 'A focus command should not be invoked while rendering.'],
    complexity: 'O(1) hook overhead and storage.',
    testCases: [{ action: 'Invoke focus before assigning a node.', expected: 'No exception.' }],
    assumptions: ['Practice API: useFocus() returns [ref, focus]; the target is a focusable DOM element.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-focus',
    integrationNotes: ['const [inputRef, focusInput] = useFocus(); attach inputRef to an input and use onClick={() => focusInput()}.'],
    code: String.raw`import { useCallback, useRef } from 'react';

export default function useFocus() {
  const ref = useRef(null);
  const focus = useCallback(options => ref.current?.focus(options), []);
  return [ref, focus];
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-hover', title: 'useHover', difficulty: 'Medium',
    summary: 'Track pointer entry and exit on an element, including replacement nodes.',
    prompt: 'Implement a hover hook that supplies a ref for an element and reports whether the mouse is currently within that element.',
    topics: ['Custom hooks', 'Callback refs', 'DOM events'],
    requirements: ['Return [ref, hovered].', 'Use mouseenter/mouseleave so movement between children does not flicker.', 'Remove listeners when the target is replaced or unmounted.'],
    example: { actions: 'Enter a card, move over its child, then leave the card.', result: 'hovered becomes true, stays true, and finally becomes false.' },
    steps: ['Use a stable callback ref to store the mounted node.', 'Subscribe to entry and exit events for that node.', 'Reset hover state when switching nodes and clean up old listeners.'],
    pitfalls: ['Mouseover and mouseout also fire when crossing descendants.', 'An object ref alone does not cause an effect to rerun when its node changes.'],
    complexity: 'O(1) per event and O(1) storage.',
    testCases: [{ action: 'Replace a hovered element with another node.', expected: 'Hover resets and events on the old element have no effect.' }],
    assumptions: ['Practice API: useHover() returns a callback ref and a boolean; it tracks mouse hover rather than touch contact.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-hover',
    integrationNotes: ['const [ref, hovered] = useHover(); return <div ref={ref}>{hovered ? "Over" : "Away"}</div>.'],
    code: String.raw`import { useCallback, useEffect, useState } from 'react';

export default function useHover() {
  const [node, setNode] = useState(null);
  const [hovered, setHovered] = useState(false);
  const ref = useCallback(element => { setNode(element); }, []);
  useEffect(() => {
    setHovered(false);
    if (!node) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    node.addEventListener('mouseenter', enter);
    node.addEventListener('mouseleave', leave);
    return () => {
      node.removeEventListener('mouseenter', enter);
      node.removeEventListener('mouseleave', leave);
    };
  }, [node]);
  return [ref, hovered];
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-idle', title: 'useIdle', difficulty: 'Medium',
    summary: 'Report inactivity after a quiet period and resume on user input.',
    prompt: 'Implement an idle detector that becomes true after a configurable period without user activity, then becomes false on the next activity event.',
    topics: ['Custom hooks', 'Timers', 'DOM events'],
    requirements: ['Begin active and restart the timer when activity occurs.', 'Observe pointer movement, pointer down, key presses, and scrolling.', 'Clear the timer and all listeners on unmount.'],
    example: { actions: 'Use a 5000ms threshold, wait 5 seconds, then press a key.', result: 'idle becomes true, then immediately false.' },
    steps: ['Keep a boolean idle state.', 'Use one activity handler to clear and restart a timeout.', 'Install all activity listeners and release them together.'],
    pitfalls: ['Failing to clear the previous timeout makes the user idle while they are active.', 'Leaving a timeout after unmount creates unnecessary work.'],
    complexity: 'O(1) per activity event and O(1) storage.',
    testCases: [{ action: 'Move the pointer just before the deadline.', expected: 'The full idle interval starts again.' }],
    assumptions: ['Practice API: useIdle(timeoutMs = 60000) returns a boolean. Changing timeout restarts the activity window.', 'Visibility changes do not count as user activity in this version.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-idle',
    integrationNotes: ['const idle = useIdle(30000); show an away indicator when idle is true.'],
    code: String.raw`import { useEffect, useState } from 'react';

export default function useIdle(timeoutMs = 60000) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer;
    const activity = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), Math.max(0, timeoutMs));
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll'];
    for (const event of events) window.addEventListener(event, activity, true);
    activity();
    return () => {
      clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, activity, true);
    };
  }, [timeoutMs]);
  return idle;
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-input-control', title: 'useInputControl', difficulty: 'Medium',
    summary: 'Track a controlled input value, persistent interaction flags, and differences.',
    prompt: 'Build an input-state hook with change and blur handlers, dirty and touched flags, a comparison to the original value, and a full reset.',
    topics: ['Custom hooks', 'Controlled inputs', 'Form state'],
    requirements: ['Return value, dirty, touched, different, handleChange, handleBlur, and reset.', 'Keep dirty true after a change even if the value returns to its initial string.', 'Compare and reset against the first-render value.'],
    example: { actions: 'Start with "Ada", type "Ada!", change back to "Ada", and blur.', result: 'dirty and touched are true, while different is false.' },
    steps: ['Capture the initial string in a ref.', 'Store current value and persistent interaction flags together.', 'Derive different from the current and initial strings; reset all state at once.'],
    pitfalls: ['dirty is historical, while different is a current comparison.', 'Later initialValue arguments must not silently change the reset baseline.'],
    complexity: 'O(1) state operations, excluding string comparison length.',
    testCases: [{ action: 'Change away and back, then reset.', expected: 'Returning keeps dirty true; reset clears dirty and touched.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-input-control',
    integrationNotes: ['const input = useInputControl(""); bind input.value, input.handleChange, and input.handleBlur to a text input.'],
    code: String.raw`import { useCallback, useRef, useState } from 'react';

export default function useInputControl(initialValue = '') {
  const initial = useRef(initialValue);
  const [state, setState] = useState({ value: initial.current, dirty: false, touched: false });
  const handleChange = useCallback(event => {
    const value = event.target.value;
    setState(current => ({ ...current, value, dirty: true }));
  }, []);
  const handleBlur = useCallback(() => {
    setState(current => ({ ...current, touched: true }));
  }, []);
  const reset = useCallback(() => {
    setState({ value: initial.current, dirty: false, touched: false });
  }, []);
  return { ...state, different: state.value !== initial.current, handleChange, handleBlur, reset };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-interval', title: 'useInterval', difficulty: 'Medium',
    summary: 'Run a fresh callback on a stable interval and pause with null.',
    prompt: 'Create an interval hook that does not restart its clock merely because the callback changes.',
    topics: ['Custom hooks', 'Timers', 'Stale closures'],
    requirements: ['Accept a callback and a delay in milliseconds.', 'Use the latest committed callback at every tick.', 'Pause for a null delay and clean up on delay changes or unmount.'],
    example: { actions: 'Set a 1000ms delay, rerender with a new callback after 500ms, then wait 500ms.', result: 'The new callback runs at the original one-second deadline.' },
    steps: ['Update a callback ref after each relevant commit.', 'Create the interval in an effect depending only on the delay.', 'Clear the interval from the effect cleanup.'],
    pitfalls: ['Adding callback to interval dependencies continually restarts the clock.', 'Closing over the first callback produces stale state.'],
    complexity: 'O(1) overhead per tick and O(1) storage.',
    testCases: [{ action: 'Change delay to null, then advance time.', expected: 'No more callbacks run until a numeric delay is restored.' }],
    assumptions: ['Practice API: useInterval(callback, delayMs), with null disabling the interval; non-null delays are nonnegative finite numbers.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-interval',
    integrationNotes: ['useInterval(() => setElapsed(value => value + 1), running ? 1000 : null);'],
    code: String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useInterval(callback, delayMs) {
  const latest = useRef(callback);
  useCommitEffect(() => { latest.current = callback; }, [callback]);
  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => latest.current(), Math.max(0, delayMs));
    return () => clearInterval(id);
  }, [delayMs]);
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-key-press', title: 'useKeyPress', difficulty: 'Medium',
    summary: 'Track whether a requested keyboard key is currently held.',
    prompt: 'Implement a keyboard-state hook that marks a key as pressed on keydown and releases it on keyup or window blur.',
    topics: ['Custom hooks', 'Keyboard events', 'Cleanup'],
    requirements: ['Match KeyboardEvent.key.', 'Ignore unrelated keys and handle repeat keydown events safely.', 'Release the state on window blur and remove all listeners on unmount.'],
    example: { actions: 'Track "Escape", press it, then switch windows before releasing it.', result: 'The value becomes true on press and false when the browser loses focus.' },
    steps: ['Store one pressed boolean.', 'Install matching keydown and keyup handlers.', 'Add a blur reset to avoid stuck pressed state.'],
    pitfalls: ['Event.code and event.key have different meanings.', 'A missed keyup after switching windows can leave state stuck.'],
    complexity: 'O(1) per keyboard event and O(1) storage.',
    testCases: [{ action: 'Press an unrelated key.', expected: 'The tracked key remains unpressed.' }],
    assumptions: ['Practice API: useKeyPress(targetKey) returns a boolean; matching is case-sensitive against event.key.', 'Changing targetKey resets pressed state.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-key-press',
    integrationNotes: ['const escapePressed = useKeyPress("Escape"); display keyboard state or react to it in a component effect.'],
    code: String.raw`import { useEffect, useState } from 'react';

export default function useKeyPress(targetKey) {
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    setPressed(false);
    const down = event => { if (event.key === targetKey) setPressed(true); };
    const up = event => { if (event.key === targetKey) setPressed(false); };
    const release = () => setPressed(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', release);
    };
  }, [targetKey]);
  return pressed;
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-map', title: 'useMap', difficulty: 'Medium',
    summary: 'Maintain Map state with immutable writes, removals, and reset.',
    prompt: 'Create a hook for a JavaScript Map with methods that publish new Map instances instead of mutating rendered state.',
    topics: ['Custom hooks', 'Map', 'Immutable state'],
    requirements: ['Return { map, set, remove, clear, reset }.', 'Support keys of any JavaScript type.', 'Use the latest state for queued operations and preserve the initial reset snapshot.'],
    example: { actions: 'Start with [["tea", 2]], call set("coffee", 1), then remove("tea").', result: 'The map contains only coffee → 1.' },
    steps: ['Copy initial entries into a reset snapshot and current state.', 'Clone the current map before changing a key.', 'Memoize commands and construct a fresh map for reset or clear.'],
    pitfalls: ['Mutating a Map and reusing its identity can skip React rendering.', 'Object keys are compared by identity, not by their fields.'],
    complexity: 'O(n) time and space per copying operation for n entries; clear is O(1).',
    testCases: [{ action: 'Set two keys in one event and inspect the old map.', expected: 'Both new keys exist; the old map is unchanged.' }],
    assumptions: ['Practice API: useMap(initialEntries = []) returns an object; set(key, value) assigns one entry.', 'Initial entries may be an iterable or Map. Reset uses a shallow first-render snapshot.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-map',
    integrationNotes: ['const { map, set } = useMap([["visits", 0]]); render [...map] and call set("visits", 1).'],
    code: String.raw`import { useCallback, useRef, useState } from 'react';

export default function useMap(initialEntries = []) {
  const initial = useRef(null);
  if (initial.current === null) initial.current = new Map(initialEntries);
  const [map, setMap] = useState(() => new Map(initial.current));
  const set = useCallback((key, value) => {
    setMap(current => new Map(current).set(key, value));
  }, []);
  const remove = useCallback(key => {
    setMap(current => {
      const next = new Map(current);
      next.delete(key);
      return next;
    });
  }, []);
  const clear = useCallback(() => setMap(new Map()), []);
  const reset = useCallback(() => setMap(new Map(initial.current)), []);
  return { map, set, remove, clear, reset };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-media-query', title: 'useMediaQuery', difficulty: 'Medium',
    summary: 'Subscribe to media-query matches and switch subscriptions when the query changes.',
    prompt: 'Implement a hook that returns whether a CSS media query matches and updates when the browser reports a change.',
    topics: ['Custom hooks', 'Responsive design', 'Browser APIs'],
    requirements: ['Read the initial match from matchMedia(query).matches.', 'Listen to the MediaQueryList change event.', 'Detach from the old query when the query string changes.'],
    example: { actions: 'Observe "(min-width: 800px)" and cross the 800px viewport boundary.', result: 'The return value follows the media query match.' },
    steps: ['Create a MediaQueryList for the current query.', 'Store its match and subscribe to change.', 'Remove the exact listener during cleanup; use a server fallback when window is absent.'],
    pitfalls: ['A resize listener alone misses orientation and preference queries.', 'Subscribing only on mount leaves a changed query unobserved.'],
    complexity: 'O(1) hook work per notification and O(1) storage.',
    testCases: [{ action: 'Switch from a matching query to a nonmatching query.', expected: 'The result updates and the old query listener is removed.' }],
    assumptions: ['The server fallback is false. Client environments provide the modern MediaQueryList addEventListener API.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-media-query',
    integrationNotes: ['const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)"); use it to simplify animations.'],
    code: String.raw`import { useEffect, useState } from 'react';

export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener('change', update);
    update();
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-mediated-state', title: 'useMediatedState', difficulty: 'Medium',
    summary: 'Route state updates through either a transforming or dispatching mediator.',
    prompt: 'Implement a state hook whose original mediator may transform a proposed value or decide when to dispatch it. Support normal functional updates and retain the first mediator across rerenders.',
    topics: ['Custom hooks', 'State mediation', 'Refs'],
    requirements: ['Accept mediator followed by initialState and return [state, setState].', 'For a unary mediator, store its returned value; for a two-argument mediator, provide a dispatch function.', 'Retain the original mediator and a stable public setter.'],
    example: { actions: 'Use value => value.trim(), initialize with "", then set "  hello  ".', result: 'The stored value is "hello".' },
    steps: ['Capture the initial mediator in a ref.', 'Resolve functional proposals against the latest dispatched value.', 'Call the mediator outside React updater functions so interceptors can safely perform asynchronous work.'],
    pitfalls: ['Running a side-effecting mediator inside a state updater can duplicate work in Strict Mode.', 'Replacing the mediator on rerender changes the stated contract.'],
    complexity: 'O(1) hook overhead and storage; mediator complexity is application-defined.',
    testCases: [{ action: 'Replace the mediator prop, then set a value.', expected: 'The original mediator still applies.' }, { action: 'Use a two-argument mediator that does not dispatch.', expected: 'The state does not change.' }],
    assumptions: ['The initial value is not mediated. Function proposals are updater functions, following useState semantics.', 'Mediator arity is determined by function.length; a dispatching mediator must declare two ordinary parameters.', 'Deferred dispatches commit in invocation order and are ignored after unmount.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-mediated-state',
    integrationNotes: ['const [name, setName] = useMediatedState(value => value.replace(/ +/g, " "), ""); bind setName(event.target.value) to an input.'],
    code: String.raw`import { useCallback, useEffect, useRef, useState } from 'react';

export default function useMediatedState(mediator, initialState) {
  const originalMediator = useRef(mediator);
  const [state, commit] = useState(initialState);
  const current = useRef(state);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const dispatch = useCallback(proposal => {
    if (!mounted.current) return;
    const value = typeof proposal === 'function' ? proposal(current.current) : proposal;
    current.current = value;
    commit(() => value);
  }, []);
  const setState = useCallback(proposal => {
    if (!mounted.current) return;
    const value = typeof proposal === 'function' ? proposal(current.current) : proposal;
    const mediate = originalMediator.current;
    if (mediate.length >= 2) mediate(value, dispatch);
    else {
      const transformed = mediate(value);
      dispatch(() => transformed);
    }
  }, [dispatch]);
  return [state, setState];
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-object', title: 'useObject', difficulty: 'Medium',
    summary: 'Update a plain object through immutable set, merge, remove, and reset operations.',
    prompt: 'Implement an object-state hook with commands for replacing a property, merging a patch, deleting a property, clearing, and restoring initial values.',
    topics: ['Custom hooks', 'Objects', 'Immutable state'],
    requirements: ['Return { object, set, merge, remove, clear, reset }.', 'Keep commands stable and derive each update from the latest object.', 'Use shallow copies and leave older state objects unchanged.'],
    example: { actions: 'Start with { name: "Ada" }, set("age", 30), then remove("name").', result: 'The object becomes { age: 30 }.' },
    steps: ['Snapshot initial own enumerable properties.', 'Use object spread for replacements and patches.', 'Delete keys only from a newly created object.'],
    pitfalls: ['Deleting a key from the existing object mutates already-rendered state.', 'Shallow operations do not copy nested objects.'],
    complexity: 'O(n) time and space per shallow copy for n properties; clear is O(1).',
    testCases: [{ action: 'Merge two patches in the same event.', expected: 'Both patches are reflected in the final object.' }],
    assumptions: ['Practice API: useObject(initialObject = {}); set(key, value) replaces one property and merge(patch) applies a shallow patch.', 'Values are plain data objects; reset restores a first-render shallow snapshot.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-object',
    integrationNotes: ['const { object: profile, set } = useObject({ name: "" }); set("name", event.target.value) updates the name field.'],
    code: String.raw`import { useCallback, useRef, useState } from 'react';

export default function useObject(initialObject = {}) {
  const initial = useRef(null);
  if (initial.current === null) initial.current = { ...initialObject };
  const [object, setObject] = useState(() => ({ ...initial.current }));
  const set = useCallback((key, value) => {
    setObject(current => ({ ...current, [key]: value }));
  }, []);
  const merge = useCallback(patch => setObject(current => ({ ...current, ...patch })), []);
  const remove = useCallback(key => {
    setObject(current => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);
  const clear = useCallback(() => setObject({}), []);
  const reset = useCallback(() => setObject({ ...initial.current }), []);
  return { object, set, merge, remove, clear, reset };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-previous', title: 'usePrevious', difficulty: 'Easy',
    summary: 'Remember the previous distinct committed value, ignoring repeated values.',
    prompt: 'Create a hook that returns the value before the latest distinct value, rather than simply the value from the last render.',
    topics: ['Custom hooks', 'Refs', 'Value history'],
    requirements: ['Return undefined before the first change.', 'Ignore repeated equal inputs.', 'Update history only after a render commits.'],
    example: { actions: 'Render values A, A, B, B, C.', result: 'The hook returns undefined, undefined, A, A, B.' },
    steps: ['Store the last committed value and its distinct predecessor.', 'Derive the current answer before the effect updates history.', 'Advance history in the effect only when Object.is reports a change.'],
    pitfalls: ['A plain previous-render ref loses the predecessor when an unrelated rerender occurs.', 'Mutating history during render can record values from abandoned renders.'],
    complexity: 'O(1) time and space.',
    testCases: [{ action: 'Render 1, 2, 2, 3.', expected: 'Return undefined, 1, 1, 2.' }, { action: 'Render NaN twice.', expected: 'Treat NaN as unchanged.' }],
    assumptions: ['The catalog specifies previous distinct state; this implementation compares with Object.is and stores committed render history.', 'Object equality is by reference; no deep comparison is performed.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-previous',
    integrationNotes: ['const previousScore = usePrevious(score); compare score to previousScore to show whether the score rose or fell.'],
    code: String.raw`import { useEffect, useRef } from 'react';

export default function usePrevious(value) {
  const history = useRef({ current: value, previous: undefined });
  const changed = !Object.is(history.current.current, value);
  const previous = changed ? history.current.current : history.current.previous;
  useEffect(() => {
    if (!Object.is(history.current.current, value)) {
      history.current = { current: value, previous: history.current.current };
    }
  }, [value]);
  return previous;
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-query', title: 'useQuery', difficulty: 'Medium',
    summary: 'Manage promise status while ignoring obsolete requests and unmounted results.',
    prompt: 'Implement useQuery(fn, deps) to run a promise-producing function when dependencies change and expose loading, success, or error state for the active request.',
    topics: ['Custom hooks', 'Async state', 'Race conditions'],
    requirements: ['Default deps to [] and return { status: "loading" } when a request starts.', 'On fulfillment return { status: "success", data }; on rejection return { status: "error", error }.', 'Ignore both fulfilled and rejected results from obsolete or unmounted requests.'],
    example: { actions: 'Start request A, change the dependencies to start B, let B resolve, then let A resolve.', result: 'The result remains B; the stale A result is ignored.' },
    steps: ['Store one discriminated result object to prevent incompatible fields.', 'Start a request in an effect controlled by deps.', 'Give each effect an active flag and retire it in cleanup; catch synchronous throws as errors too.'],
    pitfalls: ['Adding an inline fn to dependencies can cause an endless request loop.', 'Handling only successful stale responses still allows stale errors to overwrite the latest result.'],
    complexity: 'O(1) hook overhead and storage per in-flight effect; underlying request cost is external.',
    testCases: [{ action: 'Reject a stale request after a newer one succeeds.', expected: 'Keep the newer success state.' }, { action: 'Throw synchronously from fn.', expected: 'Expose the thrown value through error state.' }],
    assumptions: ['The public API is useQuery(fn, deps = []), not a query-key/options API. The caller lists all values that should restart the request in deps.', 'No cache, retries, or network cancellation is implemented; cleanup prevents obsolete state writes.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-query',
    integrationNotes: ['const result = useQuery(() => fetch("/api/items/" + id).then(response => { if (!response.ok) throw new Error("Request failed"); return response.json(); }), [id]); branch on result.status before reading data or error.'],
    code: String.raw`import { useEffect, useState } from 'react';

export default function useQuery(fn, deps = []) {
  const [result, setResult] = useState({ status: 'loading' });
  useEffect(() => {
    let active = true;
    setResult({ status: 'loading' });
    async function execute() {
      try {
        const data = await fn();
        if (active) setResult({ status: 'success', data });
      } catch (error) {
        if (active) setResult({ status: 'error', error });
      }
    }
    execute();
    return () => { active = false; };
  }, deps);
  return result;
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-set', title: 'useSet', difficulty: 'Medium',
    summary: 'Manage unique values through immutable Set updates.',
    prompt: 'Implement a Set hook with add, remove, toggle, reset, and clear methods, preserving React-observable object identities.',
    topics: ['Custom hooks', 'Set', 'Immutable state'],
    requirements: ['Return { set, add, remove, toggle, reset, clear }.', 'Clone before every membership update and support queued operations.', 'Restore the supplied initialState object on reset; clear creates a new empty Set.'],
    example: { actions: 'Start with Set(["a"]), toggle("a"), add("b"), and reset.', result: 'Membership goes from a, to empty, to b, then back to the initial a Set.' },
    steps: ['Store the supplied initial Set.', 'Clone previous state before changing membership.', 'Memoize the relative commands and let reset track its initialState argument.'],
    pitfalls: ['Set.add mutates its receiver.', 'Reset and clear have different contents and object-identity behavior.'],
    complexity: 'O(n) time and space for cloning a Set with n values; reset and clear are O(1).',
    testCases: [{ action: 'Add a duplicate value.', expected: 'Membership contains that value only once.' }, { action: 'Reset after changes.', expected: 'The returned Set is the supplied initialState object.' }],
    assumptions: ['Treat returned and initial Set objects as read-only outside the hook. Reset follows the currently supplied initialState argument.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-set',
    integrationNotes: ['const { set: selected, toggle } = useSet(initialSelection); call toggle(id) when a checkbox changes and read selected.has(id).'],
    code: String.raw`import { useCallback, useState } from 'react';

const EMPTY_SET = new Set();

export default function useSet(initialState = EMPTY_SET) {
  const [set, setSet] = useState(initialState);
  const add = useCallback(item => {
    setSet(current => new Set(current).add(item));
  }, []);
  const remove = useCallback(item => {
    setSet(current => {
      const next = new Set(current);
      next.delete(item);
      return next;
    });
  }, []);
  const toggle = useCallback(item => {
    setSet(current => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }, []);
  const reset = useCallback(() => setSet(initialState), [initialState]);
  const clear = useCallback(() => setSet(new Set()), []);
  return { set, add, remove, toggle, reset, clear };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-state-with-reset', title: 'useStateWithReset', difficulty: 'Easy',
    summary: 'Extend useState with a stable reset to the original initialized value.',
    prompt: 'Write a hook that behaves like useState but also returns a reset command. Preserve lazy initialization and updater-function behavior.',
    topics: ['Custom hooks', 'Lazy initialization', 'State'],
    requirements: ['Return [state, setState, reset].', 'Evaluate a lazy initializer through useState.', 'Reset to the first initialized value without rerunning the initializer.'],
    example: { actions: 'Initialize lazily to 10, set to 20, and reset.', result: 'State returns to 10 and reset does not call the initializer again.' },
    steps: ['Initialize state using the original useState contract.', 'Capture the initialized result in a ref.', 'Memoize reset and wrap the stored result so function-valued state remains a value.'],
    pitfalls: ['Calling a lazy initializer on each render does unnecessary work.', 'Later initial arguments must not overwrite the reset snapshot.'],
    complexity: 'O(1) overhead and storage, excluding initialization.',
    testCases: [{ action: 'Pass a different initial argument after mounting, then reset.', expected: 'Return to the original initialized value.' }],
    assumptions: ['Reset uses the first mount value by reference; callers must follow normal immutable state conventions.', 'React may invoke a lazy initializer twice during development Strict Mode checks.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-state-with-reset',
    integrationNotes: ['const [draft, setDraft, resetDraft] = useStateWithReset(() => createDraft()); connect resetDraft to a cancel button.'],
    code: String.raw`import { useCallback, useRef, useState } from 'react';

export default function useStateWithReset(initialValue) {
  const [state, setState] = useState(initialValue);
  const initial = useRef(state);
  const reset = useCallback(() => setState(() => initial.current), []);
  return [state, setState, reset];
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-step', title: 'useStep', difficulty: 'Medium',
    summary: 'Navigate a bounded one-based step counter for a wizard.',
    prompt: 'Implement a step controller with next, previous, direct selection, reset, and flags indicating whether movement is possible.',
    topics: ['Custom hooks', 'Bounds', 'State'],
    requirements: ['Keep the step between 1 and maxStep.', 'Return step, canGoToNextStep, canGoToPrevStep, goToNextStep, goToPrevStep, setStep, and reset.', 'Clamp values when maxStep shrinks or a direct update exceeds the range.'],
    example: { actions: 'Use 3 steps and call next four times.', result: 'The step stops at 3 and canGoToNextStep becomes false.' },
    steps: ['Normalize the positive maximum and define one clamping rule.', 'Use functional updates for relative navigation.', 'Derive navigation flags from the clamped step and reconcile changes to the maximum.'],
    pitfalls: ['Separate disabled-button logic does not protect programmatic method calls.', 'A smaller maximum can invalidate the current step.'],
    complexity: 'O(1) time and space per operation.',
    testCases: [{ action: 'Set a step above the maximum and then decrease maxStep.', expected: 'Both operations clamp the current step to a valid value.' }],
    assumptions: ['Practice API: useStep(maxStep, initialStep = 1) returns an object. maxStep is a finite positive integer.', 'Direct setStep supports values or updater functions; reset uses the first initialStep clamped to the current maximum.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-step',
    integrationNotes: ['const wizard = useStep(4); render wizard.step and disable Next when !wizard.canGoToNextStep.'],
    code: String.raw`import { useCallback, useEffect, useRef, useState } from 'react';

export default function useStep(maxStep, initialStep = 1) {
  const maximum = Math.max(1, Math.floor(maxStep));
  const initial = useRef(initialStep);
  const clamp = useCallback(value => Math.min(maximum, Math.max(1, Math.floor(value))), [maximum]);
  const [storedStep, updateStep] = useState(() => clamp(initialStep));
  const step = clamp(storedStep);
  useEffect(() => { updateStep(current => clamp(current)); }, [clamp]);
  const setStep = useCallback(proposal => {
    updateStep(current => clamp(typeof proposal === 'function' ? proposal(clamp(current)) : proposal));
  }, [clamp]);
  const goToNextStep = useCallback(() => setStep(current => current + 1), [setStep]);
  const goToPrevStep = useCallback(() => setStep(current => current - 1), [setStep]);
  const reset = useCallback(() => setStep(initial.current), [setStep]);
  return {
    step, canGoToNextStep: step < maximum, canGoToPrevStep: step > 1,
    setStep, goToNextStep, goToPrevStep, reset,
  };
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-throttle', title: 'useThrottle', difficulty: 'Medium',
    summary: 'Publish the latest value at most once per time window.',
    prompt: 'Implement a throttled value hook that updates immediately after an idle window and keeps the latest pending input for a trailing update during a busy window.',
    topics: ['Custom hooks', 'Throttling', 'Timers'],
    requirements: ['Return the initial input immediately.', 'Preserve the current window deadline when more values arrive.', 'Publish the latest queued input at the trailing edge and cancel pending timers on unmount.'],
    example: { actions: 'With delay 100ms, input changes at 20ms, 50ms, and 90ms.', result: 'At 100ms, publish the input from 90ms instead of postponing to 190ms.' },
    steps: ['Track the timestamp of the last publication.', 'Publish immediately when enough time has passed.', 'Otherwise schedule only the remaining window time, replacing stale pending input through effect cleanup.'],
    pitfalls: ['Restarting a full delay on every change implements debounce, not throttle.', 'A trailing timer must use the latest input rather than the first input in its window.'],
    complexity: 'O(1) work per change and O(1) storage.',
    testCases: [{ action: 'Send frequent changes within one delay window.', expected: 'Publish the newest value at the original window boundary.' }],
    assumptions: ['Practice API: useThrottle(value, delayMs), with an immediate initial value and trailing updates; negative delays are zero.', 'Changing delay recalculates the deadline from the last actual publication.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-throttle',
    integrationNotes: ['const throttledPosition = useThrottle(position, 100); use it for a lower-frequency position readout.'],
    code: String.raw`import { useEffect, useRef, useState } from 'react';

export default function useThrottle(value, delayMs) {
  const [throttled, setThrottled] = useState(() => value);
  const lastPublished = useRef(Date.now());
  const publishedValue = useRef(value);
  useEffect(() => {
    if (Object.is(value, publishedValue.current)) return;
    const publish = () => {
      lastPublished.current = Date.now();
      publishedValue.current = value;
      setThrottled(() => value);
    };
    const remaining = Math.max(0, delayMs) - (Date.now() - lastPublished.current);
    if (remaining <= 0) {
      publish();
      return;
    }
    const id = setTimeout(publish, remaining);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return throttled;
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-timeout', title: 'useTimeout', difficulty: 'Medium',
    summary: 'Invoke the latest callback once after a configurable delay.',
    prompt: 'Implement a timeout hook that preserves its deadline when the callback changes, restarts when the delay changes, and cancels on unmount.',
    topics: ['Custom hooks', 'Timers', 'Stale closures'],
    requirements: ['Accept callback and delayMs; null disables the timer.', 'Use the latest committed callback at the deadline.', 'Restart only when delay changes and clean up the old timeout.'],
    example: { actions: 'Schedule for 500ms, replace the callback at 300ms, then wait 200ms.', result: 'The replacement callback runs once at the original deadline.' },
    steps: ['Store the callback in a ref updated after commit.', 'Schedule an effect-owned timeout using only delay dependencies.', 'Clear that timeout in cleanup.'],
    pitfalls: ['Depending on callback identity can postpone the timeout on every render.', 'A callback ref does not replace timer cleanup.'],
    complexity: 'O(1) scheduling overhead and O(1) storage.',
    testCases: [{ action: 'Unmount before the timeout expires.', expected: 'The callback never runs.' }],
    assumptions: ['Practice API: useTimeout(callback, delayMs) returns nothing; null cancels and a new numeric delay starts a fresh timeout.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-timeout',
    integrationNotes: ['useTimeout(() => setVisible(false), visible ? 3000 : null); use it for a temporary notice.'],
    code: String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useTimeout(callback, delayMs) {
  const latest = useRef(callback);
  useCommitEffect(() => { latest.current = callback; }, [callback]);
  useEffect(() => {
    if (delayMs === null) return;
    const id = setTimeout(() => latest.current(), Math.max(0, delayMs));
    return () => clearTimeout(id);
  }, [delayMs]);
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-toggle', title: 'useToggle', difficulty: 'Easy',
    summary: 'Flip a boolean with a stable command or explicitly choose its next value.',
    prompt: 'Create a boolean toggle hook whose command can invert the current state or accept an explicit boolean target.',
    topics: ['Custom hooks', 'Boolean state', 'Functional updates'],
    requirements: ['Default to false and return [value, toggle].', 'Toggle the latest value when no boolean argument is supplied.', 'Keep the toggle command stable across renders.'],
    example: { actions: 'Start false, toggle(), toggle(true), then toggle(false).', result: 'The values are true, true, and false.' },
    steps: ['Store a boolean in useState.', 'Use a functional update for inversion.', 'Only treat actual boolean arguments as explicit assignments.'],
    pitfalls: ['A button passes an event argument; treating every truthy argument as true breaks onClick={toggle}.', 'Capturing value loses queued inversions.'],
    complexity: 'O(1) time and space.',
    testCases: [{ action: 'Call toggle twice in one event.', expected: 'The original value is restored.' }],
    assumptions: ['Practice API: useToggle(initialValue = false) returns a tuple. Nonboolean arguments, including click events, request inversion.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-toggle',
    integrationNotes: ['const [expanded, toggle] = useToggle(); use toggle directly as a button onClick handler and expanded for aria-expanded.'],
    code: String.raw`import { useCallback, useState } from 'react';

export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(Boolean(initialValue));
  const toggle = useCallback(next => {
    setValue(current => typeof next === 'boolean' ? next : !current);
  }, []);
  return [value, toggle];
}`,
  }),
  defineChallenge({
    slug: 'gfe-use-window-size', title: 'useWindowSize', difficulty: 'Medium',
    summary: 'Return the viewport width and height and update on resize.',
    prompt: 'Write a hook that measures window.innerWidth and window.innerHeight immediately and keeps those dimensions current as the window changes size.',
    topics: ['Custom hooks', 'Browser APIs', 'Event cleanup'],
    requirements: ['Return { width, height }.', 'Measure on mount and on each resize event.', 'Unsubscribe from resize on unmount.'],
    example: { actions: 'Resize the viewport to 1280 by 720.', result: 'The hook reports { width: 1280, height: 720 }.' },
    steps: ['Define one measurement function.', 'Initialize state from the browser dimensions.', 'Subscribe to resize and avoid publishing an identical measurement.'],
    pitfalls: ['screen.width measures the physical display rather than the viewport.', 'Waiting for the first resize leaves initial dimensions unavailable.'],
    complexity: 'O(1) work per resize and O(1) storage.',
    testCases: [{ action: 'Resize width and height together.', expected: 'Both values update in the same state object.' }],
    assumptions: ['On the server both dimensions are undefined; normal client renders read window immediately.'],
    sourceUrl: 'https://www.greatfrontend.com/questions/javascript/use-window-size',
    integrationNotes: ['const { width, height } = useWindowSize(); display the values in a viewport-size readout.'],
    code: String.raw`import { useEffect, useState } from 'react';

function measure() {
  return typeof window === 'undefined'
    ? { width: undefined, height: undefined }
    : { width: window.innerWidth, height: window.innerHeight };
}

export default function useWindowSize() {
  const [size, setSize] = useState(measure);
  useEffect(() => {
    const resize = () => {
      const next = measure();
      setSize(current => current.width === next.width && current.height === next.height ? current : next);
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);
  return size;
}`,
  }),
];

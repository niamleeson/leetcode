import * as React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { greatFrontendChallenges } from './index';
import { loadSolution } from './testUtils';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const expectedTitles = `Accordion III
Analog Clock
Auth Code Input
Birth Year Histogram
Connect Four
Contact Form
Counter
Data Table IV
Dice Roller
Digital Clock
File Explorer III
Flight Booker
Generate Table
Grid Lights
Holy Grail
Image Carousel III
Job Board
Like Button
Memory Game
Modal Dialog IV
Mortgage Calculator
Nested Checkboxes
Pixel Art
Progress Bar
Progress Bars IV
Selectable Cells
Signup Form
Star Rating
Stopwatch
Tabs III
Temperature Converter
Tic-tac-toe II
Todo List
Traffic Light
Transfer List II
Tweet
Undoable Counter
Users Database
Whack-A-Mole
Wordle
useArray
useBoolean II
useBreakpoint
useClickAnywhere
useClickOutside
useCountdown
useCounter II
useCycle
useDebounce
useDefault
useEffectOnce
useEventListener
useFocus
useHover
useIdle
useInputControl
useInterval
useKeyPress
useMap
useMediaQuery
useMediatedState
useObject
usePrevious
useQuery
useSet
useStateWithReset
useStep
useThrottle
useTimeout
useToggle
useWindowSize`.split('\n');

describe('GreatFrontEnd catalog', () => {
  it('contains exactly the 71 requested titles, with no lower-level variants', () => {
    expect(greatFrontendChallenges.map(item => item.title).sort()).toEqual([...expectedTitles].sort());
    expect(new Set(greatFrontendChallenges.map(item => item.slug)).size).toBe(71);
    expect(greatFrontendChallenges.filter(item => /^use[A-Z]/.test(item.title))).toHaveLength(31);
  });

  it.each(greatFrontendChallenges)('$title provides a self-contained solution and practice contract', challenge => {
    expect(challenge.slug).toMatch(/^gfe-/);
    expect(challenge.collection).toBe('GreatFrontEnd');
    expect(challenge.prompt).toBeTruthy();
    expect(challenge.requirements.length).toBeGreaterThan(0);
    expect(challenge.steps.length).toBeGreaterThan(0);
    expect(challenge.testCases.length).toBeGreaterThan(0);
    expect(challenge.example.actions).toBeTruthy();
    expect(challenge.example.result).toBeTruthy();
    expect(challenge.sourceUrl).toMatch(/^https:\/\/www\.greatfrontend\.com\//);
    expect(loadSolution(challenge.code).default).toBeDefined();
  });

  it.each(greatFrontendChallenges.filter(item => !/^use[A-Z]/.test(item.title)))('$title renders with its included defaults', async challenge => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline test')));
    const Component = loadSolution(challenge.code).default;
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(Component)).container;
    });
    expect(container!.childElementCount).toBeGreaterThan(0);
  });
});

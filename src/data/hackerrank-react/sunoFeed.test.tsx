import * as React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { loadSolution } from './greatfrontend/testUtils';
import { sunoFeedChallenge } from './sunoFeed';

class FeedObserver {
  static instances: FeedObserver[] = [];
  targets: Element[] = [];
  observe = vi.fn((target: Element) => this.targets.push(target));
  disconnect = vi.fn();

  constructor(private callback: IntersectionObserverCallback) {
    FeedObserver.instances.push(this);
  }

  emit(updates: [Element, number][]) {
    this.callback(updates.map(([target, ratio]) => ({
      target,
      intersectionRatio: ratio,
      isIntersecting: ratio > 0,
    }) as IntersectionObserverEntry), this as unknown as IntersectionObserver);
  }
}

const MediaFeed = loadSolution(sunoFeedChallenge.code).default as React.ComponentType;
let playing: Set<HTMLMediaElement>;

beforeEach(() => {
  playing = new Set();
  FeedObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FeedObserver);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    playing.add(this);
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    playing.delete(this);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function getFeed() {
  return {
    observer: FeedObserver.instances[FeedObserver.instances.length - 1],
    cards: screen.getAllByRole('article'),
    videos: ['Flower', 'Rabbit', 'Sintel'].map(title => (
      screen.getByLabelText(title + ' video') as HTMLVideoElement
    )),
  };
}

async function intersect(observer: FeedObserver, updates: [Element, number][]) {
  await act(async () => observer.emit(updates));
}

describe('Suno media feed displayed solution', () => {
  it('renders real sample sources, native controls, and independently toggled accessible likes', () => {
    render(<MediaFeed />);
    const { videos, cards, observer } = getFeed();
    const feed = screen.getByRole('region', { name: 'Media feed' });
    expect(feed).toHaveAttribute('tabindex', '0');
    expect(feed).toHaveStyle({ overflowY: 'auto', scrollSnapType: 'y mandatory' });
    expect(observer.targets).toEqual(cards);
    for (const video of videos) {
      expect(video).toHaveAttribute('controls');
      expect(video).toHaveAttribute('playsinline');
      expect(video.src).toMatch(/^https:\/\/(interactive-examples\.mdn\.mozilla\.net|mdn\.github\.io)\//);
      expect(video.muted).toBe(true);
    }
    const flower = screen.getByRole('button', { name: 'Like Flower' });
    const rabbit = screen.getByRole('button', { name: 'Like Rabbit' });
    fireEvent.click(flower);
    expect(flower).toHaveAttribute('aria-pressed', 'true');
    expect(rabbit).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(rabbit);
    fireEvent.click(flower);
    expect(flower).toHaveAttribute('aria-pressed', 'false');
    expect(rabbit).toHaveAttribute('aria-pressed', 'true');
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it('combines partial observer updates, breaks ties predictably, and pauses offscreen clips', async () => {
    render(<MediaFeed />);
    const { observer, cards, videos } = getFeed();
    await intersect(observer, [[cards[0], 0.75], [cards[1], 0.25], [cards[2], 0]]);
    expect([...playing]).toEqual([videos[0]]);
    // The callback omits Flower; its stored ratio must remain part of the decision.
    await intersect(observer, [[cards[1], 0.5]]);
    expect([...playing]).toEqual([videos[0]]);
    await intersect(observer, [[cards[0], 0.25], [cards[1], 0.75]]);
    expect([...playing]).toEqual([videos[1]]);
    await intersect(observer, [[cards[0], 0.75]]);
    expect([...playing]).toEqual([videos[0]]);
    await intersect(observer, cards.map(card => [card, 0]));
    expect(playing.size).toBe(0);
  });

  it('pauses while hidden and mutes automatic restarts after the user enables sound', async () => {
    render(<MediaFeed />);
    const { observer, cards, videos } = getFeed();
    await intersect(observer, [[cards[0], 1]]);
    videos[0].muted = false;
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(playing.size).toBe(0);
    await intersect(observer, [[cards[0], 0], [cards[1], 1]]);
    expect(playing.size).toBe(0);
    videos[1].muted = false;
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    await act(async () => fireEvent(document, new Event('visibilitychange')));
    expect([...playing]).toEqual([videos[1]]);
    expect(videos[1].muted).toBe(true);
  });

  it('handles blocked autoplay and permits native playback only on the active clip', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
      new DOMException('Playback requires user interaction', 'NotAllowedError'),
    );
    render(<MediaFeed />);
    const { observer, cards, videos } = getFeed();
    await intersect(observer, [[cards[0], 1]]);
    expect(playing.size).toBe(0);
    expect(videos[0]).toHaveAttribute('controls');
    playing.add(videos[0]);
    fireEvent.play(videos[0]);
    expect([...playing]).toEqual([videos[0]]);
    playing.add(videos[1]);
    fireEvent.play(videos[1]);
    expect([...playing]).toEqual([videos[0]]);
  });

  it('pauses a delayed play result after its clip becomes inactive', async () => {
    let finishPlay!: () => void;
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(function (this: HTMLMediaElement) {
      const video = this;
      return new Promise<void>(resolve => {
        finishPlay = () => { playing.add(video); resolve(); };
      });
    });
    render(<MediaFeed />);
    const { observer, cards, videos } = getFeed();
    await intersect(observer, [[cards[0], 1]]);
    await intersect(observer, [[cards[0], 0], [cards[1], 1]]);
    await act(async () => finishPlay());
    expect([...playing]).toEqual([videos[1]]);
  });

  it('cleans up subscriptions under StrictMode and stops a pending play after unmount', async () => {
    const removeListener = vi.spyOn(document, 'removeEventListener');
    let finishPlay!: () => void;
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(function (this: HTMLMediaElement) {
      const video = this;
      return new Promise<void>(resolve => {
        finishPlay = () => { playing.add(video); resolve(); };
      });
    });
    const page = render(<React.StrictMode><MediaFeed /></React.StrictMode>);
    expect(FeedObserver.instances).toHaveLength(2);
    expect(FeedObserver.instances[0].disconnect).toHaveBeenCalledOnce();
    const { observer, cards } = getFeed();
    await intersect(observer, [[cards[0], 1]]);
    page.unmount();
    expect(observer.disconnect).toHaveBeenCalledOnce();
    expect(removeListener.mock.calls.filter(([name]) => name === 'visibilitychange')).toHaveLength(2);
    await act(async () => finishPlay());
    expect(playing.size).toBe(0);
    const calls = vi.mocked(HTMLMediaElement.prototype.play).mock.calls.length;
    fireEvent(document, new Event('visibilitychange'));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(calls);
  });
});

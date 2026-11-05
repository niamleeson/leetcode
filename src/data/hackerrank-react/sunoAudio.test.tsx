import * as React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { sunoAudioChallenge } from './sunoAudio';
import { loadSolution } from './greatfrontend/testUtils';

const AudioPlaylist = loadSolution(sunoAudioChallenge.code).default;
const tracks = [
  { id: 'one', title: 'First track', src: '/audio/first.mp3' },
  { id: 'two', title: 'Second track', src: '/audio/second.mp3' },
  { id: 'three', title: 'Third track', src: '/audio/third.mp3' },
];

function currentAudio() {
  return screen.getByLabelText(/^Audio for /) as HTMLAudioElement;
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

beforeEach(() => {
  // jsdom has no media engine. Model the native controls' observable behavior.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: false });
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: true });
    this.dispatchEvent(new Event('pause'));
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Suno audio player displayed solution', () => {
  it('starts paused with native controls and marks the selected playlist row', () => {
    const page = render(<AudioPlaylist />);
    expect(screen.getByRole('heading', { name: 'T. rex roar' })).toBeInTheDocument();
    expect(currentAudio()).toHaveAttribute('controls');
    expect(currentAudio().paused).toBe(true);
    expect(currentAudio().src).toMatch(/^https:\/\//);
    expect(page.container.querySelectorAll('audio')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'T. rex roar' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'T. rex roar' })).toBeDisabled();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it('preserves native play and pause state across navigation and resets position', async () => {
    const page = render(<AudioPlaylist tracks={tracks} />);
    const first = currentAudio();
    await act(async () => { await first.play(); });
    first.currentTime = 12;
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Next' })); });
    const second = currentAudio();
    expect(second).not.toBe(first);
    expect(first.paused).toBe(true);
    expect(second).toHaveAttribute('src', '/audio/second.mp3');
    expect(second.currentTime).toBe(0);
    expect(second.paused).toBe(false);
    expect(page.container.querySelectorAll('audio')).toHaveLength(1);

    act(() => { second.pause(); });
    const callsBefore = vi.mocked(HTMLMediaElement.prototype.play).mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(currentAudio()).toHaveAttribute('src', '/audio/first.mp3');
    expect(currentAudio().currentTime).toBe(0);
    expect(currentAudio().paused).toBe(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(callsBefore);
  });

  it('starts a selected row and auto-advances once, then stops on the final track', async () => {
    render(<AudioPlaylist tracks={tracks} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Second track' })); });
    expect(currentAudio().paused).toBe(false);
    expect(screen.getByRole('button', { name: 'Second track' })).toHaveAttribute('aria-current', 'true');
    await act(async () => { fireEvent.ended(currentAudio()); });
    const finalAudio = currentAudio();
    expect(finalAudio).toHaveAttribute('src', '/audio/third.mp3');
    expect(finalAudio.paused).toBe(false);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    const callsBefore = vi.mocked(HTMLMediaElement.prototype.play).mock.calls.length;
    act(() => {
      finalAudio.pause(); // A real media element is paused when playback ends.
      fireEvent.ended(finalAudio);
    });
    expect(currentAudio()).toBe(finalAudio);
    expect(currentAudio().paused).toBe(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(callsBefore);
  });

  it('reports a current playback rejection and clears it after a native retry', async () => {
    render(<AudioPlaylist tracks={tracks} />);
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('Playback blocked'));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Second track' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Playback could not start');
    expect(currentAudio().paused).toBe(true);
    await act(async () => { await currentAudio().play(); });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(currentAudio().paused).toBe(false);
    fireEvent.error(currentAudio());
    expect(screen.getByRole('alert')).toHaveTextContent('Audio could not be loaded');
  });

  it('ignores a previous track’s rejected play promise after selecting another track', async () => {
    render(<AudioPlaylist tracks={tracks} />);
    const pending = deferred();
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole('button', { name: 'Second track' }));
    const oldAudio = currentAudio();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Third track' })); });
    await act(async () => { pending.reject(new Error('Old request aborted')); });
    expect(oldAudio.paused).toBe(true);
    expect(currentAudio()).toHaveAttribute('src', '/audio/third.mp3');
    expect(currentAudio().paused).toBe(false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not report an error when native Pause aborts a pending play request', async () => {
    render(<AudioPlaylist tracks={tracks} />);
    const pending = deferred();
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole('button', { name: 'Second track' }));
    await act(async () => {
      currentAudio().pause();
      pending.reject(new DOMException('Playback interrupted by pause', 'AbortError'));
    });
    expect(currentAudio().paused).toBe(true);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('pauses the previous audio element again if its play request succeeds after navigation', async () => {
    render(<AudioPlaylist tracks={tracks} />);
    const pending = deferred();
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(function (this: HTMLMediaElement) {
      return pending.promise.then(() => {
        Object.defineProperty(this, 'paused', { configurable: true, value: false });
      });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Second track' }));
    const oldAudio = currentAudio();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Third track' })); });
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    await act(async () => { pending.resolve(); });
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledOnce();
    expect(vi.mocked(HTMLMediaElement.prototype.pause).mock.contexts[0]).toBe(oldAudio);
    expect(oldAudio.paused).toBe(true);
    expect(currentAudio().paused).toBe(false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('pauses the captured audio on unmount and handles its pending rejection', async () => {
    const page = render(<React.StrictMode><AudioPlaylist tracks={tracks} /></React.StrictMode>);
    const pending = deferred();
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole('button', { name: 'Second track' }));
    const audio = currentAudio();
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    page.unmount();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledOnce();
    expect(vi.mocked(HTMLMediaElement.prototype.pause).mock.contexts[0]).toBe(audio);
    await act(async () => { pending.reject(new Error('Unmount aborted playback')); });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders an empty playlist without attempting media playback', () => {
    const page = render(<AudioPlaylist tracks={[]} />);
    expect(screen.getByText('No tracks available.')).toBeInTheDocument();
    expect(page.container.querySelector('audio')).toBeNull();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });
});

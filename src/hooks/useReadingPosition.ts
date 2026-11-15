import { useCallback, useLayoutEffect } from 'react';

// Keep each article and reading mode independent for this browsing session.
const positions = new Map<string, number>();

export function useReadingPosition(key: string | null, ready: boolean) {
  const rememberPosition = useCallback(() => {
    if (key && ready) positions.set(key, window.scrollY);
  }, [key, ready]);

  useLayoutEffect(() => {
    if (!key) return;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    // The iframe/notes must have their final height before restoring a deep position.
    // Ignore scroll events while loading: removing the old view can clamp scrollY.
    if (ready) {
      window.scrollTo({ top: positions.get(key) ?? 0, behavior: 'instant' });
      window.addEventListener('scroll', rememberPosition, { passive: true });
    }
    return () => {
      window.removeEventListener('scroll', rememberPosition);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [key, ready, rememberPosition]);

  return rememberPosition;
}

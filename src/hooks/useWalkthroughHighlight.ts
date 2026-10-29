import { useSyncExternalStore } from 'react';

const storageKey = 'neetcode-walkthrough-highlight-code';
const listeners = new Set<() => void>();
let fallback = true;
let unsaved: boolean | undefined;

function readHighlight() {
  if (unsaved !== undefined) return unsaved;
  try {
    return window.localStorage.getItem(storageKey) !== 'false';
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      unsaved = undefined;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function setHighlight(enabled: boolean) {
  fallback = enabled;
  try {
    window.localStorage.setItem(storageKey, String(enabled));
    unsaved = undefined;
  } catch {
    unsaved = enabled;
  }
  listeners.forEach(listener => listener());
}

export function useWalkthroughHighlight(): [boolean, (enabled: boolean) => void] {
  return [useSyncExternalStore(subscribe, readHighlight, () => true), setHighlight];
}

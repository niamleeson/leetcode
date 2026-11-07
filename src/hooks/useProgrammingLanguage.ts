import { useSyncExternalStore } from 'react';

export type ProgrammingLanguage = 'javascript' | 'python';
const storageKey = 'lc-language';
const legacyKeys = ['nc250-language', 'nc150-language', 'nc75-language'];
const changeEvent = 'lc-programming-language-change';
let memoryPreference: ProgrammingLanguage | undefined;

function isLanguage(value: unknown): value is ProgrammingLanguage {
  return value === 'javascript' || value === 'python';
}

function readLanguage(): ProgrammingLanguage {
  if (memoryPreference) return memoryPreference;
  try {
    // Existing shared preferences win over the older per-list settings.
    for (const key of [storageKey, ...legacyKeys]) {
      try {
        const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? 'null');
        if (isLanguage(value)) return value;
      } catch { /* Ignore an invalid saved value and try the next preference. */ }
    }
  } catch { /* Storage may be unavailable; the control still works in memory. */ }
  return 'javascript';
}

export function setProgrammingLanguage(language: ProgrammingLanguage) {
  if (!isLanguage(language)) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(language));
    memoryPreference = undefined;
  } catch { memoryPreference = language; }
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === storageKey || legacyKeys.includes(event.key)) {
      memoryPreference = undefined;
      notify();
    }
  };
  window.addEventListener(changeEvent, notify);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(changeEvent, notify);
    window.removeEventListener('storage', onStorage);
  };
}

export function useProgrammingLanguage(): [ProgrammingLanguage, typeof setProgrammingLanguage] {
  const language = useSyncExternalStore(subscribe, readLanguage, () => 'javascript' as const);
  return [language, setProgrammingLanguage];
}

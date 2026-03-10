import { useLocalStorage } from './useLocalStorage';

export interface GlossaryEntry {
  term: string;
  question: string;
  answer: string;
  createdAt: string;
}

export function useGlossary() {
  const [entries, setEntries] = useLocalStorage<GlossaryEntry[]>('lc-glossary', []);

  const addEntry = (entry: Omit<GlossaryEntry, 'createdAt'>) => {
    setEntries(prev => [
      { ...entry, createdAt: new Date().toISOString() },
      ...prev.filter(e => e.term.toLowerCase() !== entry.term.toLowerCase()),
    ]);
  };

  const removeEntry = (term: string) => {
    setEntries(prev => prev.filter(e => e.term.toLowerCase() !== term.toLowerCase()));
  };

  const findEntry = (term: string): GlossaryEntry | undefined => {
    return entries.find(e => e.term.toLowerCase() === term.toLowerCase());
  };

  return { entries, addEntry, removeEntry, findEntry };
}

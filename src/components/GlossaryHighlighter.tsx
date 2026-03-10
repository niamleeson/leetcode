import { useState } from 'react';
import Markdown from 'react-markdown';
import { useGlossary, GlossaryEntry } from '../hooks/useGlossary';

function GlossaryTooltip({ entry, onClose }: { entry: GlossaryEntry; onClose: () => void }) {
  return (
    <div className="absolute z-[9999] w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl shadow-black/40 p-3 mt-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-400">Glossary: {entry.term}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xs">&times;</button>
      </div>
      <p className="text-xs text-gray-500 mb-1 italic">Q: {entry.question}</p>
      <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded">
        <Markdown>{entry.answer}</Markdown>
      </div>
    </div>
  );
}

export default function GlossaryHighlighter({ text, className }: { text: string; className?: string }) {
  const { entries } = useGlossary();
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(null);

  if (!entries.length) {
    return <span className={className}>{text}</span>;
  }

  // Build regex from glossary terms, sorted by length (longest first to avoid partial matches)
  const sortedTerms = entries
    .map(e => e.term)
    .filter(t => t.length >= 2)
    .sort((a, b) => b.length - a.length);

  if (!sortedTerms.length) {
    return <span className={className}>{text}</span>;
  }

  const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const entry = entries.find(e => e.term.toLowerCase() === part.toLowerCase());
        if (entry) {
          return (
            <span key={i} className="relative inline">
              <span
                className="border-b border-dashed border-blue-500/50 text-blue-300 cursor-pointer hover:border-blue-400 hover:text-blue-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveEntry(activeEntry?.term === entry.term ? null : entry);
                }}
              >
                {part}
              </span>
              {activeEntry?.term.toLowerCase() === entry.term.toLowerCase() && (
                <GlossaryTooltip entry={entry} onClose={() => setActiveEntry(null)} />
              )}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

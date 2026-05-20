import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Markdown from 'react-markdown';
import { useGlossary, GlossaryEntry } from '../hooks/useGlossary';

function GlossaryTooltip({ entry, anchorRect, onClose }: {
  entry: GlossaryEntry;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Position: below the anchor, clamped to viewport
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tooltipWidth = 320;

    let top = anchorRect.bottom + 6;
    let left = anchorRect.left;

    // Clamp right edge
    if (left + tooltipWidth > vw - 16) {
      left = vw - tooltipWidth - 16;
    }
    // Clamp left edge
    if (left < 16) left = 16;

    // If no room below, show above
    if (top + 200 > vh) {
      top = Math.max(8, anchorRect.top - 200);
    }

    setPos({ top, left });
  }, [anchorRect]);

  // Close on click outside
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid the same click that opened it from closing it
    const timer = setTimeout(() => document.addEventListener('mousedown', handle), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handle); };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-[9999] w-80 max-h-[60vh] overflow-y-auto bg-gray-900 light:bg-white border border-gray-700 light:border-gray-300 rounded-lg shadow-2xl shadow-black/60 p-3"
      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-400 light:text-blue-700">Glossary: {entry.term}</span>
        <button onClick={onClose} className="text-gray-500 light:text-gray-500 hover:text-gray-300 light:hover:text-gray-700 text-sm leading-none">&times;</button>
      </div>
      <p className="text-xs text-gray-500 light:text-gray-500 mb-1 italic">Q: {entry.question}</p>
      <div className="text-sm text-gray-300 light:text-gray-700 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded">
        <Markdown>{entry.answer}</Markdown>
      </div>
    </div>,
    document.body
  );
}

export default function GlossaryHighlighter({ text, className }: { text: string; className?: string }) {
  const { entries } = useGlossary();
  const [activeTooltip, setActiveTooltip] = useState<{ entry: GlossaryEntry; rect: DOMRect } | null>(null);

  const handleClose = useCallback(() => setActiveTooltip(null), []);

  // In production builds, render plain text (no highlighting/tooltips)
  if (!import.meta.env.DEV) {
    return <span className={className}>{text}</span>;
  }

  if (!entries.length) {
    return <span className={className}>{text}</span>;
  }

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
            <span
              key={i}
              className="border-b border-dashed border-blue-500/50 text-blue-300 light:text-blue-700 cursor-pointer hover:border-blue-400 hover:text-blue-200 light:hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                // Toggle: if same term is already open, close it
                if (activeTooltip?.entry.term.toLowerCase() === entry.term.toLowerCase()) {
                  setActiveTooltip(null);
                } else {
                  setActiveTooltip({ entry, rect });
                }
              }}
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}

      {activeTooltip && (
        <GlossaryTooltip
          entry={activeTooltip.entry}
          anchorRect={activeTooltip.rect}
          onClose={handleClose}
        />
      )}
    </span>
  );
}

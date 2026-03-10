import { useState, useRef, useEffect } from 'react';
import { useGlossary } from '../hooks/useGlossary';

const API_URL = 'http://localhost:3456/api/ask';

interface AskClaudePanelProps {
  highlighted: string;
  position: { top: number; left: number } | null;
  onClose: () => void;
}

export default function AskClaudePanel({ highlighted, position, onClose }: AskClaudePanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addEntry } = useGlossary();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setQuestion('');
    setAnswer('');
    setError('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [highlighted]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlighted, question: question.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Request failed');
      } else {
        setAnswer(data.answer);
        addEntry({ term: highlighted, question: question.trim(), answer: data.answer });
      }
    } catch {
      setError('Failed to connect to Claude server. Is it running on port 3456?');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!position) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-96 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl shadow-black/50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <span className="text-xs font-medium text-gray-400">Ask Claude</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm">
          &times;
        </button>
      </div>

      {/* Highlighted text */}
      <div className="px-3 py-2 border-b border-gray-800">
        <p className="text-xs text-gray-500 mb-1">Selected text:</p>
        <p className="text-sm text-blue-300 line-clamp-3 italic">"{highlighted}"</p>
      </div>

      {/* Question input */}
      <div className="p-3">
        <textarea
          ref={inputRef}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this text..."
          className="w-full bg-gray-800 text-sm text-gray-200 rounded-md border border-gray-700 px-3 py-2 resize-none focus:outline-none focus:border-blue-500 placeholder-gray-600"
          rows={2}
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-600">{loading ? '' : 'Cmd+Enter to submit'}</span>
          <button
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </div>
      </div>

      {/* Answer */}
      {answer && (
        <div className="px-3 pb-3">
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-md p-3">
            <p className="text-xs font-medium text-emerald-400 mb-1">Claude's answer:</p>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{answer}</p>
          </div>
          <p className="text-xs text-gray-600 mt-1">Saved to glossary</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 pb-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';
import { useGlossary } from '../hooks/useGlossary';

const API_URL = 'http://localhost:3456/api/ask';

interface AskClaudePanelProps {
  highlighted: string;
  position: { top: number; left: number } | null;
  onClose: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function AskClaudePanel({ highlighted, position, onClose, onLoadingChange }: AskClaudePanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addEntry } = useGlossary();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadingRef = useRef(false);

  // Keep ref in sync so event handlers see latest value
  loadingRef.current = loading;

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    setQuestion('');
    setAnswer('');
    setError('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [highlighted]);

  const safeClose = useCallback(() => {
    if (!loadingRef.current) onClose();
  }, [onClose]);

  // Close on click outside — but NOT while loading
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loadingRef.current) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const selection = window.getSelection()?.toString().trim();
        if (!selection || selection.length < 2) {
          onClose();
        }
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mouseup', handleClickOutside);
    }, 150);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [onClose]);

  // Close on Escape — but NOT while loading
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') safeClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [safeClose]);

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
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Ask Claude</span>
          {loading && (
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          )}
        </div>
        <button
          onClick={safeClose}
          disabled={loading}
          className="text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
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
          <span className="text-xs text-gray-600">
            {loading ? 'Waiting for Claude...' : 'Cmd+Enter to submit'}
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="px-3 pb-3">
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-md p-3 flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-500">Claude is thinking...</span>
          </div>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="px-3 pb-3">
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-md p-3">
            <p className="text-xs font-medium text-emerald-400 mb-1">Claude's answer:</p>
            <div className="text-sm text-gray-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800">
              <Markdown>{answer}</Markdown>
            </div>
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

import { useState } from 'react';
import Markdown from 'react-markdown';
import { useGlossary } from '../hooks/useGlossary';

export default function GlossaryPage() {
  const { entries, removeEntry } = useGlossary();
  const [search, setSearch] = useState('');

  const filtered = entries.filter(e =>
    e.term.toLowerCase().includes(search.toLowerCase()) ||
    e.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white light:text-gray-900">Glossary</h1>
        <p className="text-gray-400 light:text-gray-600 mt-1 text-sm">
          Terms you've asked Claude about. These appear as linked highlights throughout the app.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-gray-900 light:bg-white border border-gray-800 light:border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 light:text-gray-500">No glossary entries yet.</p>
          <p className="text-gray-600 light:text-gray-500 text-sm mt-1">
            Highlight any text in the app and ask Claude a question to create entries.
          </p>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search glossary..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 light:bg-white text-sm text-gray-200 light:text-gray-800 rounded-md border border-gray-800 light:border-gray-200 px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-600 light:placeholder-gray-500"
          />

          <p className="text-xs text-gray-500 light:text-gray-500">{filtered.length} entries</p>

          <div className="space-y-3">
            {filtered.map(entry => (
              <div key={entry.term + entry.createdAt} className="bg-gray-900 light:bg-white border border-gray-800 light:border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-blue-300 light:text-blue-700">{entry.term}</h3>
                    <p className="text-xs text-gray-500 light:text-gray-500 mt-1 italic">Q: {entry.question}</p>
                    <div className="text-sm text-gray-300 light:text-gray-700 mt-2 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800">
                      <Markdown>{entry.answer}</Markdown>
                    </div>
                    <p className="text-xs text-gray-600 light:text-gray-500 mt-2">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.term)}
                    className="text-gray-600 light:text-gray-500 hover:text-red-400 light:hover:text-red-700 text-xs shrink-0 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

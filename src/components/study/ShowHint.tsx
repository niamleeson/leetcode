/**
 * ShowHint — a toggleable hint that reveals truncated canonical content
 * before the user submits their answer. Renders markdown properly.
 */
import { useState } from 'react';
import MarkdownContent from '../MarkdownContent';

interface Props {
  canonical: string;
  /** Max characters to show. Default 200. */
  maxChars?: number;
}

export default function ShowHint({ canonical, maxChars = 200 }: Props) {
  const [show, setShow] = useState(false);

  if (!canonical || canonical.trim().length === 0) return null;

  const truncated = canonical.length > maxChars
    ? canonical.slice(0, maxChars).trimEnd() + '...'
    : canonical;

  return (
    <div>
      <button
        onClick={() => setShow(!show)}
        className="text-xs text-gray-500 light:text-gray-500 hover:text-gray-300 light:hover:text-gray-700 underline underline-offset-2"
      >
        {show ? 'Hide hint' : 'Show hint'}
      </button>
      {show && (
        <div className="mt-2 border border-gray-800 light:border-gray-200 bg-gray-900/40 light:bg-gray-50 rounded-md p-3 max-h-48 overflow-y-auto">
          <MarkdownContent content={truncated} />
        </div>
      )}
    </div>
  );
}

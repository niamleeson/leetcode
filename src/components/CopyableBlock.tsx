import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import './copyableBlock.css';

type CopyStatus = 'idle' | 'copying' | 'copied' | 'error';

function copyWithSelection(text: string, doc: Document): boolean {
  if (typeof doc.execCommand !== 'function') return false;

  const active = doc.activeElement as HTMLElement | null;
  const selection = doc.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange())
    : [];
  const textarea = doc.createElement('textarea');
  textarea.value = text;
  textarea.readOnly = true;
  textarea.setAttribute('aria-label', 'Code to copy');
  textarea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;';
  doc.body.appendChild(textarea);

  try {
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return doc.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (active?.isConnected) active.focus({ preventScroll: true });
    if (selection) {
      selection.removeAllRanges();
      for (const range of ranges) selection.addRange(range);
    }
  }
}

export async function copyText(text: string, doc: Document, isCurrent: () => boolean = () => true): Promise<boolean> {
  if (!isCurrent()) return false;
  let copied = false;
  try {
    const clipboard = doc.defaultView?.navigator.clipboard;
    if (clipboard?.writeText) {
      await clipboard.writeText(text);
      copied = true;
    }
  } catch {
    // A browser may deny clipboard access while still permitting a selection copy.
  }
  if (!isCurrent()) return false;
  return copied || copyWithSelection(text, doc);
}

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const button = useRef<HTMLButtonElement>(null);
  const request = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useLayoutEffect(() => {
    request.current++;
    setStatus('idle');
    return () => {
      request.current++;
      clearTimeout(timer.current);
    };
  }, [text]);

  const copy = async () => {
    const current = ++request.current;
    const doc = button.current?.ownerDocument ?? document;
    clearTimeout(timer.current);
    setStatus('copying');
    const copied = await copyText(text, doc, () => current === request.current);
    if (current !== request.current) return;
    setStatus(copied ? 'copied' : 'error');
    if (copied) {
      timer.current = setTimeout(() => {
        if (current === request.current) setStatus('idle');
      }, 2000);
    }
  };

  return <>
    <button
      ref={button}
      type="button"
      className="copy-code-button"
      aria-label="Copy code"
      aria-busy={status === 'copying'}
      disabled={status === 'copying'}
      onClick={copy}
    >
      {status === 'copied' ? 'Copied!' : status === 'copying' ? 'Copying…' : 'Copy'}
    </button>
    {(status === 'copied' || status === 'error') && <p role="status" className={status === 'error' ? 'copy-code-error' : 'copy-code-status'}>
      {status === 'copied' ? 'Code copied.' : status === 'error' ? 'Copy failed. Select the code and copy it manually.' : ''}
    </p>}
  </>;
}

export default function CopyableBlock({ text, children, className = '' }: {
  text: string;
  children: ReactNode;
  className?: string;
}) {
  return <div className={`copyable-block${className ? ` ${className}` : ''}`}>
    {children}
    <CopyButton text={text} />
  </div>;
}

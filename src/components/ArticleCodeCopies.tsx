import { useLayoutEffect } from 'react';
import { copyText } from './CopyableBlock';
import copyStyles from './copyableBlock.css?inline';

// Saved article documents are outside React's tree and deliberately disallow
// scripts. Native listeners avoid React's inline onclick shims in that sandbox.
export default function ArticleCodeCopies({ content }: { content: HTMLElement | null }) {
  useLayoutEffect(() => {
    if (!content) return;
    const doc = content.ownerDocument;
    const style = doc.createElement('style');
    style.textContent = `${copyStyles}
      #markdown [data-reader-hidden-copy] { display: none !important; }
      #markdown .copyable-block > pre {
        overflow-x: auto !important;
        min-width: 0 !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
    `;
    doc.head.appendChild(style);

    const cleanups = [...content.querySelectorAll<HTMLPreElement>('pre')].map(pre => {
      // Saved code panels contain an inert, unlabeled clipboard-icon button.
      const originalButtons = [...(pre.closest('.code-display-base')?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
      originalButtons.forEach(button => button.setAttribute('data-reader-hidden-copy', ''));
      const wrapper = doc.createElement('div');
      wrapper.className = 'copyable-block';
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'copy-code-button';
      button.setAttribute('aria-label', 'Copy code');
      button.textContent = 'Copy';
      const status = doc.createElement('p');
      status.setAttribute('role', 'status');
      status.className = 'copy-code-status';
      // Read before controls exist: preserve source whitespace and exclude labels.
      const text = pre.textContent ?? '';
      pre.before(wrapper);
      wrapper.append(pre, button, status);
      let active = true;
      let request = 0;
      let timer: ReturnType<typeof setTimeout>;
      const copy = async () => {
        const current = ++request;
        const isCurrent = () => active && request === current;
        clearTimeout(timer);
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        button.textContent = 'Copying…';
        status.textContent = '';
        const copied = await copyText(text, doc, isCurrent);
        if (!isCurrent()) return;
        button.disabled = false;
        button.setAttribute('aria-busy', 'false');
        button.textContent = copied ? 'Copied!' : 'Copy';
        status.className = copied ? 'copy-code-status' : 'copy-code-error';
        status.textContent = copied ? 'Code copied.' : 'Copy failed. Select the code and copy it manually.';
        if (copied) timer = setTimeout(() => {
          if (!isCurrent()) return;
          button.textContent = 'Copy';
          status.textContent = '';
        }, 2000);
      };
      button.addEventListener('click', copy);
      return () => {
        active = false;
        request++;
        clearTimeout(timer);
        button.removeEventListener('click', copy);
        wrapper.before(pre);
        wrapper.remove();
        originalButtons.forEach(button => button.removeAttribute('data-reader-hidden-copy'));
      };
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
      style.remove();
    };
  }, [content]);

  return null;
}

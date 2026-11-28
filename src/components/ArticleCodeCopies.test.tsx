import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import ArticleCodeCopies from './ArticleCodeCopies';

afterEach(() => { cleanup(); document.querySelectorAll('iframe').forEach(frame => frame.remove()); });

it('adds one working copy control per saved code block, preserves syntax DOM, and cleans up', async () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  doc.body.innerHTML = '<div id="markdown"><div class="code-display-base"><div id="original"><pre><code>  <span>SELECT</span> a &lt; b;\n\n</code></pre></div><button id="saved-copy"><svg></svg></button></div><pre>plain\n  text\n</pre></div>';
  const content = doc.getElementById('markdown')!;
  const source = content.querySelector('pre')!;
  const token = source.querySelector('span');
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(frame.contentWindow!.navigator, 'clipboard', { configurable: true, value: { writeText } });

  const page = render(<ArticleCodeCopies content={content} />);
  const buttons = within(content).getAllByRole('button', { name: 'Copy code' });
  expect(buttons).toHaveLength(2);
  expect(source.querySelector('span')).toBe(token);
  expect(content.querySelectorAll('.copyable-block')).toHaveLength(2);
  expect(doc.getElementById('saved-copy')?.hasAttribute('data-reader-hidden-copy')).toBe(true);
  fireEvent.click(buttons[0]);
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('  SELECT a < b;\n\n'));
  expect(within(content).getByText('Copied!')).toBeTruthy();

  page.rerender(<ArticleCodeCopies content={content} />);
  expect(within(content).getAllByRole('button', { name: 'Copy code' })).toHaveLength(2);
  page.unmount();
  expect(source.parentElement?.id).toBe('original');
  expect(content.querySelector('.copyable-block')).toBeNull();
  expect(doc.head.querySelector('style')).toBeNull();
  expect(doc.getElementById('saved-copy')?.hasAttribute('data-reader-hidden-copy')).toBe(false);
  expect(source.textContent).toBe('  SELECT a < b;\n\n');
});

it('does not run fallback copying after leaving an article while clipboard access is pending', async () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  doc.body.innerHTML = '<div id="markdown"><pre>source</pre></div>';
  const content = doc.getElementById('markdown')!;
  let reject!: (reason: Error) => void;
  const writeText = vi.fn(() => new Promise<void>((_, fail) => { reject = fail; }));
  Object.defineProperty(frame.contentWindow!.navigator, 'clipboard', { configurable: true, value: { writeText } });
  const execCommand = vi.fn().mockReturnValue(true);
  Object.defineProperty(doc, 'execCommand', { configurable: true, value: execCommand });
  const page = render(<ArticleCodeCopies content={content} />);
  fireEvent.click(within(content).getByRole('button', { name: 'Copy code' }));
  page.unmount();
  reject(new Error('Denied'));
  await Promise.resolve();
  await Promise.resolve();
  expect(execCommand).not.toHaveBeenCalled();
  expect(content.querySelector('button')).toBeNull();
});

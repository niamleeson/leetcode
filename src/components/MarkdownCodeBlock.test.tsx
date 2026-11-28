import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReactMarkdown from 'react-markdown';
import MarkdownCodeBlock from './MarkdownCodeBlock';
import MarkdownContent from './MarkdownContent';
import { RichText } from './CatalogProblemContent';

vi.mock('mermaid', () => ({ default: { initialize: vi.fn(), render: vi.fn(async () => ({ svg: '<svg aria-label="Test diagram"></svg>' })) } }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function clipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard);
  return writeText;
}

// jsdom has no system clipboard, so give each test a configurable browser surface.
Object.defineProperty(navigator, 'clipboard', { configurable: true, get: () => undefined });

it('copies a fenced block exactly, including indentation, blank lines, and final newline', async () => {
  const writeText = clipboard();
  const source = '  first = 1  \n\n\tsecond = first + 2\n';
  const page = render(<ReactMarkdown components={{ pre: MarkdownCodeBlock }}>{`Inline \`first\`.\n\n\`\`\`python\n${source}\`\`\``}</ReactMarkdown>);
  expect(screen.getAllByRole('button', { name: 'Copy code' })).toHaveLength(1);
  expect(page.container.querySelector('pre code')?.textContent).toBe(source);
  fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(source));
});

it('preserves sanitized rich HTML inside raw pre blocks while copying their decoded text', async () => {
  const writeText = clipboard();
  const page = render(<RichText text={'<pre><strong>Input:</strong>  a &lt; b\n  next\n</pre><script>bad()</script>'} />);
  expect(page.container.querySelector('pre strong')?.textContent).toBe('Input:');
  expect(page.container.querySelector('script')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('Input:  a < b\n  next\n'));
});

it('keeps Mermaid diagrams rendered and inline code unchanged without copy buttons', async () => {
  const page = render(<MarkdownContent content={'Inline `value`.\n\n```mermaid\ngraph TD\n A --> B\n```'} />);
  await waitFor(() => expect(page.container.querySelector('svg[aria-label="Test diagram"]')).toBeTruthy());
  expect(page.container.querySelector('code')?.textContent).toBe('value');
  expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
  expect(page.container.querySelector('pre')).toBeNull();
});

import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import WalkthroughCode from './WalkthroughCode';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('preserves multiline syntax and source text while toggling step highlights', () => {
  const code = '/* first\nsecond */\nconst message = `first\nsecond`;\n';
  const page = render(<WalkthroughCode code={code} lines={[2, 4]} enabled />);
  const sourceText = () => Array.from(page.container.querySelectorAll('.traversal-line-content')).map(line => line.textContent).join('\n');
  expect(sourceText()).toBe(code);
  expect(page.container.querySelector('[data-line="2"] .token.comment')).toBeTruthy();
  expect(page.container.querySelectorAll('[aria-current="step"]')).toHaveLength(2);
  page.rerender(<WalkthroughCode code={code} lines={[2, 4]} enabled={false} />);
  expect(page.container.querySelectorAll('[aria-current="step"]')).toHaveLength(0);
  expect(sourceText()).toBe(code);
});

it('uses Python syntax while preserving indentation, multiline strings and exact line numbers', () => {
  const code = 'def solve(value):\n    """First line\n    second line"""\n    return value is None\n';
  const page = render(<WalkthroughCode code={code} lines={[4]} enabled language="python" />);
  expect(page.getByLabelText('Walkthrough Python code')).toBeTruthy();
  expect(page.queryByLabelText('Walkthrough JavaScript code')).toBeNull();
  expect([...page.container.querySelectorAll('.traversal-line-content')].map(line => line.textContent).join('\n')).toBe(code);
  expect(page.container.querySelector('[data-line="4"][aria-current="step"] .token.keyword')?.textContent).toBe('return');
  expect(page.container.querySelector('code')?.className).toBe('language-python');
});

it('copies the original source without line numbers or active-line labels', async () => {
  const code = 'def solve(value):\n    # Keep indentation.\n    return value\n';
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  const page = render(<WalkthroughCode code={code} lines={[3]} enabled language="python" />);
  fireEvent.click(page.getByRole('button', { name: 'Copy code' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(code));
  expect(page.container.querySelector('[data-line="3"][aria-current="step"]')).toBeTruthy();
  expect(page.container.querySelectorAll('.traversal-line-number')).toHaveLength(4);
});

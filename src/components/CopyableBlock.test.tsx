import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import CodeBlock from './CodeBlock';
import CopyableBlock from './CopyableBlock';

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const execDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand');
const setClipboard = (writeText?: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: writeText ? { writeText } : undefined });
};
const setExecCommand = (copy: () => boolean) => {
  const command = vi.fn(copy);
  Object.defineProperty(document, 'execCommand', { configurable: true, value: command });
  return command;
};
const clickCopy = async () => {
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy code' })); });
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else Reflect.deleteProperty(navigator, 'clipboard');
  if (execDescriptor) Object.defineProperty(document, 'execCommand', execDescriptor);
  else Reflect.deleteProperty(document, 'execCommand');
});

it('copies exact source whitespace without syntax markup or control labels', async () => {
  const source = '\n\tconst text = "<tag>";  \n  return text;\n';
  const writeText = vi.fn().mockResolvedValue(undefined);
  setClipboard(writeText);
  const { container } = render(<CodeBlock code={source} language="javascript" />);
  expect(screen.queryByRole('status')).toBeNull();
  expect(container.querySelector('pre code')?.textContent).toBe(source);
  expect(container.querySelector('.token.keyword')).toBeTruthy();
  expect(container.querySelector('pre button')).toBeNull();
  await clickCopy();
  expect(writeText).toHaveBeenCalledExactlyOnceWith(source);
  expect(screen.getByRole('button', { name: 'Copy code' }).textContent).toBe('Copied!');
  expect(screen.getByRole('status').textContent).toBe('Code copied.');
  expect(container.querySelector('pre code')?.textContent).toBe(source);
});

it('copies supplied source rather than line numbers or other displayed controls', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  setClipboard(writeText);
  render(<CopyableBlock text="return 4;"><pre>1 return 4;<span>Current line</span></pre></CopyableBlock>);
  await clickCopy();
  expect(writeText).toHaveBeenCalledExactlyOnceWith('return 4;');
});

it('waits for clipboard success before reporting copied and resets feedback after two seconds', async () => {
  vi.useFakeTimers();
  let resolve!: () => void;
  setClipboard(() => new Promise<void>(done => { resolve = done; }));
  render(<CodeBlock code="print(1)" />);
  await clickCopy();
  const button = screen.getByRole('button', { name: 'Copy code' }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  expect(button.textContent).toBe('Copying…');
  expect(screen.queryByRole('status')).toBeNull();
  await act(async () => { resolve(); });
  expect(button.disabled).toBe(false);
  expect(button.textContent).toBe('Copied!');
  act(() => { vi.advanceTimersByTime(2000); });
  expect(button.textContent).toBe('Copy');
  expect(screen.queryByRole('status')).toBeNull();
});

it('copies the newly selected language and ignores completion from an old source', async () => {
  let resolveOld!: () => void;
  const writeText = vi.fn()
    .mockImplementationOnce(() => new Promise<void>(done => { resolveOld = done; }))
    .mockResolvedValue(undefined);
  setClipboard(writeText);
  const page = render(<CodeBlock code="print(1)" language="python" />);
  await clickCopy();
  page.rerender(<CodeBlock code="console.log(1);" language="javascript" />);
  expect(screen.getByRole('button', { name: 'Copy code' }).textContent).toBe('Copy');
  await act(async () => { resolveOld(); });
  expect(screen.queryByRole('status')).toBeNull();
  await clickCopy();
  expect(writeText.mock.calls.map(call => call[0])).toEqual(['print(1)', 'console.log(1);']);
  expect(page.container.querySelector('code')?.className).toContain('language-javascript');
  expect(screen.getByRole('status').textContent).toBe('Code copied.');
  page.rerender(<CodeBlock code="print(2)" language="python" />);
  expect(screen.queryByRole('status')).toBeNull();
});

it('resets feedback when the language changes even if the source text is identical', async () => {
  setClipboard(vi.fn().mockResolvedValue(undefined));
  const page = render(<CodeBlock code="value = 1" language="python" />);
  await clickCopy();
  expect(screen.getByRole('status').textContent).toBe('Code copied.');
  page.rerender(<CodeBlock code="value = 1" language="javascript" />);
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.getByRole('button', { name: 'Copy code' }).textContent).toBe('Copy');
});

it('falls back to a selection copy when clipboard access is unavailable, restoring focus', async () => {
  setClipboard();
  const source = '  first\n\tsecond\n';
  const command = setExecCommand(() => {
    const field = document.activeElement as HTMLTextAreaElement;
    expect(field.tagName).toBe('TEXTAREA');
    expect(field.value).toBe(source);
    expect(field.selectionStart).toBe(0);
    expect(field.selectionEnd).toBe(source.length);
    return true;
  });
  render(<CodeBlock code={source} />);
  const button = screen.getByRole('button', { name: 'Copy code' });
  button.focus();
  await clickCopy();
  expect(command).toHaveBeenCalledExactlyOnceWith('copy');
  expect(document.activeElement).toBe(button);
  expect(document.querySelector('textarea')).toBeNull();
  expect(screen.getByRole('status').textContent).toBe('Code copied.');
});

it('uses the fallback after clipboard denial and never claims a failed copy succeeded', async () => {
  setClipboard(vi.fn().mockRejectedValue(new Error('Permission denied')));
  const command = setExecCommand(() => false);
  render(<CodeBlock code="return 1" />);
  await clickCopy();
  expect(command).toHaveBeenCalledExactlyOnceWith('copy');
  expect(screen.getByRole('button', { name: 'Copy code' }).textContent).toBe('Copy');
  expect(screen.getByRole('status').textContent).toBe('Copy failed. Select the code and copy it manually.');
  expect(document.querySelector('textarea')).toBeNull();
  command.mockReturnValue(true);
  await clickCopy();
  expect(screen.getByRole('status').textContent).toBe('Code copied.');
});

it('reports failure when neither clipboard method is available', async () => {
  setClipboard();
  Reflect.deleteProperty(document, 'execCommand');
  render(<CodeBlock code="return 1" />);
  await clickCopy();
  expect(screen.getByRole('status').textContent).toContain('Copy failed.');
  expect(screen.getByRole('button', { name: 'Copy code' }).textContent).toBe('Copy');
});

it('does not run a stale fallback after unmounting', async () => {
  let reject!: (reason: Error) => void;
  setClipboard(() => new Promise<void>((_, fail) => { reject = fail; }));
  const command = setExecCommand(() => true);
  const page = render(<CodeBlock code="old source" />);
  await clickCopy();
  page.unmount();
  await act(async () => { reject(new Error('Permission denied')); });
  expect(command).not.toHaveBeenCalled();
  expect(document.querySelector('textarea')).toBeNull();
});

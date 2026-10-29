import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import WalkthroughCode from './WalkthroughCode';

afterEach(cleanup);

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

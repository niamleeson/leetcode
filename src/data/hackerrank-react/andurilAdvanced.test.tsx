import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { andurilAdvancedChallenges } from './andurilAdvanced';

function loadSolution(slug: string): Record<string, any> {
  const challenge = andurilAdvancedChallenges.find(item => item.slug === slug)!;
  const compiled = ts.transpileModule(challenge.code, {
    fileName: `${slug}.jsx`,
    reportDiagnostics: true,
    compilerOptions: {
      allowJs: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const errors = compiled.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) throw new Error(errors.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
  const exports = {};
  const require = (name: string) => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return jsxRuntime;
    throw new Error(`Unexpected dependency: ${name}`);
  };
  new Function('require', 'exports', compiled.outputText)(require, exports);
  return exports;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Anduril array utilities', () => {
  const { flatten, mapArray, reduceArray } = loadSolution('anduril-array-utilities');

  it('flattens only to the requested depth, skips visited holes, and leaves the source intact', () => {
    const nested = [1, [2, [3]], 4];
    expect(flatten(nested, 0)).toEqual(nested);
    expect(flatten(nested)).toEqual([1, 2, [3], 4]);
    expect(flatten(nested, 2)).toEqual([1, 2, 3, 4]);
    expect(flatten(nested, Infinity)).toEqual([1, 2, 3, 4]);
    expect(nested).toEqual([1, [2, [3]], 4]);
    expect(flatten([, 1, [, undefined, 2]], Infinity)).toEqual([1, undefined, 2]);
    expect(flatten([])).toEqual([]);
    expect(() => flatten([1], -1)).toThrow(RangeError);
    expect(() => flatten([1], 1.5)).toThrow(RangeError);
    expect(() => flatten('abc')).toThrow(TypeError);
  });

  it('maps existing indexes while preserving holes, context, and captured length', () => {
    const source = new Array(3);
    source[1] = 4;
    const context = { multiplier: 3 };
    const callback = vi.fn(function (this: typeof context, value: number, index: number, original: number[]) {
      expect(original).toBe(source);
      expect(index).toBe(1);
      original.push(99);
      return value * this.multiplier;
    });
    const result = mapArray(source, callback, context);
    expect(result).toHaveLength(3);
    expect(0 in result).toBe(false);
    expect(result[1]).toBe(12);
    expect(2 in result).toBe(false);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('reduces sparse arrays and distinguishes omitted from explicit undefined initial values', () => {
    const sum = vi.fn((acc: number, value: number) => acc + value);
    expect(reduceArray([, 2, , 4], sum)).toBe(6);
    expect(sum).toHaveBeenCalledExactlyOnceWith(2, 4, 3, expect.any(Array));
    expect(reduceArray([, 2, , 4], (acc: number, value: number) => acc + value, 10)).toBe(16);
    expect(() => reduceArray([], sum)).toThrow(TypeError);
    expect(() => reduceArray(new Array(3), sum)).toThrow(TypeError);
    sum.mockClear();
    expect(reduceArray([], sum, undefined)).toBeUndefined();
    expect(sum).not.toHaveBeenCalled();
    const callback = vi.fn((acc: unknown, value: number) => [acc, value]);
    expect(reduceArray([8], callback, undefined)).toEqual([undefined, 8]);
    expect(callback).toHaveBeenCalledExactlyOnceWith(undefined, 8, 0, [8]);
  });

  it('does not visit values appended by a reduce callback', () => {
    const source = [1, 2];
    const seen: number[] = [];
    const result = reduceArray(source, (acc: number, value: number, index: number, original: number[]) => {
      expect(original).toBe(source);
      seen.push(index);
      original.push(10);
      return acc + value;
    }, 0);
    expect(result).toBe(3);
    expect(seen).toEqual([0, 1]);
  });
});

describe('Anduril autocomplete', () => {
  it('filters, wraps keyboard selection, exposes the active option, and commits it with Enter', () => {
    const Component = loadSolution('anduril-autocomplete').default;
    render(<Component />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'AL' } });
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Alpha', 'Alpine']);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Alpine' }).id);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('Alpine');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('dismisses on Escape and blur, ignores composing Enter, and selects with a pointer', () => {
    const Component = loadSolution('anduril-autocomplete').default;
    render(<Component />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    fireEvent.change(input, { target: { value: 'al' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(input).toHaveValue('al');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.focus(input);
    expect(input).not.toHaveAttribute('aria-activedescendant');
    fireEvent.blur(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.focus(input);
    const option = screen.getByRole('option', { name: 'Alpha' });
    const pointerDown = new Event('pointerdown', { bubbles: true, cancelable: true });
    fireEvent(option, pointerDown);
    expect(pointerDown.defaultPrevented).toBe(true);
    fireEvent.click(option);
    expect(input).toHaveValue('Alpha');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('limits results to eight and handles no matches, empty queries, and updated options', () => {
    const Component = loadSolution('anduril-autocomplete').default;
    const options = Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: `Choice ${index}` }));
    const view = render(<Component options={options} />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    fireEvent.change(input, { target: { value: 'choice' } });
    expect(screen.getAllByRole('option')).toHaveLength(8);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    view.rerender(<Component options={options.slice(0, 1)} />);
    expect(input).not.toHaveAttribute('aria-activedescendant');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
    fireEvent.change(input, { target: { value: 'missing' } });
    expect(screen.getByRole('status')).toHaveTextContent('No suggestions.');
    fireEvent.change(input, { target: { value: '   ' } });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
